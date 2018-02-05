(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#sideNav'
  });

  $("#age").text(ageCalc(1996,11,24));

})(jQuery); // End of use strict

function ageCalc(year, month, day) {
  var d = new Date;
  
  year = +year;
  month = +month,
  day = +day,

  age = d.getFullYear() - year;

  if (d.getMonth() + 1 < month || d.getMonth() + 1 == month && d.getDate() < day) {
      age--;
  }

  return age < 0 ? 0 : age;
}