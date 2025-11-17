using BankCustomerAPI.Models;

public class Role
{
    public int RoleId { get; set; }
    public string RoleName { get; set; }

    // FIX: Change to a collection
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
