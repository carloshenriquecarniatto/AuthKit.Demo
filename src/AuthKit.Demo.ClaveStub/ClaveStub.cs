using System.Collections.Concurrent;
using System.IO.Compression;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Security.Cryptography.Xml;
using System.Text;
using System.Xml;

namespace AuthKit.Demo.ClaveStub;

/// <summary>
/// A local stand-in for the Cl@ve pasarela. It speaks the HTTP-Redirect binding on the way in and
/// the HTTP-POST binding on the way out, signs assertions with a test certificate, and never talks
/// to the real gateway. Test identities are deliberately boring; one of them is a downgrade and one
/// is signed with the wrong key, so the host's validation can be demonstrated.
/// </summary>
public sealed class ClaveStub
{
    private readonly ConcurrentDictionary<string, PendingRequest> _pending = new(StringComparer.Ordinal);
    private readonly X509Certificate2 _pasarela;
    private readonly X509Certificate2 _attacker;
    private readonly string _issuer;

    public ClaveStub(X509Certificate2 pasarela, X509Certificate2 attacker, string issuer)
    {
        _pasarela = pasarela;
        _attacker = attacker;
        _issuer = issuer;
    }

    public IResult Gateway(HttpRequest request)
    {
        var samlRequest = request.Query["SAMLRequest"].ToString();
        var relayState = request.Query["RelayState"].ToString();

        AuthnRequest parsed;
        try
        {
            parsed = AuthnRequest.Parse(Inflate(samlRequest));
        }
        catch (Exception exception) when (exception is FormatException or InvalidOperationException or XmlException)
        {
            return Results.Content(
                Page("Pedido inválido", "<p class=\"error\">O pedido SAML não pôde ser lido.</p>"),
                "text/html",
                Encoding.UTF8);
        }

        _pending[parsed.Id] = new PendingRequest(parsed, relayState);
        return Results.Content(RenderGateway(parsed, relayState), "text/html", Encoding.UTF8);
    }

    public async Task<IResult> AuthorizeAsync(HttpRequest request)
    {
        var form = await request.ReadFormAsync();
        var id = form["requestId"].ToString();
        var choice = form["identity"].ToString();

        if (!_pending.TryRemove(id, out var pending))
        {
            return Results.Content(
                Page("Pedido expirado", "<p class=\"error\">Este pedido já não está pendente. Volta à aplicação e tenta de novo.</p>"),
                "text/html",
                Encoding.UTF8);
        }

        if (choice == "cancel")
        {
            var origin = Origin(pending.Request.AcsUrl);
            return Results.Redirect($"{origin}/?error=federation_cancelled");
        }

        var identity = Identities.FirstOrDefault(candidate => candidate.Key == choice) ?? Identities[0];
        var certificate = identity.InvalidSignature ? _attacker : _pasarela;
        var level = identity.Downgrade ? "http://eidas.europa.eu/LoA/low" : pending.Request.Level;

        var response = SignedResponse.Build(
            pending,
            identity,
            level,
            DateTimeOffset.UtcNow,
            certificate,
            _issuer);

        return Results.Content(
            AutoPost(pending.Request.AcsUrl, response, pending.RelayState),
            "text/html",
            Encoding.UTF8);
    }

    public IResult Health() => Results.Json(new { ok = true, service = "clave-stub" });

