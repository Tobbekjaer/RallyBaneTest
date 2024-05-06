using Microsoft.EntityFrameworkCore;
using RallyBaneTest.Models;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Default") 
        ?? throw new InvalidOperationException("Connection string 'Default' not found.");

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IObstacleRepository, ObstacleRepository>();

builder.Services.AddDbContext<RallyDbContext>(options => {
    options.UseSqlServer(
        builder.Configuration["ConnectionStrings:Default"]);
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Track}/{action=Index}/{id?}");

app.Run();
