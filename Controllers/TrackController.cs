using DcHRally.Models;
using Microsoft.AspNetCore.Mvc;
using RallyBaneTest.Models;
using RallyBaneTest.ViewModels;
using System.Diagnostics;

namespace RallyBaneTest.Controllers;

public class TrackController : Controller
{
    private IObstacleRepository _obstacleRepository;
    private ICategoryRepository _categoryRepository;
    private IObstacleElementRepository _obstacleElementRepository;

    public TrackController(IObstacleRepository obstacleRepository, ICategoryRepository categoryRepository, IObstacleElementRepository obstacleElementRepository)
    {
        _obstacleRepository = obstacleRepository;
        _categoryRepository = categoryRepository;
        _obstacleElementRepository = obstacleElementRepository;
    }

    public IActionResult Index(string category)
    {
        IEnumerable<Obstacle> obstacles;
        IEnumerable<ObstacleElement> obstacleElements;
        string? currentCategory;

        obstacleElements = _obstacleElementRepository.AllObstacleElements;
        if (string.IsNullOrEmpty(category))
        {
            obstacles = _obstacleRepository.AllObstacles.OrderBy(o => o.ObstacleId);
            currentCategory = "All obstacles";
        }
        else
        {
            obstacles = _obstacleRepository.AllObstacles.Where(o => o.Category.Name == category)
                .OrderBy(o => o.ObstacleId);
            currentCategory = _categoryRepository.AllCategories.FirstOrDefault(c => c.Name == category)?.Name;
        }

        return View(new ObstacleViewModel(obstacles, currentCategory, obstacleElements));
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
