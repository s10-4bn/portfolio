;(function($) {
    "use strict";

    $.fn.dropFile = function(opt) {

        // FileReader‚É‘Î‰‚µ‚Ä‚¢‚È‚¢ê‡‚Í—áŠO‚ğ“Š‚°‚ÄI—¹
        if ( window.FileReader === undefined ) {
            throw new TypeError("This browser is not support FileReader.");
        }

        var utilStop = function(e) {
            e.preventDefault();
            e.stopPropagation();
        };

        return $(this).each(function($el) {
            var $drop = $(this);

            $(document).on({
                "dragover": utilStop,
                "dragenter": utilStop,
                "dragleave": utilStop,
                "drop": utilStop,
						});

            $drop.on({
                "drop": function(e) {
										var files = event.dataTransfer.files;
 										opt.drop(files);
                }
            });

        });
    };

}(jQuery));