    private static string RenderGateway(AuthnRequest request, string relayState)
    {
        var rows = string.Join(
            Environment.NewLine,
            Identities.Select(identity => $"""
                <form method="post" action="/authorize">
                  <input type="hidden" name="requestId" value="{Escape(request.Id)}" />
                  <input type="hidden" name="identity" value="{Escape(identity.Key)}" />
                  <button type="submit" class="{identity.Css}">
                    <span class="name">{Escape(identity.Name)}</span>
                    <span class="doc">{Escape(identity.Document)}</span>
                    <span class="note">{Escape(identity.Note)}</span>
                  </button>
                </form>
                """));

        var cancel = $"""
            <form method="post" action="/authorize">
              <input type="hidden" name="requestId" value="{Escape(request.Id)}" />
              <input type="hidden" name="identity" value="cancel" />
              <button type="submit" class="cancel">Cancelar e voltar</button>
            </form>
            """;

        return Page(
            "Cl@ve — gateway de teste",
            $"""
             <p class="lead">Escolhe uma identidade de teste. O pedido é <code>{Escape(request.Id)}</code>,
             nível pedido <code>{Escape(request.Level)}</code>.</p>
             <div class="identities">{rows}</div>
             <div class="cancel-row">{cancel}</div>
             <p class="foot">Isto não é o gateway real. Nenhum dado sai da tua máquina.</p>
             """);
    }

    private static string AutoPost(string acsUrl, string samlResponse, string relayState) => $"""
        <!doctype html>
        <html lang="pt">
        <head><meta charset="utf-8" /><title>A autenticar…</title></head>
        <body onload="document.forms[0].submit()">
          <form method="post" action="{Escape(acsUrl)}">
            <input type="hidden" name="SAMLResponse" value="{samlResponse}" />
            <input type="hidden" name="RelayState" value="{Escape(relayState)}" />
            <noscript><button type="submit">Continuar</button></noscript>
          </form>
        </body>
        </html>
        """;

    private static string Page(string title, string body) => $$"""
        <!doctype html>
        <html lang="pt">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{{Escape(title)}}</title>
          <style>
            :root { color-scheme: light; }
            body { margin: 0; font-family: system-ui, sans-serif; background: #eef2f8; color: #14213d; }
            .banner { background: #b00020; color: #fff; text-align: center; padding: 8px 16px; font-weight: 700; letter-spacing: .04em; }
            main { max-width: 720px; margin: 40px auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 12px 40px rgba(20,33,61,.12); }
            h1 { margin: 0 0 8px; font-size: 1.5rem; }
            .lead { color: #4a5568; }
            code { background: #eef2f8; padding: 2px 6px; border-radius: 4px; }
            .identities { display: grid; gap: 10px; margin: 24px 0; }
            .identities form { margin: 0; }
            button { width: 100%; text-align: left; border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 8px; padding: 14px 16px; cursor: pointer; font: inherit; display: grid; gap: 2px; }
            button:hover { border-color: #1d4ed8; background: #eff6ff; }
            .name { font-weight: 700; }
            .doc { color: #475569; font-size: .9rem; }
            .note { color: #64748b; font-size: .8rem; }
            .bad button { border-style: dashed; }
            .cancel { background: #fff; color: #b00020; text-align: center; border-color: #fecaca; }
            .error { color: #b00020; font-weight: 600; }
            .foot { color: #94a3b8; font-size: .8rem; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="banner">AMBIENTE DE TESTE — NÃO É O GATEWAY REAL</div>
          <main><h1>{{Escape(title)}}</h1>{{body}}</main>
        </body>
        </html>
        """;

    private static string Escape(string value) => System.Security.SecurityElement.Escape(value) ?? value;

    private static string Inflate(string base64)
    {
        using var input = new MemoryStream(Convert.FromBase64String(base64));
        using var deflate = new DeflateStream(input, CompressionMode.Decompress);
        using var reader = new StreamReader(deflate, Encoding.UTF8);
        return reader.ReadToEnd();
    }

    private static string Origin(string url) => new Uri(url).GetLeftPart(UriPartial.Authority);

    private sealed record PendingRequest(AuthnRequest Request, string RelayState);

    private sealed record TestIdentity(
        string Key,
        string Name,
        string Document,
        string Note,
        bool Downgrade = false,
        bool InvalidSignature = false)
    {
        public string Css => InvalidSignature ? "bad" : string.Empty;
    }

