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
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        RoleClaimType = System.Security.Claims.ClaimTypes.Role
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

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
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
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
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