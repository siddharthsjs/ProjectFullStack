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
    public class AccountsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AccountsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all accounts - Requires ReadAccount permission
        /// </summary>
        [HttpGet]
        [Authorize(Policy = "RequireReadAccount")]
        public async Task<IActionResult> GetAccounts()
        {
            var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);

            // Check if user has admin-level permissions (can see all accounts)
            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == currentUserId)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            var hasAdminPermissions = await _context.RolePermissions
                .Where(rp => userRoles.Contains(rp.RoleId))
                .Join(_context.Permissions,
                    rp => rp.PermissionId,
                    p => p.PermissionId,
                    (rp, p) => p.PermissionName)
                .AnyAsync(p => p == "CreateUser" || p == "DeleteUser"); // Admin indicators

            IQueryable<Account> query = _context.Accounts
                .Include(a => a.User)
                .Include(a => a.Branch)
                .Where(a => !a.IsClosed);

            if (!hasAdminPermissions)
            {
                // Normal users see only their own accounts
                query = query.Where(a => a.UserId == currentUserId);
            }

            var accounts = await query
                .Select(a => new
                {
                    a.AccountId,
                    a.AccountNumber,
                    a.AccountType,
                    a.Balance,
                    a.CurrencyCode,
                    a.UserId,
                    UserName = a.User.FirstName + " " + a.User.LastName,
                    a.BranchId,
                    BranchName = a.Branch.BranchName,
                    a.CreatedDate
                })
                .ToListAsync();

            return Ok(accounts);
        }

        /// <summary>
        /// Get account by ID - Requires ReadAccount permission
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Policy = "RequireReadAccount")]
        public async Task<IActionResult> GetAccount(int id)
        {
            var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);

            var account = await _context.Accounts
                .Include(a => a.User)
                .Include(a => a.Branch)
                .Where(a => a.AccountId == id && !a.IsClosed)
                .Select(a => new
                {
                    a.AccountId,
                    a.AccountNumber,
                    a.AccountType,
                    a.Balance,
                    a.CurrencyCode,
                    a.UserId,
                    UserName = a.User.FirstName + " " + a.User.LastName,
                    a.BranchId,
                    BranchName = a.Branch.BranchName,
                    a.CreatedDate
                })
                .FirstOrDefaultAsync();

            if (account == null)
                return NotFound(new { message = "Account not found" });

            // Check if user can access this account
            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == currentUserId)
                .Select(ur => ur.RoleId)
                .ToListAsync();

            var hasAdminPermissions = await _context.RolePermissions
                .Where(rp => userRoles.Contains(rp.RoleId))
                .Join(_context.Permissions,
                    rp => rp.PermissionId,
                    p => p.PermissionId,
                    (rp, p) => p.PermissionName)
                .AnyAsync(p => p == "CreateUser" || p == "DeleteUser");

            if (!hasAdminPermissions && account.UserId != currentUserId)
                return Forbid(); // User can only see their own accounts

            return Ok(account);
        }

        /// <summary>
        /// Create account - Requires CreateAccount permission
        /// </summary>
        [HttpPost]
        [Authorize(Policy = "RequireCreateAccount")]
        public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
        {
            // Validate user exists
            var userExists = await _context.Users.AnyAsync(u => u.UserId == request.UserId && !u.IsDeleted);
            if (!userExists)
                return BadRequest(new { message = "User not found" });

            // Validate branch exists
            var branchExists = await _context.Branches.AnyAsync(b => b.BranchId == request.BranchId);
            if (!branchExists)
                return BadRequest(new { message = "Branch not found" });

            var account = new Account
            {
                UserId = request.UserId,
                BranchId = request.BranchId,
                AccountNumber = GenerateAccountNumber(),
                AccountType = request.AccountType,
                CurrencyCode = request.CurrencyCode ?? "INR",
                Balance = request.InitialDeposit,
                CreatedDate = DateTime.UtcNow
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAccount), new { id = account.AccountId }, new
            {
                account.AccountId,
                account.AccountNumber,
                account.AccountType,
                account.Balance,
                account.CurrencyCode,
                account.CreatedDate
            });
        }

        /// <summary>
        /// Close account - Requires DeleteAccount permission
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Policy = "RequireDeleteAccount")]
        public async Task<IActionResult> CloseAccount(int id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
                return NotFound(new { message = "Account not found" });

            if (account.IsClosed)
                return BadRequest(new { message = "Account is already closed" });

            // Optional: Check if account has zero balance before closing
            if (account.Balance != 0)
                return BadRequest(new { message = "Cannot close account with non-zero balance" });

            account.IsClosed = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Account closed successfully", accountId = account.AccountId });
        }

        /// <summary>
        /// Generate unique account number
        /// </summary>
        private string GenerateAccountNumber()
        {
            return $"ACC{DateTime.UtcNow.Ticks}";
        }
    }

    public class CreateAccountRequest
    {
        public int UserId { get; set; }
        public int BranchId { get; set; }
        public string AccountType { get; set; }
        public string? CurrencyCode { get; set; }
        public decimal InitialDeposit { get; set; }
    }
}