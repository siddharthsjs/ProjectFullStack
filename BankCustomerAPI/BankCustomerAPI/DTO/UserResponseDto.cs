using System.ComponentModel.DataAnnotations;

namespace BankCustomerAPI.DTOs
{
    // User DTOs
    public class UserResponseDto
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string UserType { get; set; }
        public List<string> Roles { get; set; }
    }

    public class CreateUserDto
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public string UserType { get; set; } // "Normal" or "Bank"
    }

    public class UpdateUserDto
    {
        [MaxLength(100)]
        public string FirstName { get; set; }

        [MaxLength(100)]
        public string LastName { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MinLength(6)]
        public string Password { get; set; }
    }

    // Account DTOs
    public class AccountResponseDto
    {
        public int AccountId { get; set; }
        public string AccountNumber { get; set; }
        public string AccountType { get; set; }
        public string CurrencyCode { get; set; }
        public decimal Balance { get; set; }
        public bool IsMinor { get; set; }
        public bool IsClosed { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? MaturityDate { get; set; }
        public decimal? InterestRate { get; set; }
        public UserSummaryDto Owner { get; set; }
        public BranchSummaryDto Branch { get; set; }
        public UserSummaryDto PowerOfAttorney { get; set; }
    }

    public class CreateAccountDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int BranchId { get; set; }

        [Required]
        [MaxLength(20)]
        public string AccountType { get; set; } // "Savings", "Current", "TermDeposit"

        [MaxLength(3)]
        public string CurrencyCode { get; set; } = "INR";

        [Range(0, double.MaxValue)]
        public decimal InitialDeposit { get; set; } = 0;

        public bool IsMinor { get; set; } = false;

        public int? PowerOfAttorneyUserId { get; set; }

        // For Term Deposit
        public int? TenureInMonths { get; set; }
        public decimal? InterestRate { get; set; }
    }

    public class UpdateAccountDto
    {
        public int? PowerOfAttorneyUserId { get; set; }
        public bool? IsClosed { get; set; }
    }

    public class DepositDto
    {
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }
    }

    public class WithdrawalDto
    {
        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }
    }

    public class TransferDto
    {
        [Required]
        public int ToAccountId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }
    }

    // Supporting DTOs
    public class UserSummaryDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
    }

    public class BranchSummaryDto
    {
        public int BranchId { get; set; }
        public string BranchName { get; set; }
        public string BranchCode { get; set; }
        public string BankName { get; set; }
    }

    public class TransactionResponseDto
    {
        public int TransactionId { get; set; }
        public string TransactionType { get; set; }
        public decimal Amount { get; set; }
        public decimal BalanceAfter { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; }
        public string InitiatedBy { get; set; }
    }

    // Bank DTOs
    public class BankResponseDto
    {
        public int BankId { get; set; }
        public string BankName { get; set; }
        public string HeadOfficeAddress { get; set; }
        public string IFSCCode { get; set; }
        public int BranchCount { get; set; }
    }

    public class CreateBankDto
    {
        [Required]
        [MaxLength(200)]
        public string BankName { get; set; }

        [MaxLength(500)]
        public string HeadOfficeAddress { get; set; }

        [Required]
        [MaxLength(20)]
        public string IFSCCode { get; set; }
    }

    // Branch DTOs
    public class BranchResponseDto
    {
        public int BranchId { get; set; }
        public string BranchName { get; set; }
        public string BranchCode { get; set; }
        public string Address { get; set; }
        public string BankName { get; set; }
        public UserSummaryDto Manager { get; set; }
        public int AccountCount { get; set; }
    }

    public class CreateBranchDto
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
}