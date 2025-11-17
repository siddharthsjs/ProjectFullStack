using BankCustomerAPI.Data;
using BankCustomerAPI.Models;
using BankCustomerAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request is null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                return BadRequest(new { message = "Email and password are required." });

            // Get user by email
            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password" });

            // Get all assigned roles
            var roleNames = user.UserRoles?
                .Select(r => r.Role.RoleName)
                .ToList() ?? new List<string>();

            // Generate JWT token
            var token = _jwtService.GenerateJwtToken(user, roleNames);

            var decodedRoles = _jwtService.DecodeRolesFromToken(token);

            Console.WriteLine("==== JWT Generated Roles ====");
            foreach (var role in decodedRoles)
            {
                Console.WriteLine($"Role: {role}");
            }
            Console.WriteLine("=============================");

            return Ok(new
            {
                token = token,
                rolesFromDatabase = roleNames,
                rolesFromToken = decodedRoles
            });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
