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

var isNavBarFixed = 0;

var defaultNavbarOffset = $("#sticky-navbar").offset().top;

processScroll();
$(window).on('scroll', processScroll);

function processScroll() {
  
  var navbar = $("#sticky-navbar");
  var breadcrumb = $(".breadcrumb");

  if (isNavBarFixed) {
    breadcrumb = $(".breadcrumb-fixed");
  }

  if (navbar == null || typeof (navbar.offset()) == "undefined" ) {
    return
  }

  var additionalTabzillaOffset = 0;
  var tabzilla = $('#tabnav-panel');
  if (typeof tabzilla != undefined) {
    if (tabzilla.hasClass('tabnav-opened')) {
      additionalTabzillaOffset=240;
    }
  }
  
  // Tabzilla offset needs to bo added if it's open.
  if (!isNavBarFixed && $(window).scrollTop() >= (defaultNavbarOffset + additionalTabzillaOffset) ) {
    navbar.addClass("navbar-fixed");
    navbar.removeClass("navbar-fix");
    breadcrumb.addClass("breadcrumb-fixed");
    breadcrumb.removeClass("breadcrumb");
    isNavBarFixed = 1;
  } else if (isNavBarFixed && $(window).scrollTop() < (defaultNavbarOffset + additionalTabzillaOffset) ) {
    navbar.addClass("navbar-fix");
    navbar.removeClass("navbar-fixed");
    breadcrumb.removeClass("breadcrumb-fixed");
    breadcrumb.addClass("breadcrumb");
    isNavBarFixed = 0
  }
}
