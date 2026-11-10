// htmlファイルをiframeを用いてmodal表示する。
// 干渉しないようにラップの仕方を見直した（2017-11-11）
// 2018-08-16 closeButtonを追加した。
;(function($) { // 無名関数でラップしてプラグインを独立させておく。jQueryキーワードの代わりにドル記号($)を使用する。

	$.fn.simplyModal = function(opts) { // プラグインを定義する。
		return this.each(function() { // each();で回して全ての要素に対して同様に処理していく
			new $.simplyModal(this,opts);
		});
	};

	var defaults = {
		closeButton: true // 2018-08-16 追加
	};

	$.simplyModal = function(elements, opts){

		this.opts = $.extend({}, defaults, opts); // デフォルトオプションと渡されたオプションのマージ

		this.$id = $(elements);


		var self = this;
		$(elements).off('click').on('click', function(){

			var $overlay = $('<div></div>').css({
						position: 'fixed', top: '0', left: '0',
						width: '100%', height: '100%',
						backgroundColor: 'black', opacity: '0.75'
			}).appendTo("body").hide().fadeIn('slow');

			if (self.opts.modalClass) {
				var $modal = $('<iframe src = ' + self.opts.url +'></iframe>')
				.addClass(self.opts.modalClass)
				.appendTo("body").hide().fadeIn('slow');
			} else {
				var $modal = $('<iframe src = ' + self.opts.url +'></iframe>').css({
					display: 'none',
					position: 'fixed', top: '0', left: '0',
					width: '50%', height: '50%',
					backgroundColor: 'white', opacity: '1.0'
				}).appendTo("body").hide().fadeIn('slow');
			}

			var $closeButton = $("<div><img src='http://s10-4bn.sunnyday.jp/_img/closeButton.png'></div>").css({
				position: 'fixed', 
				top: '0', 
				right: '0',
				margin: '2px',
				cursor: 'pointer'
			}).appendTo("body").hide().fadeIn('slow');

			if (self.opts.closeButton !== true) { // 2018-08-16 追加
				$closeButton.css({visibility: "hidden"});
			}

			self.modalResize($modal); 
		
			$overlay.off().click(function(){
		    	$modal.fadeOut('slow',function(){
					$modal.remove();
				});
				$overlay.fadeOut('slow',function(){
					$overlay.remove();
				});
				$closeButton.fadeOut('slow',function(){
					$closeButton.remove();
				});
			});

			$closeButton.off().click(function(){
		    	$modal.fadeOut('slow',function(){
					$modal.remove();
				});
				$overlay.fadeOut('slow',function(){
					$overlay.remove();
				});
				$closeButton.fadeOut('slow',function(){
					$closeButton.remove();
				});
			});


			$(window).on('resize', function(){
				self.modalResize($modal);
			});

		});

	}

	$.extend($.simplyModal.prototype,{

		modalResize: function($element) { // モーダルコンテンツの表示位置を設定する関数
			var w = $(window).width(); // ウィンドウの横幅を取得
			var h = $(window).height(); // ウィンドウの高さを取得
			var x = (w - $element.outerWidth(true)) / 2; // モーダルコンテンツの表示位置を取得
			var y = (h - $element.outerHeight(true)) / 2; // モーダルコンテンツの表示位置を取得
			$element.css({'left': x + 'px','top': y + 'px'}); // モーダルコンテンツの表示位置を設定
		}

	});

})(jQuery);
