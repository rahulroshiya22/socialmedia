using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using MonolithicDownloader.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Render sets PORT env var
var port = Environment.GetEnvironmentVariable("PORT") ?? "5235";
builder.WebHost.UseUrls($"http://+:{port}");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add Scoped Services
builder.Services.AddScoped<IDownloadService, DownloadService>();

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Key"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Serve static files (React app + downloads)
app.UseStaticFiles();

// Serve downloads folder explicitly
var downloadsPath = app.Configuration["DownloaderSettings:DownloadsPath"] ?? "wwwroot/downloads";
var fullDownloadsPath = Path.GetFullPath(downloadsPath);
if (!Directory.Exists(fullDownloadsPath))
{
    Directory.CreateDirectory(fullDownloadsPath);
}
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(fullDownloadsPath),
    RequestPath = "/downloads"
});

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Handle fallback for SPA routing
app.MapFallbackToFile("index.html");

app.Run();
