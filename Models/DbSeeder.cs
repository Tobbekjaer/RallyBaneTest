﻿using RallyBaneTest.Models;

namespace DcHRally.Models
{
    public class DbSeeder
    {
        private readonly RallyDbContext _context;
        private readonly IWebHostEnvironment _hostingEnvironment;


        public DbSeeder(RallyDbContext context, IWebHostEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        public void Seed()
        {
            if (!_context.Obstacles.Any())
            {
                var namesFilePath = Path.Combine(_hostingEnvironment.ContentRootPath, "wwwroot", "images", "text", "Names.txt");
                var obstacleNames = File.ReadLines(namesFilePath);

                foreach (var obstacleName in obstacleNames)
                {
                    var idAndName = obstacleName.Split('.'); // Split obstacleName by period
                    var id = int.Parse(idAndName[0].Trim()); // Extract and parse ID
                    var name = string.Join(".", idAndName.Skip(1)).Trim(); // Extract name after ID and trim

                    var descriptionFilePath = Path.Combine(_hostingEnvironment.ContentRootPath, "wwwroot", "images", "text", $"{id}.txt");
                    var description = File.ReadAllText(descriptionFilePath);

                    var categoryId = 0;

                    Console.WriteLine(id);
                    Console.WriteLine(name);
                    Console.WriteLine(description);

                    if (id <= 2 && id < 3)
                    {
                        categoryId = 1;
                    }
                    else if (id >= 3 && id < 100)
                    {
                        categoryId = 2;
                    }
                    else if (id >= 100 && id < 200)
                    {
                        categoryId = 3;
                    }
                    else if (id >= 200 && id < 300)
                    {
                        categoryId = 4;
                    }
                    else if (id >= 300)
                    {
                        categoryId = 5;
                    }

                    var obstacle = new Obstacle
                    {
                        ObstacleId = id,
                        Name = name,
                        Description = description,
                        CategoryId = categoryId
                    };

                    _context.Obstacles.Add(obstacle);
                }

                _context.SaveChanges();
            }
        }
    }
}