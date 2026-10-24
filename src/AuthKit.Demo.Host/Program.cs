using AuthKit;
using AuthKit.Blazor;
using AuthKit.Demo.Host;
using AuthKit.Demo.Host.Components;
using AuthKit.Supabase;

var origin = Environment.GetEnvironmentVariable("DEMO_ORIGIN") ?? "http://localhost:5080";
var supabaseInternal = Environment.GetEnvironmentVariable("SUPABASE_INTERNAL_URL") ?? "http://127.0.0.1:54321";
var anonKey = Environment.GetEnvironmentVariable("SUPABASE_ANON_KEY") ?? "demo-anon-key-not-configured";

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls(Environment.GetEnvironmentVariable("DEMO_LISTEN") ?? origin);
builder.Services.AddRazorComponents().AddInteractiveServerComponents();
builder.Services.AddHttpClient();
builder.Services.AddAuthKitBlazor();

// Supabase is the only provider. The URL is this host: it proxies /auth/v1 to the local gotrue, so
// the browser and the server share one origin and no CORS is involved.
builder.Services.AddAuthKitSupabase(
    options =>
    {
        options.Url = origin;
        options.AnonKey = anonKey;
        options.RedirectTo = origin + "/callback";
        options.SocialProviders = [];
    },
    ui =>
    {
        ui.Theme = ui.Theme with
        {
            Primary = "#0b5cad",
            Radius = "10px"
        };

        // One catalog for the Blazor components and the Angular gallery: the browser fetches /pt.json.
        var messagesPath = Path.Combine(
            builder.Environment.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot"),
            "pt.json");
        if (File.Exists(messagesPath))
        {
            ui.Messages = AuthMessages.FromJson(File.ReadAllText(messagesPath));
        }
    });

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAntiforgery();

app.MapGet("/config.json", (HttpContext context) => Results.Json(new
{
    supabaseUrl = $"{context.Request.Scheme}://{context.Request.Host}",
    supabaseAnonKey = anonKey
}));

app.MapSupabaseProxy(supabaseInternal);

app.MapRazorComponents<App>().AddInteractiveServerRenderMode();

app.Run();
