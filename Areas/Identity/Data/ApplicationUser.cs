using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace DcHRally.Areas.Identity.Data;

// Add profile data for application users by adding properties to the ApplicationUser class
public class ApplicationUser : IdentityUser
{
        [DisplayName("Fornavn")]
        [MaxLength(100)]
        [Required(ErrorMessage = "Fornavn er påkrævet")]
        public string FirstName { get; set; } = null!; 

        [DisplayName("Efternavn")]
        [MaxLength(100)]
        [Required(ErrorMessage = "Efternavn er påkrævet")]
        public string LastName { get; set; } = null!; 

        [DisplayName("Adresse")]
        [MaxLength(100)]
        [Required(ErrorMessage = "Adresse er påkrævet")]
        public string Address { get; set; } = null!; 

        [DisplayName("Postnummer")]
        [MaxLength(10)]
        [MinLength(4)]
        [Required(ErrorMessage = "Postnummer er påkrævet")]
        public string ZipCode { get; set; } = null!; 
}

