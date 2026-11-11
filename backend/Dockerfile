# =============================================================================
# Stage 1: Build
# =============================================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies (layer-cached)
COPY SchoolAdmissionAPI.csproj .
RUN dotnet restore SchoolAdmissionAPI.csproj

# Copy everything else and publish
COPY . .
RUN dotnet publish SchoolAdmissionAPI.csproj -c Release -o /app/publish --no-restore

# =============================================================================
# Stage 2: Runtime
# =============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Listen on 0.0.0.0:8080 (required for Docker networking)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SchoolAdmissionAPI.dll"]
