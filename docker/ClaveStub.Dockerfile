FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY AuthKit.Net/ ./AuthKit.Net/
COPY AuthKit.Demo/ ./AuthKit.Demo/
RUN dotnet publish AuthKit.Demo/src/AuthKit.Demo.ClaveStub/AuthKit.Demo.ClaveStub.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
COPY --from=build /app ./
EXPOSE 8080
ENTRYPOINT ["dotnet", "AuthKit.Demo.ClaveStub.dll"]