    private static readonly TestIdentity[] Identities =
    [
        new("dni", "María García López", "ES/ES/12345678Z", "DNI válido — nivel substantial"),
        new("nie", "Joan Ferrer Puig", "ES/ES/X1234567L", "NIE válido — nivel substantial"),
        new("cif", "Entitat Demo SL", "ES/ES/B12345678", "CIF de entidade"),
        new("downgrade", "Usuário com nível baixo", "ES/ES/12345678Z", "LoA low — deve ser recusado", Downgrade: true),
        new("bad-signature", "Assinatura inválida", "ES/ES/12345678Z", "Chave errada — deve ser recusada", InvalidSignature: true)
    ];

    private sealed record AuthnRequest(string Id, string AcsUrl, string Issuer, string Level)
    {
        public static AuthnRequest Parse(string xml)
        {
            var document = new XmlDocument { XmlResolver = null, PreserveWhitespace = false };
            document.LoadXml(xml);

            string Attribute(string name) =>
                document.DocumentElement?.GetAttribute(name)
                ?? throw new InvalidOperationException($"AuthnRequest has no {name}.");

            var level = document
                .GetElementsByTagName("AuthnContextClassRef", "urn:oasis:names:tc:SAML:2.0:assertion")
                .Item(0)?.InnerText ?? "http://eidas.europa.eu/LoA/substantial";

            return new AuthnRequest(
                Attribute("ID"),
                Attribute("AssertionConsumerServiceURL"),
                document.GetElementsByTagName("Issuer", "urn:oasis:names:tc:SAML:2.0:assertion").Item(0)?.InnerText ?? string.Empty,
                level);
        }
    }

    private static class SignedResponse
    {
        private const string Protocol = "urn:oasis:names:tc:SAML:2.0:protocol";
        private const string AssertionNs = "urn:oasis:names:tc:SAML:2.0:assertion";

        public static string Build(
            PendingRequest pending,
            TestIdentity identity,
            string level,
            DateTimeOffset now,
            X509Certificate2 certificate,
            string issuer)
        {
            var request = pending.Request;
            var assertionId = "_a" + Guid.NewGuid().ToString("N");
            var document = new XmlDocument();
            document.AppendChild(document.CreateXmlDeclaration("1.0", "UTF-8", null));

            var response = document.CreateElement("samlp", "Response", Protocol);
            response.SetAttribute("ID", "_r" + Guid.NewGuid().ToString("N"));
            response.SetAttribute("Version", "2.0");
            response.SetAttribute("IssueInstant", Instant(now));
            response.SetAttribute("Destination", request.AcsUrl);
            response.SetAttribute("InResponseTo", request.Id);
            document.AppendChild(response);

            Append(response, document, "Issuer", AssertionNs, issuer);
            var status = document.CreateElement("samlp", "Status", Protocol);
            var code = document.CreateElement("samlp", "StatusCode", Protocol);
            code.SetAttribute("Value", "urn:oasis:names:tc:SAML:2.0:status:Success");
            status.AppendChild(code);
            response.AppendChild(status);

            var assertion = document.CreateElement("saml", "Assertion", AssertionNs);
            assertion.SetAttribute("ID", assertionId);
            assertion.SetAttribute("Version", "2.0");
            assertion.SetAttribute("IssueInstant", Instant(now));
            response.AppendChild(assertion);

            Append(assertion, document, "Issuer", AssertionNs, issuer);

            var subject = document.CreateElement("saml", "Subject", AssertionNs);
            Append(subject, document, "NameID", AssertionNs, "demo-subject-" + identity.Key, "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent");
            var confirmation = document.CreateElement("saml", "SubjectConfirmation", AssertionNs);
            confirmation.SetAttribute("Method", "urn:oasis:names:tc:SAML:2.0:cm:bearer");
            var data = document.CreateElement("saml", "SubjectConfirmationData", AssertionNs);
            data.SetAttribute("NotOnOrAfter", Instant(now.AddMinutes(5)));
            data.SetAttribute("Recipient", request.AcsUrl);
            data.SetAttribute("InResponseTo", request.Id);
            confirmation.AppendChild(data);
            subject.AppendChild(confirmation);
            assertion.AppendChild(subject);

            var conditions = document.CreateElement("saml", "Conditions", AssertionNs);
            conditions.SetAttribute("NotBefore", Instant(now.AddMinutes(-1)));
            conditions.SetAttribute("NotOnOrAfter", Instant(now.AddMinutes(5)));
            var restriction = document.CreateElement("saml", "AudienceRestriction", AssertionNs);
            Append(restriction, document, "Audience", AssertionNs, request.Issuer);
            conditions.AppendChild(restriction);
            assertion.AppendChild(conditions);

            var statement = document.CreateElement("saml", "AuthnStatement", AssertionNs);
            statement.SetAttribute("AuthnInstant", Instant(now));
            statement.SetAttribute("SessionNotOnOrAfter", Instant(now.AddHours(1)));
            var context = document.CreateElement("saml", "AuthnContext", AssertionNs);
            Append(context, document, "AuthnContextClassRef", AssertionNs, level);
            statement.AppendChild(context);
            assertion.AppendChild(statement);

            var attributes = document.CreateElement("saml", "AttributeStatement", AssertionNs);
            AppendAttribute(attributes, document, "http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier", identity.Document);
            AppendAttribute(attributes, document, "http://eidas.europa.eu/attributes/naturalperson/CurrentGivenName", identity.Name.Split(' ')[0]);
            AppendAttribute(attributes, document, "http://eidas.europa.eu/attributes/naturalperson/CurrentFamilyName", string.Join(' ', identity.Name.Split(' ').Skip(1)));
            AppendAttribute(attributes, document, "http://eidas.europa.eu/attributes/naturalperson/DateOfBirth", "1980-05-17");
            assertion.AppendChild(attributes);

            Sign(document, assertion, assertionId, certificate);
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(document.OuterXml));
        }

