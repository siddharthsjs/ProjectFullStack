using BankCustomerAPI.Data;
using BankCustomerAPI.Services;
using BankCustomerAPI.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ============================================
// 1. DATABASE CONFIGURATION
// ============================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ============================================
// 2. SERVICES REGISTRATION
// ============================================
builder.Services.AddScoped<JwtService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();

// ============================================
// 3. JWT AUTHENTICATION CONFIGURATION
// ============================================
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;  // ADD THIS
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;  // ADD THIS
    options.RequireHttpsMetadata = false;  // ADD THIS for development
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        ClockSkew = TimeSpan.Zero  // ADD THIS to remove 5-minute default tolerance
    };

    // ADD THIS: For debugging purposes
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validated successfully");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"OnChallenge error: {context.Error}, {context.ErrorDescription}");
            return Task.CompletedTask;
        }
    };
});
// ============================================
// 4. AUTHORIZATION WITH PERMISSION POLICIES
// ============================================
builder.Services.AddAuthorization(options =>
{
    // Define permission-based policies
    options.AddPolicy("RequireReadUser", policy =>
        policy.RequirePermission("ReadUser"));

    options.AddPolicy("RequireCreateUser", policy =>
        policy.RequirePermission("CreateUser"));

    options.AddPolicy("RequireDeleteUser", policy =>
        policy.RequirePermission("DeleteUser"));

    options.AddPolicy("RequireReadAccount", policy =>
        policy.RequirePermission("ReadAccount"));

    options.AddPolicy("RequireCreateAccount", policy =>
        policy.RequirePermission("CreateAccount"));

    options.AddPolicy("RequireDeleteAccount", policy =>
        policy.RequirePermission("DeleteAccount"));
});

// ============================================
// 5. CORS CONFIGURATION 
// ============================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Remove trailing slash!
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Important for sending cookies/auth headers
    });
});

// ============================================
// 6. CONTROLLERS AND SWAGGER
// ============================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Bank Customer API", Version = "v1" });

    // FIXED: Properly configure JWT Authentication for Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,  // CHANGED from ApiKey to Http
        Scheme = "Bearer",  // This ensures "Bearer " prefix is added
        BearerFormat = "JWT"  // Added for clarity
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()  // CHANGED from new List<string>()
        }
    });
});

// ============================================
// BUILD THE APP
// ============================================
var app = builder.Build();

// ============================================
// 7. MIDDLEWARE PIPELINE (ORDER MATTERS!)
// ============================================

// Development tools
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS must come BEFORE Authentication and Authorization
app.UseCors("AllowReactApp"); // ADD THIS LINE HERE!

// Authentication must come BEFORE Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();