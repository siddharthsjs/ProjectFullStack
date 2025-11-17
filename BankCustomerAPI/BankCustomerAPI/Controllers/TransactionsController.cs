using BankCustomerAPI.Data;
using BankCustomerAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace BankCustomerAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all transactions for an account - User can only see their own account transactions
        /// </summary>
        [HttpGet("account/{accountId}")]
        public async Task<IActionResult> GetAccountTransactions(int accountId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // Check if account exists and user has access
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountId == accountId);

            if (account == null)
                return NotFound(new { message = "Account not found" });

            // Check if user is admin or owns the account
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && account.UserId != currentUserId)
                return Forbid();

            var transactions = await _context.Transactions
                .Where(t => t.AccountId == accountId)
                .Include(t => t.InitiatedBy)
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new
                {
                    t.TransactionId,
                    t.TransactionType,
                    t.Amount,
                    t.BalanceAfter,
                    t.ToAccountId,
                    t.Description,
                    t.TransactionDate,
                    InitiatedBy = t.InitiatedBy.FirstName + " " + t.InitiatedBy.LastName
                })
                .ToListAsync();

            return Ok(transactions);
        }

        /// <summary>
        /// Get all transactions for current user's accounts
        /// </summary>
        [HttpGet("my-transactions")]
        public async Task<IActionResult> GetMyTransactions()
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var transactions = await _context.Transactions
                .Where(t => t.Account.UserId == currentUserId)
                .Include(t => t.Account)
                .Include(t => t.InitiatedBy)
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new
                {
                    t.TransactionId,
                    t.AccountId,
                    AccountNumber = t.Account.AccountNumber,
                    t.TransactionType,
                    t.Amount,
                    t.BalanceAfter,
                    t.ToAccountId,
                    t.Description,
                    t.TransactionDate,
                    InitiatedBy = t.InitiatedBy.FirstName + " " + t.InitiatedBy.LastName
                })
                .ToListAsync();

            return Ok(transactions);
        }

        /// <summary>
        /// Deposit money into account
        /// </summary>
        [HttpPost("deposit")]
        public async Task<IActionResult> Deposit([FromBody] DepositRequest request)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountId == request.AccountId && !a.IsClosed);

            if (account == null)
                return NotFound(new { message = "Account not found or closed" });

            // Check if user is admin or owns the account
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && account.UserId != currentUserId)
                return Forbid();

            // Update balance
            account.Balance += request.Amount;

            // Create transaction record
            var transaction = new Transaction
            {
                AccountId = account.AccountId,
                TransactionType = "Deposit",
                Amount = request.Amount,
                BalanceAfter = account.Balance,
                Description = request.Description ?? "Deposit",
                TransactionDate = DateTime.UtcNow,
                InitiatedByUserId = currentUserId
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Deposit successful",
                transactionId = transaction.TransactionId,
                newBalance = account.Balance,
                transactionDate = transaction.TransactionDate
            });
        }

        /// <summary>
        /// Withdraw money from account
        /// </summary>
        [HttpPost("withdraw")]
        public async Task<IActionResult> Withdraw([FromBody] WithdrawRequest request)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountId == request.AccountId && !a.IsClosed);

            if (account == null)
                return NotFound(new { message = "Account not found or closed" });

            // Check if user is admin or owns the account
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && account.UserId != currentUserId)
                return Forbid();

            // Check sufficient balance
            if (account.Balance < request.Amount)
                return BadRequest(new { message = "Insufficient balance" });

            // Update balance
            account.Balance -= request.Amount;

            // Create transaction record
            var transaction = new Transaction
            {
                AccountId = account.AccountId,
                TransactionType = "Withdrawal",
                Amount = request.Amount,
                BalanceAfter = account.Balance,
                Description = request.Description ?? "Withdrawal",
                TransactionDate = DateTime.UtcNow,
                InitiatedByUserId = currentUserId
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Withdrawal successful",
                transactionId = transaction.TransactionId,
                newBalance = account.Balance,
                transactionDate = transaction.TransactionDate
            });
        }

        /// <summary>
        /// Transfer money between accounts
        /// </summary>
        [HttpPost("transfer")]
        public async Task<IActionResult> Transfer([FromBody] TransferRequest request)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // Get source account
            var fromAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountId == request.FromAccountId && !a.IsClosed);

            if (fromAccount == null)
                return NotFound(new { message = "Source account not found or closed" });

            // Check if user owns the source account
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && fromAccount.UserId != currentUserId)
                return Forbid();

            // Get destination account
            var toAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.AccountId == request.ToAccountId && !a.IsClosed);

            if (toAccount == null)
                return NotFound(new { message = "Destination account not found or closed" });

            // Check if accounts are different
            if (request.FromAccountId == request.ToAccountId)
                return BadRequest(new { message = "Cannot transfer to the same account" });

            // Check sufficient balance
            if (fromAccount.Balance < request.Amount)
                return BadRequest(new { message = "Insufficient balance" });

            // Perform transfer
            fromAccount.Balance -= request.Amount;
            toAccount.Balance += request.Amount;

            // Create transaction records for both accounts
            var withdrawalTransaction = new Transaction
            {
                AccountId = fromAccount.AccountId,
                TransactionType = "Transfer Out",
                Amount = request.Amount,
                BalanceAfter = fromAccount.Balance,
                ToAccountId = toAccount.AccountId,
                Description = request.Description ?? $"Transfer to account {toAccount.AccountNumber}",
                TransactionDate = DateTime.UtcNow,
                InitiatedByUserId = currentUserId
            };

            var depositTransaction = new Transaction
            {
                AccountId = toAccount.AccountId,
                TransactionType = "Transfer In",
                Amount = request.Amount,
                BalanceAfter = toAccount.Balance,
                ToAccountId = fromAccount.AccountId,
                Description = request.Description ?? $"Transfer from account {fromAccount.AccountNumber}",
                TransactionDate = DateTime.UtcNow,
                InitiatedByUserId = currentUserId
            };

            _context.Transactions.Add(withdrawalTransaction);
            _context.Transactions.Add(depositTransaction);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Transfer successful",
                fromAccountBalance = fromAccount.Balance,
                toAccountBalance = toAccount.Balance,
                transactionDate = withdrawalTransaction.TransactionDate
            });
        }
    }

    // Request DTOs
    public class DepositRequest
    {
        [Required]
        public int AccountId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }
    }

    public class WithdrawRequest
    {
        [Required]
        public int AccountId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }
    }

    public class TransferRequest
    {
        [Required]
        public int FromAccountId { get; set; }

        [Required]
        public int ToAccountId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}