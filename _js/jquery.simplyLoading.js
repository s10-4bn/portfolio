$.simplyLoading = function(prms) {

	var defaults = {
		img: 'http://www.geocities.jp/winchester_cathedral_nostalgy/_img/img-loading.gif',
		imgCSS: {
	        position: "absolute",
	        bottom: "15px",
	        left: "15px",
	        opacity: "0.7"
		}
	};

	$.extend( true, this, defaults, prms );

    $("body").prepend("<div id='loading-img'><img src=" + this.img + "></div>");
    $("#loading-img").css(this.imgCSS);

// loading image ‚Ì’è‹`
	$(window).load(function(){
console.log("loaded!");
		$("#loading-img").fadeOut(1000).remove();
	});

}