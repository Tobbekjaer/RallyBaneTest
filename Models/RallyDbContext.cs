using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace RallyBaneTest.Models
{
    public class RallyDbContext : DbContext
    {
        public RallyDbContext(DbContextOptions<RallyDbContext> options) : base(options)
        {
            
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Obstacle> Obstacles { get; set;}

    }
}