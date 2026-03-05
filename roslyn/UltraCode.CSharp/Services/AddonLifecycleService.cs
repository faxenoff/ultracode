using UltraCode.CSharp.Handlers;
using UltraCode.CSharp.Ipc;

namespace UltraCode.CSharp.Services;

/// <summary>
/// Manages Addon lifecycle — Phase 1 only (syntax parsing via Roslyn).
/// Solution loading and semantic analysis are handled by the TS side.
/// </summary>
public sealed class AddonLifecycleService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<AddonLifecycleService> _logger;

    public int Phase { get; private set; }

    public AddonLifecycleService(
        IServiceProvider services,
        ILogger<AddonLifecycleService> logger)
    {
        _services = services;
        _logger = logger;
    }

    public Task StartAsync(string? slnPath, CancellationToken ct)
    {
        var initializer = _services.GetRequiredService<IHandlerInitializer>();
        initializer.Initialize();

        Phase = 1;
        _logger.LogInformation("[Lifecycle] Phase 1 — pipe ready, syntax parsing available.");

        return Task.CompletedTask;
    }
}
