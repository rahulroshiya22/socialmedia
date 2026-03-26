namespace MonolithicDownloader.Models;

public class DownloadRequest
{
    public string Url { get; set; } = string.Empty;
    public string? FormatId { get; set; }
}

public class DownloadResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? FileUrl { get; set; }
}

public class VideoInfoResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Thumbnail { get; set; }
    public double? Duration { get; set; }
    public List<VideoFormat> Formats { get; set; } = new();
}

public class VideoFormat
{
    public string FormatId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? Extension { get; set; }
    public string? Resolution { get; set; }
    public long? FileSize { get; set; }
    public string? Note { get; set; }
}

public class FetchInfoRequest
{
    public string Url { get; set; } = string.Empty;
}

public class MaintenanceRequest
{
    public bool Enabled { get; set; }
}
