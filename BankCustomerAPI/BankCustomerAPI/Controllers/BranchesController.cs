using BankCustomerAPI.Data;
using BankCustomerAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BankCustomerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BranchesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BranchesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all branches - Anyone authenticated can read
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllBranches()
        {
            var branches = await _context.Branches
                .Include(b => b.Bank)
                .Include(b => b.Manager)
                .Select(b => new
                {
                    b.BranchId,
                    b.BranchName,
                    b.BranchCode,
                    b.Address,
                    b.BankId,
                    BankName = b.Bank.BankName,
                    b.ManagerUserId,
                    ManagerName = b.Manager != null ? b.Manager.FirstName + " " + b.Manager.LastName : null,
                    b.CreatedDate,
                    AccountCount = b.Accounts.Count
                })
                .ToListAsync();

            return Ok(branches);
        }

        /// <summary>
        /// Get branch by ID - Anyone authenticated can read
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBranch(int id)
        {
            var branch = await _context.Branches
                .Include(b => b.Bank)
                .Include(b => b.Manager)
                .Include(b => b.Accounts)
                .Where(b => b.BranchId == id)
                .Select(b => new
                {
                    b.BranchId,
                    b.BranchName,
                    b.BranchCode,
                    b.Address,
                    b.BankId,
                    BankName = b.Bank.BankName,
                    b.ManagerUserId,
                    ManagerName = b.Manager != null ? b.Manager.FirstName + " " + b.Manager.LastName : null,
                    b.CreatedDate,
                    Accounts = b.Accounts.Select(a => new
                    {
                        a.AccountId,
                        a.AccountNumber,
                        a.AccountType,
                        a.Balance
                    })
                })
                .FirstOrDefaultAsync();

            if (branch == null)
                return NotFound(new { message = "Branch not found" });

            return Ok(branch);
        }

        /// <summary>
        /// Create branch - Only Admin can create
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateBranch([FromBody] CreateBranchRequest request)
        {
            // Validate bank exists
            var bankExists = await _context.Banks.AnyAsync(b => b.BankId == request.BankId);
            if (!bankExists)
                return BadRequest(new { message = "Bank not found" });

            // Validate manager exists (if provided)
            if (request.ManagerUserId.HasValue)
            {
                var managerExists = await _context.Users
                    .AnyAsync(u => u.UserId == request.ManagerUserId.Value && !u.IsDeleted);
                if (!managerExists)
                    return BadRequest(new { message = "Manager user not found" });
            }

            // Check if branch code already exists for this bank
            var branchCodeExists = await _context.Branches
                .AnyAsync(b => b.BankId == request.BankId && b.BranchCode == request.BranchCode);
            if (branchCodeExists)
                return BadRequest(new { message = "Branch code already exists for this bank" });

            var branch = new Branch
            {
                BankId = request.BankId,
                BranchName = request.BranchName,
                BranchCode = request.BranchCode,
                Address = request.Address,
                ManagerUserId = request.ManagerUserId,
                CreatedDate = DateTime.UtcNow
            };

            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBranch), new { id = branch.BranchId }, new
            {
                branch.BranchId,
                branch.BranchName,
                branch.BranchCode,
                branch.Address,
                branch.CreatedDate
            });
        }

        /// <summary>
        /// Update branch - Only Admin can update
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBranch(int id, [FromBody] UpdateBranchRequest request)
        {
            var branch = await _context.Branches.FindAsync(id);
            if (branch == null)
                return NotFound(new { message = "Branch not found" });

            // Validate manager exists (if provided)
            if (request.ManagerUserId.HasValue)
            {
                var managerExists = await _context.Users
                    .AnyAsync(u => u.UserId == request.ManagerUserId.Value && !u.IsDeleted);
                if (!managerExists)
                    return BadRequest(new { message = "Manager user not found" });
            }

            branch.BranchName = request.BranchName ?? branch.BranchName;
            branch.Address = request.Address ?? branch.Address;
            branch.ManagerUserId = request.ManagerUserId ?? branch.ManagerUserId;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Branch updated successfully" });
        }

        /// <summary>
        /// Delete branch - Only Admin can delete
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBranch(int id)
        {
            var branch = await _context.Branches
                .Include(b => b.Accounts)
                .FirstOrDefaultAsync(b => b.BranchId == id);

            if (branch == null)
                return NotFound(new { message = "Branch not found" });

            if (branch.Accounts.Any())
                return BadRequest(new { message = "Cannot delete branch with existing accounts" });

            _context.Branches.Remove(branch);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Branch deleted successfully" });
        }
    }

    // Request DTOs
    public class CreateBranchRequest
    {
        [Required]
        public int BankId { get; set; }

        [Required]
        [MaxLength(200)]
        public string BranchName { get; set; }

        [Required]
        [MaxLength(20)]
        public string BranchCode { get; set; }

        [MaxLength(500)]
        public string Address { get; set; }

        public int? ManagerUserId { get; set; }
    }

    public class UpdateBranchRequest
    {
        [MaxLength(200)]
        public string? BranchName { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        public int? ManagerUserId { get; set; }
    }
}