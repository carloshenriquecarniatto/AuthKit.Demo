# The build context is the parent directory: this image needs the .NET SDK sources as well as the
# demo. See the .dockerignore in the parent.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dotnet-build
WORKDIR /src
COPY AuthKit.Net/ ./AuthKit.Net/
COPY AuthKit.Demo/ ./AuthKit.Demo/
RUN dotnet publish AuthKit.Demo/src/AuthKit.Demo.Host/AuthKit.Demo.Host.csproj -c Release -o /app

FROM node:24 AS node-build
WORKDIR /src
COPY AuthKit.Angular/ ./AuthKit.Angular/
COPY AuthKit.Demo/ ./AuthKit.Demo/

RUN cd AuthKit.Angular && npm ci && npx ng build authkit
RUN cd AuthKit.Demo/src/angular-demo && npm ci && npm run build
RUN cd AuthKit.Demo/src/angular-storybook && npm ci && npm run build

RUN cd AuthKit.Demo/src/blazor-storybook && npm ci && npm run build

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:5080
COPY --from=dotnet-build /app ./
COPY --from=node-build /src/AuthKit.Demo/src/angular-demo/dist/angular-demo/browser ./wwwroot/angular/
# One Storybook manager at /storybook/ (Blazor renderer) composing the Angular build.
COPY --from=node-build /src/AuthKit.Demo/src/blazor-storybook/storybook-static ./wwwroot/storybook/
COPY --from=node-build /src/AuthKit.Demo/src/angular-storybook/storybook-static ./wwwroot/storybook/angular/
EXPOSE 5080
ENTRYPOINT ["dotnet", "AuthKit.Demo.Host.dll"]