        private static void Sign(XmlDocument document, XmlElement assertion, string assertionId, X509Certificate2 certificate)
        {
            using var rsa = certificate.GetRSAPrivateKey()
                ?? throw new InvalidOperationException("The stub certificate has no private key.");

            var signedXml = new SignedXml(document) { SigningKey = rsa };
            signedXml.SignedInfo!.CanonicalizationMethod = SignedXml.XmlDsigExcC14NTransformUrl;
            signedXml.SignedInfo!.SignatureMethod = SignedXml.XmlDsigRSASHA256Url;

            var reference = new Reference("#" + assertionId) { DigestMethod = SignedXml.XmlDsigSHA256Url };
            reference.AddTransform(new XmlDsigEnvelopedSignatureTransform());
            reference.AddTransform(new XmlDsigExcC14NTransform());
            signedXml.AddReference(reference);
            signedXml.KeyInfo = new KeyInfo();
            signedXml.KeyInfo.AddClause(new KeyInfoX509Data(certificate));
            signedXml.ComputeSignature();

            var signature = document.ImportNode(signedXml.GetXml(), true);
            var issuer = assertion.SelectSingleNode("*[local-name()='Issuer']")!;
            assertion.InsertAfter(signature, issuer);
        }

        private static void AppendAttribute(XmlElement parent, XmlDocument document, string name, string value)
        {
            var attribute = document.CreateElement("saml", "Attribute", AssertionNs);
            attribute.SetAttribute("Name", name);
            Append(attribute, document, "AttributeValue", AssertionNs, value);
            parent.AppendChild(attribute);
        }

        private static void Append(XmlElement parent, XmlDocument document, string name, string ns, string value, string? format = null)
        {
            var element = document.CreateElement("saml", name, ns);
            element.InnerText = value;
            if (format is not null)
            {
                element.SetAttribute("Format", format);
            }
            parent.AppendChild(element);
        }

        private static string Instant(DateTimeOffset value) =>
            value.UtcDateTime.ToString("yyyy-MM-ddTHH:mm:ssZ", System.Globalization.CultureInfo.InvariantCulture);
    }
}
