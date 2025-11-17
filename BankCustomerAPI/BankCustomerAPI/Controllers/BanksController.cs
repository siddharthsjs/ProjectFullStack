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
    public class BanksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BanksController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all banks - Anyone authenticated can read
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllBanks()
        {
            var banks = await _context.Banks
                .Include(b => b.Branches)
                .Select(b => new
                {
                    b.BankId,
                    b.BankName,
                    b.HeadOfficeAddress,
                    b.IFSCCode,
                    b.CreatedDate,
                    BranchCount = b.Branches.Count
                })
                .ToListAsync();

            return Ok(banks);
        }

        /// <summary>
        /// Get bank by ID - Anyone authenticated can read
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBank(int id)
        {
            var bank = await _context.Banks
                .Include(b => b.Branches)
                .Where(b => b.BankId == id)
                .Select(b => new
                {
                    b.BankId,
                    b.BankName,
                    b.HeadOfficeAddress,
                    b.IFSCCode,
                    b.CreatedDate,
                    Branches = b.Branches.Select(br => new
                    {
                        br.BranchId,
                        br.BranchName,
                        br.BranchCode,
                        br.Address
                    })
                })
                .FirstOrDefaultAsync();

            if (bank == null)
                return NotFound(new { message = "Bank not found" });

            return Ok(bank);
        }

        /// <summary>
        /// Create bank - Only Admin can create
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateBank([FromBody] CreateBankRequest request)
        {
            var bank = new Bank
            {
                BankName = request.BankName,
                HeadOfficeAddress = request.HeadOfficeAddress,
                IFSCCode = request.IFSCCode,
                CreatedDate = DateTime.UtcNow
            };

            _context.Banks.Add(bank);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBank), new { id = bank.BankId }, bank);
        }

        /// <summary>
        /// Update bank - Only Admin can update
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBank(int id, [FromBody] UpdateBankRequest request)
        {
            var bank = await _context.Banks.FindAsync(id);
            if (bank == null)
                return NotFound(new { message = "Bank not found" });

            bank.BankName = request.BankName ?? bank.BankName;
            bank.HeadOfficeAddress = request.HeadOfficeAddress ?? bank.HeadOfficeAddress;
            bank.IFSCCode = request.IFSCCode ?? bank.IFSCCode;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Bank updated successfully" });
        }

        /// <summary>
        /// Delete bank - Only Admin can delete
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBank(int id)
        {
            var bank = await _context.Banks.Include(b => b.Branches).FirstOrDefaultAsync(b => b.BankId == id);
            if (bank == null)
                return NotFound(new { message = "Bank not found" });

            if (bank.Branches.Any())
                return BadRequest(new { message = "Cannot delete bank with existing branches" });

            _context.Banks.Remove(bank);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bank deleted successfully" });
        }
    }

    public class CreateBankRequest
    {
        public string BankName { get; set; }
        public string HeadOfficeAddress { get; set; }
        public string IFSCCode { get; set; }
    }

    public class UpdateBankRequest
    {
        public string? BankName { get; set; }
        public string? HeadOfficeAddress { get; set; }
        public string? IFSCCode { get; set; }
    }
}
