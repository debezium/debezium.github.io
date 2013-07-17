/*================================================================*/
/*	BACK TO TOP
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