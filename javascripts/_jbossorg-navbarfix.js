/*
 * This script prevents a navbar with the #sticky-navbar identifier
 * from scrolling off the top of the browser window. It does this by
 * detecting when that's about to occur and switching a style class
 * which sets it at a fixed position, aligned to the top of
 * the page.
 *
 * When the user scrolls back up then this style class is switched
 * back so the normal navbar is fully visible again.
 *
 * Because you can't scroll the fixed copy we're not able to use this
 * for the collapsed navigation where menu items are shown vertically.
 */

var isNavBarFixed = 0;

var defaultNavbarOffset = $("#sticky-navbar").length ? $("#sticky-navbar").offset().top : 0 ;

processScroll();
$(window).on('scroll', processScroll);

function processScroll() {

  var navbar = $("#sticky-navbar");

  if (navbar.length==0) {
    return
  }

  // var breadcrumb;

  if (isNavBarFixed) {
    breadcrumb = $(".breadcrumb-fixed");
  } else {
    breadcrumb = $(".breadcrumb");
  }

  // Measuring additionall offset depending whether tabzilla exists and is open.
  var additionalTabzillaOffset = 0;
  var tabzilla = $('#tabnav-panel');
  if (tabzilla.length) {
    if (tabzilla.hasClass('tabnav-opened')) {
      additionalTabzillaOffset=240;
    }
  }

  // Tabzilla offset needs to bo added if it's open.
  if (!isNavBarFixed && $(window).scrollTop() >= (defaultNavbarOffset + additionalTabzillaOffset) ) {

    // Switching navbar style to fixed position at the top.
    navbar.addClass("navbar-fixed");
    navbar.removeClass("navbar-fix");

    // Trick in order to prevent content movement when the navigation starts to scroll.
    breadcrumb.addClass("breadcrumb-fixed");
    breadcrumb.removeClass("breadcrumb");

    isNavBarFixed = 1;

  } else if (isNavBarFixed && $(window).scrollTop() < (defaultNavbarOffset + additionalTabzillaOffset) ) {

    // Switching navbar style to non-fixed position.
    navbar.addClass("navbar-fix");
    navbar.removeClass("navbar-fixed");

    breadcrumb.removeClass("breadcrumb-fixed");
    breadcrumb.addClass("breadcrumb");

    isNavBarFixed = 0;

  }
}