using BankCustomerAPI.Data;
using BankCustomerAPI.Models;
using BankCustomerAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BankCustomerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwtService;

        public AuthController(AppDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        /// <summary>
        /// Login endpoint - Returns JWT token and refresh token
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request is null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                return BadRequest(new { message = "Email and password are required." });

            // Get user by email
            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email && !u.IsDeleted);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password" });

            // Get all assigned roles
            var roleNames = user.UserRoles?
                .Select(r => r.Role.RoleName)
                .ToList() ?? new List<string>();

            // Generate JWT token
            var accessToken = _jwtService.GenerateJwtToken(user, roleNames);
            var refreshToken = _jwtService.GenerateRefreshToken();

            // Save refresh token to database
            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.UserId,
                Token = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            };

            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                userId = user.UserId,
                email = user.Email,
                fullName = $"{user.FirstName} {user.LastName}",
                roles = roleNames,
                accessToken = accessToken,
                refreshToken = refreshToken,
                expiresIn = 7200 // 2 hours in seconds
            });
        }

        /// <summary>
        /// Refresh token endpoint - Get new access token using refresh token
        /// </summary>
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            if (string.IsNullOrEmpty(request.AccessToken) || string.IsNullOrEmpty(request.RefreshToken))
                return BadRequest(new { message = "Access token and refresh token are required" });

            // Validate the expired access token
            var principal = _jwtService.GetPrincipalFromExpiredToken(request.AccessToken);
            if (principal == null)
                return BadRequest(new { message = "Invalid access token" });

            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return BadRequest(new { message = "Invalid token claims" });

            // Validate refresh token
            var savedRefreshToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken &&
                                           rt.UserId == userId &&
                                           !rt.IsRevoked);

            if (savedRefreshToken == null)
                return Unauthorized(new { message = "Invalid refresh token" });

            if (savedRefreshToken.ExpiresAt < DateTime.UtcNow)
                return Unauthorized(new { message = "Refresh token expired" });

            // Get user and roles
            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId && !u.IsDeleted);

            if (user == null)
                return Unauthorized(new { message = "User not found" });

            var roleNames = user.UserRoles?
                .Select(r => r.Role.RoleName)
                .ToList() ?? new List<string>();

            // Generate new tokens
            var newAccessToken = _jwtService.GenerateJwtToken(user, roleNames);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            // Revoke old refresh token
            savedRefreshToken.IsRevoked = true;

            // Create new refresh token
            var newRefreshTokenEntity = new RefreshToken
            {
                UserId = user.UserId,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            };

            _context.RefreshTokens.Add(newRefreshTokenEntity);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                accessToken = newAccessToken,
                refreshToken = newRefreshToken,
                expiresIn = 7200
            });
        }

        /// <summary>
        /// Verify token endpoint - Check if current token is valid
        /// </summary>
        [HttpGet("verify")]
        [Authorize]
        public async Task<IActionResult> Verify()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid token" });

            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId && !u.IsDeleted);

            if (user == null)
                return Unauthorized(new { message = "User not found" });

            var roleNames = user.UserRoles?
                .Select(r => r.Role.RoleName)
                .ToList() ?? new List<string>();

            return Ok(new
            {
                valid = true,
                userId = user.UserId,
                email = user.Email,
                fullName = $"{user.FirstName} {user.LastName}",
                roles = roleNames,
                userType = user.UserType
            });
        }

        /// <summary>
        /// Logout endpoint - Revoke all refresh tokens for user
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return BadRequest(new { message = "Invalid token" });

            // Revoke all active refresh tokens for this user
            var refreshTokens = await _context.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.IsRevoked)
                .ToListAsync();

            foreach (var token in refreshTokens)
            {
                token.IsRevoked = true;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Logged out successfully" });
        }
    }

    // Request DTOs
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RefreshTokenRequest
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
    }
}