/*
 * This script prevents a navbar with the #navbar-fix identifier
 * from scrolling off the top of the browser window. It does this by
 * detecting when that's about to occur and creating a copy that's
 * added to the page with a fixed position, aligned to the top of
 * the page.
 *
 * When the user scrolls back up then this copy is
 * removed so the normal navbar is fully visible again.
 *
 * Because you can't scroll the fixed copy we're not able to use this
 * for the collapsed navigation where menu items are shown vertically.
 */

var isFixed = 0;

processScroll()
$(window).on('scroll', processScroll)

function processScroll() {
  
  var navbar = document.getElementById("navbar-fix");

  if (navbar == null) {
    return
  }
  
  if (!isFixed && $(window).scrollTop() >= $('.navbar#navbar-fix').offset().top) {
    var element = navbar.cloneNode(true);
    element.id = "navbar-fixed";
    navbar.parentNode.appendChild(element);
    isFixed = 1;
  }
  else if (isFixed && $(window).scrollTop() < $('.navbar#navbar-fix').offset().top)  {
    element = document.getElementById("navbar-fixed");
    element.parentNode.removeChild(element);
    isFixed = 0
  }
}
