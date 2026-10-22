using System.Security.Cryptography.X509Certificates;
using AuthKit.Demo.ClaveStub;

var builder = WebApplication.CreateSlimBuilder(args);
var url = Environment.GetEnvironmentVariable("CLAVE_STUB_URL") ?? "http://127.0.0.1:5081";
builder.WebHost.UseUrls(url);
builder.Logging.AddSimpleConsole(options => options.SingleLine = true);

var certificates = Environment.GetEnvironmentVariable("AUTHKIT_DEMO_CERTS")
    ?? Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "certs");

var pasarela = X509CertificateLoader.LoadPkcs12FromFile(
    Path.Combine(certificates, "pasarela.pfx"),
    password: null,
    X509KeyStorageFlags.Exportable);
var attacker = X509CertificateLoader.LoadPkcs12FromFile(
    Path.Combine(certificates, "attacker.pfx"),
    password: null,
    X509KeyStorageFlags.Exportable);

var issuer = Environment.GetEnvironmentVariable("CLAVE_STUB_ISSUER") ?? $"{url.TrimEnd('/')}/Proxy2";

var app = builder.Build();
var stub = new ClaveStub(pasarela, attacker, issuer);

app.MapGet("/Proxy2", (HttpRequest request) => stub.Gateway(request));
app.MapPost("/authorize", (HttpRequest request) => stub.AuthorizeAsync(request));
app.MapGet("/health", () => stub.Health());

app.Run();
