
/*================================================================*/
/*  TRIGGER EQUAL COLUMNS AT 767 px
/*================================================================*/
$(window).load(function(){
if (document.documentElement.clientWidth > 767) { //if client width is greater than 767px load equal columns

(function($) {

    $.fn.eqHeights = function() {

        var el = $(this);
        if (el.length > 0 && !el.data('eqHeights')) {
            $(window).bind('resize.eqHeights', function() {
                el.eqHeights();
            });
            el.data('eqHeights', true);
        }
        return el.each(function() {
            var curHighest = 0;
            $(this).children().each(function() {
                var el = $(this),
                    elHeight = el.height('auto').height();
                if (elHeight > curHighest) {
                    curHighest = elHeight;
                }
            }).height(curHighest);
        });
    };

    $('#equalHeights,#equalHeightsA,#equalHeightsB,#equalHeightsC,#equalHeightsD,#equalHeightsLayout').eqHeights(); /*one time per page unless you make another id to add here */

}(jQuery));
} // end if
}); // end windowload


/*================================================================*/
/*  BACK TO TOP
/*================================================================*/
$(document).ready(function(){

if ( navigator.userAgent.indexOf('iPad','iPhone','iPod') == -1 )
  {
  // hide .backToTop first
  $(".backToTop").hide();
    $(window).scroll(function(){
        if ($(this).scrollTop() > 100) {
            $('.backToTop').fadeIn();
        } else {
            $('.backToTop').fadeOut();
        }
 });

    $('.backToTop').click(function(){
        $("html, body").animate({ scrollTop: 0 }, 800);
        return false;
    });

  } // end if NOT

var deviceAgent = navigator.userAgent.toLowerCase();
var agentID = deviceAgent.match(/(iphone|ipod|ipad)/);
if (agentID)   {

  $('.backToTop').css({"position":"relative","clear":"both","margin":"0 auto","width":"100%","right":"auto","bottom":"auto"});
  $('.backToTop a').css({"width":"100%"});

}// end IS ipad/iphone/ipod

});

/*================================================================*/
/*  ROTATING TESTIMONIALS
/*================================================================*/
 $(document).ready( function() {
  $('.rotating-testimonials').easytabs({
    animationSpeed: 400,
    updateHash: false,
    cycle: 5000
});
});

/*================================================================*/
/*  SIDE BAR TABS
/*================================================================*/
 $(document).ready( function() {
  $('.sidebar-tabs').easytabs({
    transitionIn: 'slideDown',
    updateHash: false
});
});

/*================================================================*/
/*  CONTENT TABS
/*================================================================*/
 $(document).ready( function() {
  $('.content-tabs').easytabs({
    transitionIn: 'slideDown',
    updateHash: false
});
});
