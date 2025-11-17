namespace BankCustomerAPI.Models
{
    public class Transaction
    {
        public int TransactionId { get; set; }
        public int AccountId { get; set; }
        public string TransactionType { get; set; } // Deposit, Withdrawal, Transfer
        public decimal Amount { get; set; }
        public decimal BalanceAfter { get; set; }
        public int? ToAccountId { get; set; } // For transfers
        public string Description { get; set; }
        public DateTime TransactionDate { get; set; }
        public int InitiatedByUserId { get; set; }

        public Account Account { get; set; }
        public User InitiatedBy { get; set; }
    }
}