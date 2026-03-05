using UltraCode.CSharp.Gpu;
using UltraCode.CSharp.Ipc;

namespace UltraCode.CSharp.Handlers;

public static class HandlerRegistration
{
    public static void RegisterHandlers(IServiceCollection services)
    {
        services.AddSingleton<GpuAccelerator>();
        services.AddSingleton<GpuMetricsKernel>();
        services.AddSingleton<ParseHandler>();
        services.AddSingleton<StatusHandler>();

        services.AddSingleton<IHandlerInitializer, HandlerInitializer>();
    }
}

public interface IHandlerInitializer
{
    void Initialize();
}

public sealed class HandlerInitializer : IHandlerInitializer
{
    private readonly RequestRouter _router;
    private readonly ParseHandler _parse;
    private readonly StatusHandler _status;

    public HandlerInitializer(
        RequestRouter router,
        ParseHandler parse,
        StatusHandler status)
    {
        _router = router;
        _parse = parse;
        _status = status;
    }

    public void Initialize()
    {
        _router.Register("parse", _parse.HandleParseAsync);
        _router.Register("parseBatch", _parse.HandleParseBatchAsync);
        _router.Register("status", _status.HandleStatusAsync);
    }
}
