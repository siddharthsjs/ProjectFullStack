using Microsoft.AspNetCore.Authorization;
using BankCustomerAPI.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BankCustomerAPI.Authorization
{
    // This defines what permission is required
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public string PermissionName { get; }

        public PermissionRequirement(string permissionName)
        {
            PermissionName = permissionName;
        }
    }

    // This checks if the user actually has that permission
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public PermissionAuthorizationHandler(
            IHttpContextAccessor httpContextAccessor,
            IServiceScopeFactory serviceScopeFactory)
        {
            _httpContextAccessor = httpContextAccessor;
            _serviceScopeFactory = serviceScopeFactory;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            // Step 1: Get the user ID from the JWT token
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return; // No valid user ID = fail
            }

            // Step 2: Check database for user's permissions
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // Step 3: Query: User → UserRole → RolePermission → Permission
            var hasPermission = await dbContext.UserRoles
                .Where(ur => ur.UserId == userId)
                .Join(dbContext.RolePermissions,
                    ur => ur.RoleId,
                    rp => rp.RoleId,
                    (ur, rp) => rp)
                .Join(dbContext.Permissions,
                    rp => rp.PermissionId,
                    p => p.PermissionId,
                    (rp, p) => p.PermissionName)
                .AnyAsync(p => p == requirement.PermissionName);

            if (hasPermission)
            {
                context.Succeed(requirement); // User has permission!
            }
        }
    }

    // Helper extension to make it easy to add permission requirements
    public static class AuthorizationPolicyBuilderExtensions
    {
        public static AuthorizationPolicyBuilder RequirePermission(
            this AuthorizationPolicyBuilder builder,
            string permissionName)
        {
            builder.AddRequirements(new PermissionRequirement(permissionName));
            return builder;
        }
    }
}