using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace MonolithicDownloader.Services;

public class KeepAliveService : BackgroundService
{
    private readonly ILogger<KeepAliveService> _logger;
    private readonly HttpClient _httpClient;
    private readonly string _pingUrl = "https://socialmedia-ej4c.onrender.com"; // User's Render URL

    public KeepAliveService(ILogger<KeepAliveService> logger)
    {
        _logger = logger;
        _httpClient = new HttpClient();
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Keep-Alive Service started. Pinging {Url} every 10 minutes.", _pingUrl);

        // Wait 2 minutes before first ping to allow app to start
        await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Sending keep-alive ping to {Url}...", _pingUrl);
                var response = await _httpClient.GetAsync(_pingUrl, stoppingToken);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Keep-alive ping successful (Status: {StatusCode}).", response.StatusCode);
                }
                else
                {
                    _logger.LogWarning("Keep-alive ping returned non-success status: {StatusCode}", response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Keep-alive ping failed.");
            }

            // Ping every 10 minutes to prevent Render's 15-minute sleep timer
            await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
        }
    }
}
