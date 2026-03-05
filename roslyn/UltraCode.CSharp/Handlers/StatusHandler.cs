using System.Diagnostics;
using UltraCode.CSharp.Models;
using UltraCode.CSharp.Services;

namespace UltraCode.CSharp.Handlers;

/// <summary>
/// Handles "status" request — returns addon phase, memory usage, version.
/// </summary>
public sealed class StatusHandler
{
    private readonly AddonLifecycleService _lifecycle;
    private readonly ILogger<StatusHandler> _logger;

    public StatusHandler(
        AddonLifecycleService lifecycle,
        ILogger<StatusHandler> logger)
    {
        _lifecycle = lifecycle;
        _logger = logger;
    }

    public Task<object?> HandleStatusAsync(AddonRequest request, CancellationToken ct)
    {
        var process = Process.GetCurrentProcess();

        object result = new
        {
            phase = _lifecycle.Phase,
            memoryMB = Math.Round(process.WorkingSet64 / (1024.0 * 1024.0), 1),
            version = Program.ApplicationVersion,
            uptime = (DateTime.UtcNow - process.StartTime.ToUniversalTime()).TotalSeconds,
        };

        return Task.FromResult<object?>(result);
    }
}
