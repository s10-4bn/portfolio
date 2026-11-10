var Loading = function() {
	this.init.apply(this, arguments); 
}

$.extend(Loading.prototype, {

	init: function (prms) {
		$.extend( true, this, prms ); 
	},

	start: function(opts) {

//		if ( $("#loadingId") ) return

		var defaults = {
			divCss: {
				position: 'absolute', top: '0', left: '0',
				width: $(window).width() + "px",
				height: $(window).height() + "px",
				zIndex: 99
			},
			pCss: {
				width: $(window).width() + "px",
				height: $(window).height() + "px",
			  display: "table-cell", /* p要素でテーブルの構造を表現 */
			  verticalAlign: "middle", /* 画像を垂直に */
			  textAlign: "center", /* 画像を中央に */
			  lineHeight: "0" /* ボックス内でのp要素の余分な下スペースを消去 */
			}
		}
		var prms = $.extend( true, {}, defaults, opts );

		$("body").append( 
			$("<div></div>", {
				id: "loadingId"
			}).css(prms.divCss).append(
				$("<p></p>").css(prms.pCss).append(
					$("<img>", {
						src: "http://s10-4bn.sunnyday.jp/_img/loadingAnimation.gif"
					})
				)
			)
		);

	},

	stop: function() {
		$("#loadingId").remove();
	}

});


