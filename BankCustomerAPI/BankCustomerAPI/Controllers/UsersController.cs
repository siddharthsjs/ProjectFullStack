
using BankCustomerAPI.Data;
using BankCustomerAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankCustomerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users - Requires ReadUser permission
        [HttpGet]
        [Authorize(Policy = "RequireReadUser")]

        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Where(u => !u.IsDeleted)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Select(u => new
                {
                    u.UserId,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.UserType,
                    u.DateOfBirth,
                    Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList()
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/users/{id} - Requires ReadUser permission
        [HttpGet("{id}")]
        [Authorize(Policy = "RequireReadUser")]

        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Where(u => u.UserId == id && !u.IsDeleted)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Select(u => new
                {
                    u.UserId,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.UserType,
                    u.DateOfBirth,
                    Roles = u.UserRoles.Select(ur => ur.Role.RoleName).ToList()
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

        // POST: api/users - Requires CreateUser permission
        [HttpPost]
        [Authorize(Policy = "RequireCreateUser")]

        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest(new { message = "Email already exists" });

            var user = new User
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                DateOfBirth = request.DateOfBirth,
                UserType = request.UserType,
                CreatedDate = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId },
                new { user.UserId, user.Email, user.FirstName, user.LastName });
        }

        // PUT: api/users/{id} - Requires CreateUser permission (for update)
        [HttpPut("{id}")]
        [Authorize(Policy = "RequireCreateUser")]

        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null || user.IsDeleted)
                return NotFound(new { message = "User not found" });

            user.FirstName = request.FirstName ?? user.FirstName;
            user.LastName = request.LastName ?? user.LastName;
            user.DateOfBirth = request.DateOfBirth ?? user.DateOfBirth;

            await _context.SaveChangesAsync();

            return Ok(new { message = "User updated successfully" });
        }

        // DELETE: api/users/{id} - Requires DeleteUser permission
        [HttpDelete("{id}")]
        [Authorize(Policy = "RequireDeleteUser")]

        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "User deleted successfully" });
        }
    }


    public class CreateUserRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string UserType { get; set; } = "Normal";
    }

    public class UpdateUserRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime? DateOfBirth { get; set; }
    }
}
