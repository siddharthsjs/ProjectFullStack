namespace BankCustomerAPI.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string UserType { get; set; } // 'Normal' or 'Bank'
        public bool IsDeleted { get; set; }
        public DateTime CreatedDate { get; set; }

        public ICollection<UserRole> UserRoles { get; set; }
        public ICollection<Account> Accounts { get; set; }
    }
}
