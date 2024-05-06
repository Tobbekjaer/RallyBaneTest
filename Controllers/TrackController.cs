using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using RallyBaneTest.Models;
using RallyBaneTest.ViewModels;

namespace RallyBaneTest.Controllers;

public class TrackController : Controller
{
    private IObstacleRepository _obstacleRepository;
    private ICategoryRepository _categoryRepository;

    public TrackController(IObstacleRepository obstacleRepository, ICategoryRepository categoryRepository)
    {
        _obstacleRepository = obstacleRepository;
        _categoryRepository = categoryRepository;
    }

    public IActionResult Index(string category)
    {
        IEnumerable<Obstacle> obstacles;
        string? currentCategory;

        if (string.IsNullOrEmpty(category))
        {
            obstacles = _obstacleRepository.AllObstacles.OrderBy(o => o.ObstacleId);
            currentCategory = "All obstacles";
        } else
        {
            obstacles = _obstacleRepository.AllObstacles.Where(o => o.Category.Name == category)
                .OrderBy(o => o.ObstacleId);
            currentCategory = _categoryRepository.AllCategories.FirstOrDefault(c => c.Name == category)?.Name;
        }

        return View(new ObstacleViewModel(obstacles, currentCategory));
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
