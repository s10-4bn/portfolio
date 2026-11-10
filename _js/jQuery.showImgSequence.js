// IEで画像が重なる不具合を直した（2017-10-22）
//  ①".showImgSequence-next-line"を都度remove
//  ②最後にfinalizeで描きなおし
//  Image コンストラクタを使ったヴァージョン。
// 左右のマージンと写真の間隔を等しくした（2017-10-23）
// 最後の行のレイアウトを直した（2017-10-29）

(function($) { // 無名関数でラップしてプラグインを独立させておく。jQueryキーワードの代わりにドル記号($)を使用する。

	$.fn.showImgSequence = function(opts) { // プラグインを定義する。
		return this.each(function() { // each();で回して全ての要素に対して同様に処理していく
			new $.showImgSequence(this,opts);
		});
	};

	var defaults = {
		fadeSpeed: 1000 // 画像を表示する際のfadeSpeed
	};

	$.showImgSequence = function(elements, opts){

		this.opts = $.extend({}, defaults, opts); // デフォルトオプションと渡されたオプションのマージ
		this.$id = $(elements);
		this.image = [];
	
		var self = this; // 以下の関数で用いるために要素(this）を変数(self)に退避

	    $("body").prepend("<div id='showImgSequence-loading-image'><img src='http://s10-4bn.sunnyday.jp/_img/img-loading.gif'></div>");
	    $("#showImgSequence-loading-image").css({
	        position: "fixed",
	        bottom: "15px",
	        left: "15px",
	        opacity: "0.7",
			zIndex: "99"
		});

		var $img = self.$id.find('img');

		self.$id.children('li').css({display: "none"});

		var imgIndex = 0;

		self.loadedIndex = 0;

		self.imgWidth = [];
		self.$box = self.$id.find("li");

		$img.each(function(key){

			self.image[key] = new Image();
	
			self.image[key].onload = function(){
	
				$($img[key]).addClass("imgLoaded");
				imgIndex++;

	      for( var i=0; i<imgIndex; i++ ) {
	
					if ( $($img[i]).hasClass("imgLoaded") ) {
	
						self.loadedIndex++;
				    self.$id.children('li').eq(i)
						.css({
	            	display:'block',
	              opacity:'0',
	          }).animate(
								{opacity:'1'},self.opts.fadeSpeed
						);
	
						$($img[i]).removeClass("imgLoaded");

						self.imgWidth[i] = self.image[i].width;
              self.$id.children('li').eq(i)
						.css({
	          	width: self.imgWidth[i]
	          });

						self.photoTable (); 	

					}

				}

				if ( imgIndex >= $img.length ) {
//					self.photoTable (); 
					self.finalize (); 
					$(window).on('resize', function(){
						$(".showImgSequence-next-line").remove();
						self.photoTable();
					});
				}

			}
	
			self.image[key].src = $img[key].src;

		});
	
	};

	$.extend($.showImgSequence.prototype,{

		photoTable: function() {
//console.log(this.loadedIndex);
			$(".showImgSequence-next-line").remove();
			$(this.$id).prepend("<div class='showImgSequence-next-line' style='clear: both'></div>");
//				前にfloatが残っていた場合の処理を追加した（2017-10-29）

			var cellpadding = 10;

			var colPix = 0;
			var tmpIndex = 0;
			var colHeight = 0;

		    for( var i=0; i<this.loadedIndex; i++ ) {

				if ( colPix+this.imgWidth[i]+cellpadding > this.$id.width() ) {
					var marginLeft = ( this.$id.width() - colPix - cellpadding ) / (i-tmpIndex+1 ) + cellpadding;
					colPix = 0;
					for ( j=tmpIndex; j<i; j++ ) {
						var marginTopBottom = ( colHeight - $(this.$box[j]).height() + cellpadding ) /2;
						$(this.$box[j]).css({ 
							"margin-left": marginLeft+"px",
							"margin-right": "0px",
							"margin-top": marginTopBottom+"px",
							"margin-bottom": marginTopBottom+"px"
						}); 

						if ( j == i-1 ) {
							$(this.$box[j]).after("<div class='showImgSequence-next-line' style='clear: both'></div>"); 
						}

					}

					tmpIndex = i;
					colHeight = 0;	
		   		}
				colHeight = Math.max ( colHeight, $(this.$box[i]).height() + cellpadding );
				colPix += this.imgWidth[i]+cellpadding;			
			}

			for ( j=tmpIndex; j<this.$box.length; j++ ) {
//				var marginLeft = ( this.$id.width() - colPix - cellpadding) / (this.$box.length-tmpIndex+1 ) + cellpadding;
				var marginTopBottom = ( colHeight - $(this.$box[j]).height() ) /2;
				$(this.$box[j]).css({ 
					"margin-left": Math.floor(marginLeft)+"px",
					"margin-right": "0px",
							"margin-top": marginTopBottom+"px",
							"margin-bottom": marginTopBottom+"px"
				}); 
			}

		},

		finalize: function() {

			var self = this; // 以下の関数で用いるために要素(this）を変数(self)に退避
			var $img = self.$id.find('img');
			var imgIndexf = 0;

			$img.each(function(key){
				imgIndexf++;
				self.imgWidth[key] = $($img[key]).width();
				if ( imgIndexf >= $img.length ) {
					self.photoTable (); 
		  		}
			});
//			console.log("loaded!");
			$("#showImgSequence-loading-image").fadeOut(1000).remove();

		}

	});

})(jQuery);
