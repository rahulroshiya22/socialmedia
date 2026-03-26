# ═══════════════════════════════════════════════════
# Multi-stage Dockerfile for Render Free Tier
# Builds React frontend + .NET 8 backend + yt-dlp/ffmpeg
# ═══════════════════════════════════════════════════

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build .NET Backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /app
COPY *.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0-bookworm-slim AS runtime
WORKDIR /app

# Install yt-dlp and ffmpeg (Linux versions) + Node.js for JS runtime
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    nodejs \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy published .NET app
COPY --from=backend-build /app/publish ./

# Copy built frontend into wwwroot
COPY --from=frontend-build /app/frontend/dist ./wwwroot/

# Create downloads directory
RUN mkdir -p /app/wwwroot/downloads

# Render uses PORT env var
ENV ASPNETCORE_URLS=http://+:${PORT:-10000}
ENV ASPNETCORE_ENVIRONMENT=Production

# Override binary paths for Linux
ENV DownloaderSettings__YtDlpPath=/usr/local/bin/yt-dlp
ENV DownloaderSettings__FfmpegPath=/usr/bin/ffmpeg
ENV DownloaderSettings__DownloadsPath=/app/wwwroot/downloads

EXPOSE 10000

ENTRYPOINT ["dotnet", "MonolithicDownloader.dll"]
