using System.Security.Cryptography.X509Certificates;
using System.Text;
using AuthKit;
using AuthKit.Clave;
using AuthKit.Clave.AspNetCore;
using AuthKit.Demo.Host;
using AuthKit.Demo.Host.Components;
using AuthKit.Blazor;
using AuthKit.Supabase;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

var origin = Environment.GetEnvironmentVariable("DEMO_ORIGIN") ?? "http://localhost:5080";
var certificates = Environment.GetEnvironmentVariable("AUTHKIT_DEMO_CERTS") ?? FindCertificates();
var supabaseInternal = Environment.GetEnvironmentVariable("SUPABASE_INTERNAL_URL") ?? "http://127.0.0.1:54321";
var anonKey = Environment.GetEnvironmentVariable("SUPABASE_ANON_KEY") ?? "demo-anon-key-not-configured";

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls(Environment.GetEnvironmentVariable("DEMO_LISTEN") ?? origin);
builder.Services.AddRazorComponents().AddInteractiveServerComponents();
builder.Services.AddHttpClient();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "authkit-demo";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.SlidingExpiration = false;
        options.LoginPath = "/";
    });
builder.Services.AddAuthorization();
builder.Services.AddCascadingAuthenticationState();
builder.Services.AddAuthKitBlazor();

// Supabase is the IAuthProvider behind the generic components (email, magic link, reset, socials).
// The URL is this host: it proxies /auth/v1 to the local gotrue so the browser and the server use
// one origin and no CORS is involved.
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
    });

builder.Services.AddClave(
    clave =>
    {
        clave.Environment = ClaveEnvironment.Preproduction;
        clave.EntityId = origin + "/clave/metadata";
        clave.AcsUrl = origin + "/clave/acs";
        clave.GatewayEndpoint = new Uri(Environment.GetEnvironmentVariable("CLAVE_STUB_URL") ?? "http://127.0.0.1:5081/Proxy2");
        clave.ExpectedIssuer = clave.GatewayEndpoint.AbsoluteUri;
        clave.SigningCertificate = X509CertificateLoader.LoadPkcs12FromFile(
            Path.Combine(certificates, "sp.pfx"),
            password: null,
            X509KeyStorageFlags.Exportable);
        clave.PasarelaSigningCertificate = X509CertificateLoader.LoadCertificateFromFile(
            Path.Combine(certificates, "pasarela-public.crt"));
        clave.ProviderName = "AuthKit demo";
        clave.Tenant = "demo";
        clave.SubjectKey = Encoding.UTF8.GetBytes("authkit-demo-subject-key-32-bytes!!");
        clave.DefaultLevel = AuthAssuranceLevel.Substantial;
        clave.RequestedAttributes =
        [
            ClaveAttributes.PersonIdentifier,
            ClaveAttributes.GivenName,
            ClaveAttributes.FamilyName,
            ClaveAttributes.DateOfBirth
        ];
        clave.RequiredAttributes = [ClaveAttributes.PersonIdentifier];
    },
    http =>
    {
        http.RoutePrefix = "/clave";
        http.FailurePath = "/";
        http.ProviderRef = "demo/clave";
        http.ReturnUrlPolicy = ClaveReturnUrlPolicy.SameOrigin;
    });

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.UseAntiforgery();

app.MapGet("/config.json", (HttpContext context) => Results.Json(new
{
    supabaseUrl = $"{context.Request.Scheme}://{context.Request.Host}",
    supabaseAnonKey = anonKey,
    claveLoginPath = "/clave/login"
}));

app.MapGet("/session", (HttpContext context) =>
{
    if (context.User.Identity?.IsAuthenticated != true)
    {
        return Results.Json(new { authenticated = false });
    }

    string? Claim(string type) => context.User.FindFirst(type)?.Value;

    return Results.Json(new
    {
        authenticated = true,
        sub = Claim("sub"),
        name = Claim("name"),
        acr = Claim("acr"),
        amr = Claim("amr"),
        provider = Claim("authkit:provider"),
        tenant = Claim("authkit:tenant"),
        docType = Claim("authkit:doc_type")
    });
});

app.MapGet("/logout", async (HttpContext context) =>
{
    await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    return Results.Redirect("/");
});

app.MapClave(async (context, identity) =>
{
    // The host decides what a session is. AuthKit never signs anyone in.
    await context.SignInAsync(
        CookieAuthenticationDefaults.AuthenticationScheme,
        identity.ToClaimsPrincipal("demo/clave"));
    return Results.Redirect(identity.ReturnUrl ?? "/blazor");
});

app.MapSupabaseProxy(supabaseInternal);

app.MapRazorComponents<App>().AddInteractiveServerRenderMode();

app.Run();

static string FindCertificates()
{
    var directory = new DirectoryInfo(AppContext.BaseDirectory);
    for (var attempt = 0; attempt < 8 && directory is not null; attempt++)
    {
        var candidate = Path.Combine(directory.FullName, "certs");
        if (File.Exists(Path.Combine(candidate, "sp.pfx")))
        {
            return candidate;
        }

        directory = directory.Parent;
    }

    throw new AuthKitConfigurationException(
        "Certificates not found. Run scripts/gen-certs.sh before starting the host.");
}
