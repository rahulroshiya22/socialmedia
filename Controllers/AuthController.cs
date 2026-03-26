using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MonolithicDownloader.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MonolithicDownloader.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var adminConfig = _configuration.GetSection("AdminCredentials");
        var validUser = adminConfig["Username"];
        var validPass = adminConfig["Password"];

        if (request.Username == validUser && request.Password == validPass)
        {
            var tokenString = GenerateJwt();
            return Ok(new { Token = tokenString });
        }

        return Unauthorized(new { Message = "Invalid credentials" });
    }

    private string GenerateJwt()
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, "admin"),
            new Claim(ClaimTypes.Role, "Admin"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(12),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
