using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonolithicDownloader.Models;
using MonolithicDownloader.Services;
using System.Text.Json;

namespace MonolithicDownloader.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DownloadController : ControllerBase
{
    private readonly IDownloadService _downloadService;

    public DownloadController(IDownloadService downloadService)
    {
        _downloadService = downloadService;
    }

    [HttpPost]
    public async Task<IActionResult> DownloadVideo([FromBody] DownloadRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Url))
            return BadRequest(new { Message = "URL is required" });

        var response = await _downloadService.DownloadVideoAsync(request.Url, request.FormatId);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [AllowAnonymous]
    [HttpPost("public")]
    public async Task<IActionResult> PublicDownloadVideo([FromBody] DownloadRequest request)
    {
        if (DownloadService.MaintenanceMode)
            return StatusCode(503, new { Message = "Service is under maintenance. Please try again later." });

        if (string.IsNullOrWhiteSpace(request.Url))
            return BadRequest(new { Message = "URL is required" });

        var response = await _downloadService.DownloadVideoAsync(request.Url, request.FormatId);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [AllowAnonymous]
    [HttpPost("info")]
    public async Task<IActionResult> FetchVideoInfo([FromBody] FetchInfoRequest request)
    {
        if (DownloadService.MaintenanceMode)
            return StatusCode(503, new { Message = "Service is under maintenance. Please try again later." });

        if (string.IsNullOrWhiteSpace(request.Url))
            return BadRequest(new { Message = "URL is required" });

        var response = await _downloadService.FetchVideoInfoAsync(request.Url);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    // SSE endpoint for streaming download progress
    [AllowAnonymous]
    [HttpGet("progress")]
    public async Task StreamDownloadProgress([FromQuery] string url, [FromQuery] string? formatId)
    {
        Response.Headers["Content-Type"] = "text/event-stream";
        Response.Headers["Cache-Control"] = "no-cache";
        Response.Headers["Connection"] = "keep-alive";

        if (DownloadService.MaintenanceMode)
        {
            var errData = JsonSerializer.Serialize(new { status = "error", percent = 0, message = "Service is under maintenance." });
            await Response.WriteAsync($"data: {errData}\n\n");
            await Response.Body.FlushAsync();
            return;
        }

        if (string.IsNullOrWhiteSpace(url))
        {
            var errData = JsonSerializer.Serialize(new { status = "error", percent = 0, message = "URL is required" });
            await Response.WriteAsync($"data: {errData}\n\n");
            await Response.Body.FlushAsync();
            return;
        }

        await _downloadService.DownloadWithProgressAsync(url, formatId, async progress =>
        {
            var json = JsonSerializer.Serialize(new
            {
                status = progress.Status,
                percent = progress.Percent,
                speed = progress.Speed,
                eta = progress.Eta,
                message = progress.Message,
                fileUrl = progress.FileUrl
            });

            await Response.WriteAsync($"data: {json}\n\n");
            await Response.Body.FlushAsync();
        });
    }

    // Admin: Toggle maintenance mode
    [HttpPost("maintenance")]
    public IActionResult ToggleMaintenance([FromBody] MaintenanceRequest request)
    {
        DownloadService.MaintenanceMode = request.Enabled;
        return Ok(new { MaintenanceMode = DownloadService.MaintenanceMode, Message = request.Enabled ? "Maintenance mode enabled" : "Maintenance mode disabled" });
    }

    [HttpGet("maintenance")]
    public IActionResult GetMaintenanceStatus()
    {
        return Ok(new { MaintenanceMode = DownloadService.MaintenanceMode });
    }
}
