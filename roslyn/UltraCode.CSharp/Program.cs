using System.CommandLine;
using System.CommandLine.Parsing;
using System.Diagnostics;
using Microsoft.Extensions.Hosting;
using UltraCode.CSharp.Ipc;
using UltraCode.CSharp.Services;

namespace UltraCode.CSharp;

public static class Program
{
    public const string ApplicationName = "UltraCode.CSharp";
    public const string ApplicationVersion = "3.8.0";

    private const int ParentCheckIntervalMs = 3000;

    public static async Task<int> Main(string[] args)
    {
        var pipeOption = new Option<string>("--pipe")
        {
            Description = "Named Pipe name for IPC communication.",
            Required = true,
        };

        var parentPidOption = new Option<int?>("--parent-pid")
        {
            Description = "Parent process PID for orphan detection.",
        };

        var slnOption = new Option<string?>("--sln")
        {
            Description = "Path to .sln file (reserved for future use).",
        };

        var logLevelOption = new Option<LogLevel>("--log-level")
        {
            Description = "Minimum log level.",
            DefaultValueFactory = _ => LogLevel.Information,
        };

        var rootCommand = new RootCommand("UltraCode.CSharp — Roslyn syntax parser addon")
        {
            pipeOption,
            parentPidOption,
            slnOption,
            logLevelOption,
        };

        var parseResult = rootCommand.Parse(args);

        string pipeName = parseResult.GetValue(pipeOption) ?? "UltraCode_Roslyn_default";
        int? parentPid = parseResult.GetValue(parentPidOption);
        LogLevel logLevel = parseResult.GetValue(logLevelOption);

        var builder = Host.CreateApplicationBuilder(new HostApplicationBuilderSettings
        {
            Args = args,
            DisableDefaults = true,
        });

        builder.Logging.ClearProviders();
        builder.Logging.SetMinimumLevel(logLevel);
        builder.Logging.AddConsole(opts =>
        {
            opts.LogToStandardErrorThreshold = LogLevel.Trace;
        });
        builder.Logging.AddFilter("Microsoft", LogLevel.Warning);

        // Register IPC infrastructure
        builder.Services.AddSingleton(new PipeServerOptions { PipeName = pipeName });
        builder.Services.AddSingleton<RequestRouter>();
        builder.Services.AddSingleton<PipeServer>();
        builder.Services.AddSingleton<AddonLifecycleService>();

        // Register handlers
        Handlers.HandlerRegistration.RegisterHandlers(builder.Services);

        var host = builder.Build();

        var loggerFactory = host.Services.GetRequiredService<ILoggerFactory>();
        var logger = loggerFactory.CreateLogger(ApplicationName);

        logger.LogInformation("[Addon] Starting {Name} v{Version}", ApplicationName, ApplicationVersion);
        logger.LogInformation("[Addon] Pipe: {PipeName}, ParentPID: {ParentPid}",
            pipeName, parentPid?.ToString() ?? "none");

        using var cts = new CancellationTokenSource();

        if (parentPid.HasValue)
        {
            _ = MonitorParentProcessAsync(parentPid.Value, cts, logger);
        }

        Console.CancelKeyPress += (_, e) =>
        {
            e.Cancel = true;
            cts.Cancel();
        };

        try
        {
            var lifecycle = host.Services.GetRequiredService<AddonLifecycleService>();
            await lifecycle.StartAsync(null, cts.Token);

            var pipeServer = host.Services.GetRequiredService<PipeServer>();
            await pipeServer.RunAsync(cts.Token);
        }
        catch (OperationCanceledException)
        {
            logger.LogInformation("[Addon] Shutdown requested.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[Addon] Fatal error");
            return 1;
        }

        return 0;
    }

    private static async Task MonitorParentProcessAsync(int parentPid, CancellationTokenSource cts, ILogger logger)
    {
        try
        {
            while (!cts.Token.IsCancellationRequested)
            {
                await Task.Delay(ParentCheckIntervalMs, cts.Token);

                if (!IsProcessRunning(parentPid))
                {
                    logger.LogWarning("[Addon] Parent process (PID: {Pid}) exited. Shutting down.", parentPid);
                    await cts.CancelAsync();
                    return;
                }
            }
        }
        catch (OperationCanceledException) { }
    }

    private static bool IsProcessRunning(int pid)
    {
        try
        {
            using var process = Process.GetProcessById(pid);
            process.Refresh();
            return !process.HasExited;
        }
        catch (ArgumentException) { return false; }
        catch (InvalidOperationException) { return false; }
    }
}
