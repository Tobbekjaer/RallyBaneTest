using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RallyBaneTest.Models;

namespace RallyBaneTest.ViewModels
{
    public class ObstacleViewModel
    {
        public IEnumerable<Obstacle> Obstacles { get; }
        public string? CurrentCategory { get; }

        public ObstacleViewModel(IEnumerable<Obstacle> obstacles, string? currentCategory)
        {
            Obstacles = obstacles;
            CurrentCategory = currentCategory;
        }
    }
}