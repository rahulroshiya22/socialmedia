using CliWrap;
using CliWrap.Buffered;
using MonolithicDownloader.Models;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace MonolithicDownloader.Services;

public interface IDownloadService
{
    Task<DownloadResponse> DownloadVideoAsync(string url, string? formatId = null);
    Task<VideoInfoResponse> FetchVideoInfoAsync(string url);
    Task DownloadWithProgressAsync(string url, string? formatId, Func<DownloadProgress, Task> onProgress);
}

public class DownloadProgress
{
    public double Percent { get; set; }
    public string? Speed { get; set; }
    public string? Eta { get; set; }
    public string? Status { get; set; } // "downloading", "merging", "done", "error"
    public string? FileUrl { get; set; }
    public string? Message { get; set; }
}

public class DownloadService : IDownloadService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<DownloadService> _logger;
    private readonly string _ytDlpPath;
    private readonly string _downloadsPath;
    private readonly List<string> _proxies;
    private static readonly Random _random = new Random();

    // Maintenance mode (in-memory, toggled by admin)
    public static bool MaintenanceMode { get; set; } = false;

    public DownloadService(IConfiguration configuration, ILogger<DownloadService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        var settings = _configuration.GetSection("DownloaderSettings");
        _ytDlpPath = Path.GetFullPath(settings["YtDlpPath"] ?? "binaries/yt-dlp.exe");
        _downloadsPath = Path.GetFullPath(settings["DownloadsPath"] ?? "wwwroot/downloads");

        _proxies = settings.GetSection("Proxies").Get<List<string>>() ?? new List<string>();

        if (!Directory.Exists(_downloadsPath))
        {
            Directory.CreateDirectory(_downloadsPath);
        }
    }

    private string? GetRandomProxy()
    {
        var validProxies = _proxies.Where(p => !string.IsNullOrWhiteSpace(p)).ToList();
        if (validProxies.Any())
        {
            var proxy = validProxies[_random.Next(validProxies.Count)];
            _logger.LogInformation("Using proxy: {Proxy}", proxy);
            return proxy;
        }
        _logger.LogInformation("No proxy configured, using direct connection.");
        return null;
    }

    private void AddCookiesIfAvailable(List<string> arguments)
    {
        var cookiesFile = Path.Combine(Directory.GetCurrentDirectory(), "cookies.txt");
        if (File.Exists(cookiesFile))
        {
            arguments.Add("--cookies");
            arguments.Add($"\"{cookiesFile}\"");
        }
    }

    public async Task<VideoInfoResponse> FetchVideoInfoAsync(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return new VideoInfoResponse { Success = false, Message = "URL is empty" };
        }

        try
        {
            var arguments = new List<string>
            {
                "--dump-json",
                "--no-playlist",
                $"\"{url}\""
            };

            var proxy = GetRandomProxy();
            if (proxy != null)
            {
                arguments.Insert(0, "--proxy");
                arguments.Insert(1, $"\"{proxy}\"");
            }

            AddCookiesIfAvailable(arguments);

            var result = await Cli.Wrap(_ytDlpPath)
                .WithArguments(string.Join(" ", arguments))
                .WithValidation(CommandResultValidation.None)
                .ExecuteBufferedAsync();

            if (result.ExitCode != 0)
            {
                _logger.LogError("yt-dlp info error: {Error}", result.StandardError);
                return new VideoInfoResponse { Success = false, Message = "Could not fetch video info. The link might be private, unsupported, or region-blocked." };
            }

            using var doc = JsonDocument.Parse(result.StandardOutput);
            var root = doc.RootElement;

            var title = root.TryGetProperty("title", out var t) ? t.GetString() : "Unknown";
            var thumbnail = root.TryGetProperty("thumbnail", out var th) ? th.GetString() : null;
            var duration = root.TryGetProperty("duration", out var d) ? d.GetDouble() : (double?)null;

            var formats = new List<VideoFormat>();

            if (root.TryGetProperty("formats", out var formatsArr))
            {
                foreach (var fmt in formatsArr.EnumerateArray())
                {
                    var formatId = fmt.TryGetProperty("format_id", out var fid) ? fid.GetString() ?? "" : "";
                    var ext = fmt.TryGetProperty("ext", out var e) ? e.GetString() : null;
                    var height = fmt.TryGetProperty("height", out var h) && h.ValueKind == JsonValueKind.Number ? h.GetInt32() : (int?)null;
                    var filesize = fmt.TryGetProperty("filesize", out var fs) && fs.ValueKind == JsonValueKind.Number ? fs.GetInt64() : (long?)null;
                    var filesizeApprox = fmt.TryGetProperty("filesize_approx", out var fsa) && fsa.ValueKind == JsonValueKind.Number ? fsa.GetInt64() : (long?)null;
                    var vcodec = fmt.TryGetProperty("vcodec", out var vc) ? vc.GetString() : null;
                    var acodec = fmt.TryGetProperty("acodec", out var ac) ? ac.GetString() : null;
                    var formatNote = fmt.TryGetProperty("format_note", out var fn) ? fn.GetString() : null;

                    bool hasVideo = vcodec != null && vcodec != "none";
                    bool hasAudio = acodec != null && acodec != "none";

                    if (ext == "mhtml" || formatNote == "storyboard") continue;

                    string resolution;
                    if (hasVideo && height.HasValue)
                        resolution = $"{height}p";
                    else if (!hasVideo && hasAudio)
                        resolution = "Audio only";
                    else
                        resolution = formatNote ?? "Unknown";

                    string label = resolution;
                    if (hasVideo && !hasAudio) label += " (video only)";
                    if (ext != null) label += $" • {ext.ToUpper()}";

                    formats.Add(new VideoFormat
                    {
                        FormatId = formatId,
                        Label = label,
                        Extension = ext,
                        Resolution = height.HasValue ? $"{height}p" : null,
                        FileSize = filesize ?? filesizeApprox,
                        Note = formatNote
                    });
                }
            }

            formats = formats
                .OrderByDescending(f => f.Resolution != null && f.Resolution != "Audio only")
                .ThenByDescending(f =>
                {
                    if (f.Resolution != null && f.Resolution.EndsWith("p"))
                    {
                        int.TryParse(f.Resolution.Replace("p", ""), out var hx);
                        return hx;
                    }
                    return 0;
                })
                .ThenByDescending(f => f.FileSize ?? 0)
                .ToList();

            var deduped = new List<VideoFormat>();
            var seenResolutions = new HashSet<string>();
            foreach (var f in formats)
            {
                var key = f.Resolution ?? f.Label;
                if (!seenResolutions.Contains(key))
                {
                    seenResolutions.Add(key);
                    deduped.Add(f);
                }
            }
            deduped = deduped.Take(8).ToList();

            return new VideoInfoResponse
            {
                Success = true,
                Message = "Info fetched",
                Title = title,
                Thumbnail = thumbnail,
                Duration = duration,
                Formats = deduped
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception fetching video info.");
            return new VideoInfoResponse { Success = false, Message = "An unexpected error occurred while fetching video info." };
        }
    }

    public async Task DownloadWithProgressAsync(string url, string? formatId, Func<DownloadProgress, Task> onProgress)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            await onProgress(new DownloadProgress { Status = "error", Percent = 0, Message = "URL is empty" });
            return;
        }

        try
        {
            var fileName = $"{Guid.NewGuid()}.%(ext)s";
            var outputPath = Path.Combine(_downloadsPath, fileName);

            string formatArg;
            if (!string.IsNullOrWhiteSpace(formatId))
                formatArg = $"{formatId}+bestaudio[ext=m4a]/bestaudio/{formatId}/best";
            else
                formatArg = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";

            var arguments = new List<string>
            {
                "-o", $"\"{outputPath}\"",
                "--no-playlist",
                "--newline",
                "--concurrent-fragments", "8",
                "--format", formatArg,
                $"\"{url}\""
            };

            var proxy = GetRandomProxy();
            if (proxy != null)
            {
                arguments.Insert(0, "--proxy");
                arguments.Insert(1, $"\"{proxy}\"");
            }

            AddCookiesIfAvailable(arguments);

            var progressRegex = new Regex(@"\[download\]\s+(\d+\.?\d*)%\s+of.*?at\s+(\S+)\s+ETA\s+(\S+)");
            var mergeRegex = new Regex(@"\[Merger\]|Merging");

            await onProgress(new DownloadProgress { Status = "downloading", Percent = 0, Message = "Starting download..." });

            var cmd = Cli.Wrap(_ytDlpPath)
                .WithArguments(string.Join(" ", arguments))
                .WithValidation(CommandResultValidation.None);

            var stdOutBuffer = new List<string>();
            var stdErrBuffer = new List<string>();

            var result = await cmd
                .WithStandardOutputPipe(PipeTarget.ToDelegate(async line =>
                {
                    stdOutBuffer.Add(line);
                    var match = progressRegex.Match(line);
                    if (match.Success)
                    {
                        var pct = double.Parse(match.Groups[1].Value);
                        var speed = match.Groups[2].Value;
                        var eta = match.Groups[3].Value;
                        await onProgress(new DownloadProgress
                        {
                            Status = "downloading",
                            Percent = pct,
                            Speed = speed,
                            Eta = eta,
                            Message = $"Downloading... {pct:F1}%"
                        });
                    }
                    else if (mergeRegex.IsMatch(line))
                    {
                        await onProgress(new DownloadProgress
                        {
                            Status = "merging",
                            Percent = 100,
                            Message = "Merging audio & video..."
                        });
                    }
                }))
                .WithStandardErrorPipe(PipeTarget.ToDelegate(line =>
                {
                    stdErrBuffer.Add(line);
                }))
                .ExecuteAsync();

            if (result.ExitCode != 0)
            {
                _logger.LogError("yt-dlp error: {Error}", string.Join("\n", stdErrBuffer));
                await onProgress(new DownloadProgress
                {
                    Status = "error",
                    Percent = 0,
                    Message = "Download failed. The video might be region blocked or unavailable."
                });
                return;
            }

            var dir = new DirectoryInfo(_downloadsPath);
            var actualFile = dir.GetFiles().OrderByDescending(f => f.CreationTime).FirstOrDefault();

            if (actualFile != null)
            {
                await onProgress(new DownloadProgress
                {
                    Status = "done",
                    Percent = 100,
                    Message = "Download complete!",
                    FileUrl = $"/downloads/{actualFile.Name}"
                });
            }
            else
            {
                await onProgress(new DownloadProgress
                {
                    Status = "error",
                    Percent = 0,
                    Message = "Download completed but file not found."
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception during download with progress.");
            await onProgress(new DownloadProgress
            {
                Status = "error",
                Percent = 0,
                Message = "An unexpected error occurred."
            });
        }
    }

    public async Task<DownloadResponse> DownloadVideoAsync(string url, string? formatId = null)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return new DownloadResponse { Success = false, Message = "URL is empty" };
        }

        try
        {
            var fileName = $"{Guid.NewGuid()}.%(ext)s";
            var outputPath = Path.Combine(_downloadsPath, fileName);

            string formatArg;
            if (!string.IsNullOrWhiteSpace(formatId))
                formatArg = $"{formatId}+bestaudio[ext=m4a]/bestaudio/{formatId}/best";
            else
                formatArg = "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best";

            var arguments = new List<string>
            {
                "-o", $"\"{outputPath}\"",
                "--no-playlist",
                "--concurrent-fragments", "8",
                "--format", formatArg,
                $"\"{url}\""
            };

            var proxy = GetRandomProxy();
            if (proxy != null)
            {
                arguments.Insert(0, "--proxy");
                arguments.Insert(1, $"\"{proxy}\"");
            }

            AddCookiesIfAvailable(arguments);

            var result = await Cli.Wrap(_ytDlpPath)
                .WithArguments(string.Join(" ", arguments))
                .WithValidation(CommandResultValidation.None)
                .ExecuteBufferedAsync();

            if (result.ExitCode != 0)
            {
                _logger.LogError("yt-dlp error: {Error}", result.StandardError);
                return new DownloadResponse { Success = false, Message = "Failed to download video." };
            }

            var dir = new DirectoryInfo(_downloadsPath);
            var actualFile = dir.GetFiles().OrderByDescending(f => f.CreationTime).FirstOrDefault();

            if (actualFile != null)
            {
                return new DownloadResponse
                {
                    Success = true,
                    Message = "Download successful",
                    FileUrl = $"/downloads/{actualFile.Name}"
                };
            }

            return new DownloadResponse { Success = false, Message = "Download completed, but file not found locally." };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred during download.");
            return new DownloadResponse { Success = false, Message = "An unexpected error occurred." };
        }
    }
}
