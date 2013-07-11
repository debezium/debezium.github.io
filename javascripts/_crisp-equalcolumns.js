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
