namespace AuthKit.Demo.Host;

/// <summary>
/// Forwards <c>/auth/v1/*</c> to the local Supabase Auth container. Clients (Angular, Aurelia, the
/// .NET Supabase provider) all point at this host, so the browser sees one origin and no CORS
/// configuration is needed anywhere.
/// </summary>
public static class SupabaseProxy
{
    public static IEndpointRouteBuilder MapSupabaseProxy(this IEndpointRouteBuilder endpoints, string gotrueUrl)
    {
        ArgumentNullException.ThrowIfNull(endpoints);

        endpoints.Map("/auth/v1/{**path}", async (HttpContext context, IHttpClientFactory factory) =>
        {
            var path = context.Request.RouteValues["path"]?.ToString() ?? string.Empty;
            var target = $"{gotrueUrl.TrimEnd('/')}/{path}{context.Request.QueryString}";

            using var request = new HttpRequestMessage(new HttpMethod(context.Request.Method), target);
            if (context.Request.ContentLength is > 0)
            {
                request.Content = new StreamContent(context.Request.Body);
                foreach (var header in context.Request.Headers)
                {
                    if (string.Equals(header.Key, "Host", StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    if (!request.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray()))
                    {
                        request.Content.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                    }
                }
            }
            else
            {
                foreach (var header in context.Request.Headers)
                {
                    if (string.Equals(header.Key, "Host", StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    request.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }

            var client = factory.CreateClient();
            using var response = await client
                .SendAsync(request, HttpCompletionOption.ResponseHeadersRead, context.RequestAborted)
                .ConfigureAwait(false);

            context.Response.StatusCode = (int)response.StatusCode;
            foreach (var header in response.Headers)
            {
                if (!string.Equals(header.Key, "transfer-encoding", StringComparison.OrdinalIgnoreCase))
                {
                    context.Response.Headers[header.Key] = header.Value.ToArray();
                }
            }

            if (response.Content is not null)
            {
                foreach (var header in response.Content.Headers)
                {
                    context.Response.Headers[header.Key] = header.Value.ToArray();
                }

                await response.Content.CopyToAsync(context.Response.Body, context.RequestAborted).ConfigureAwait(false);
            }
        });

        return endpoints;
    }
}
