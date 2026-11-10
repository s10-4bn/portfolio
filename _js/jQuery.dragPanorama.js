/*
2017-10-30: reset.css に対応するようにした
2017-10-31: touchに対応するようにした
2019-04-27: スクロールボタン等の表示方法を変更した。
*/
;(function($) { // 無名関数でラップしてプラグインを独立させておく。jQueryキーワードの代わりにドル記号($)を使用する。

	$.fn.dragPanorama = function(opts) { // プラグインを定義する。
		return this.each(function() { // each();で回して全ての要素に対して同様に処理していく
			new $.dragPanorama(this,opts);
		});
	};

	var defaults = {
		dx: 0, // マウスダウンした場所の画像の座標
		xcache: 0,  // 画像の左端のスクリーンの左端に対する座標
		dragObj: false,  // ドラッグの状態を表す。　null→ドラッグしていない状況
		width: null,
		height: null,
		round: false, // 360°パノラマのときはtrue
		scroll: true, // 自動スクロールをするときは true
		speed: 100, // 自動スクロールのスピード
		mouseoverVisibility: "visible", // mouseover の時のスクロールボタンの表示/非表示
		mouseoutVisibility: "hidden", // mouseout の時のスクロールボタンの表示/非表示
		buttonOpacity: "0.5", // スクロールボタンの透明度
		buttonImgPrv: "http://s10-4bn.sunnyday.jp/_img/prv.png",  // スクロールボタン（左）の画像
		buttonImgFwd: "http://s10-4bn.sunnyday.jp/_img/fwd.png",  // スクロールボタン（右）の画像
		buttonImgPause: "http://s10-4bn.sunnyday.jp/_img/pause.png",  // スクロールボタン（pause）の画像
		switchSize: "20px", // 切り替えボタンのサイズ
		switchText: "表示切替", // 切り替えボタンのテキスト
		switchBgColor: "#000000", // 切り替えボタンの背景色
		switchColor: "#FFFFFF", // 切り替えボタンの色
		switchPadding: "0.5rem", // 切り替えボタンのpadding
		src2: "", // 切り替え用の画像
		intervalTime: 1000, // Buttonを表示している時間
		durationTime: 1000 // 画像切り替え時間
	};

	$.dragPanorama = function(elements, opts){

		this.opts = $.extend({}, defaults, opts); // デフォルトオプションと渡されたオプションのマージ

		this.$id = $(elements);
		if ( this.opts.width )  this.$id.width(this.opts.width);
		if ( this.opts.height ) this.$id.height(this.opts.height);
		this.srcCurrent = this.opts.src;
	
		var self = this; // 以下の関数で用いるために要素(this）を変数(self)に退避
		var timeout;

		var baseBlockCss = {
			position: "absolute",
			height: "100%",
			width: "100%"
		};

		this.$id.css({ 
			overflow: "hidden",
			position: "relative",
			textAlign: "left",
		}).append(
			$('<div></div>').css(baseBlockCss) // 画像用の<div>
		).append(
			$('<div></div>').css(baseBlockCss) // 切り替え画像用の<div>
		);

		if ( this.opts.scroll == true || this.opts.src2) {

//			this.$id.mouseover(function(){
			this.$id.bind("mousemove touchstart", function(){
				event.preventDefault();
//		$("body").on("mousemove", function() {
				if(timeout){ clearTimeout(timeout); }
				var this_ = this;
				$(this_).css("cursor","pointer");
				$(this_).find('img').each( function( index, e ) {
					switch(index) {
						case 0: // prev表示
							if(self.xcache_tmp < 0 && !self.timer){
								$(this).css({
									visibility: "visible",
									opacity: self.opts.buttonOpacity
								});
							}
							break;
						case 1: // pause表示
							if (self.timer) {
								$(this).css({
									visibility: "visible",
									opacity: self.opts.buttonOpacity
								});
							}
							break;
						case 2: // fwd表示
							if(self.maxLeft < self.xcache_tmp && !self.timer){
								$(this).css({
									visibility: "visible",
									opacity: self.opts.buttonOpacity
								});
							}
							break;
					}
				});
				$(this_).find('span').css({ // switch表示
								visibility: "visible",
								opacity: self.opts.buttonOpacity
				});

				timeout = setTimeout(function(){
					$(this_).find('span')
						.animate({
							opacity: 0
						}, self.opts.durationTime, function(){
							$(this_).css("cursor","none");
							$(this_).find('span').css({
								visibility: "hidden"
							});
						});
					$(this_).find('img')
						.animate({
							opacity: 0
						}, self.opts.durationTime, function(){
							$(this_).css("cursor","none");
							$(this_).find('img').css({
								visibility: "hidden"
							});
						});
				}, self.opts.intervalTime);
			});

			this.$id.mouseout(function(){
				var this_ = this;
					$(this_).find('span').css({
						visibility: "hidden"
					});
					$(this_).find('img').css({
						visibility: "hidden"
					});
			});

/* 2019-04-30
			this.$id.bind("touchstart", function(){
				event.preventDefault();
				if(timeout){ clearTimeout(timeout); }
				var this_ = this;
				$(this_).find('span')
					.css({
						visibility: "visible",
						opacity: 1
				});
				timeout = setTimeout(function(){
					$(this_).find('span')
						.animate({
							opacity: 0
						}, self.opts.durationTime,function(){
							$(this_).find('span').css({
								visibility: "hidden"
							});
						});
				}, self.opts.intervalTime);
			});
*/


		}

		if ( this.opts.scroll == true ) {
			var $table = $('<table></table>').css(baseBlockCss).css({ 	
				border: "0", 
				borderSpacing: "0",
				tableLayout: "fixed", // <td>を均等に割り付ける（キャメルケースで記載）
				verticalAlign: "middle"
			}).append(
				$('<tr></tr>').append(
					$('<td></td>').css({
						textAlign: "left",
						verticalAlign: "middle",
					}).append(
						$('<img/>', { 
							src: self.opts.buttonImgPrv
						}).css({opacity: self.opts.buttonOpacity}).click(function(){
							self.automovePrc(-1);
						}).bind("touchstart", function(){
							event.preventDefault();
							self.automovePrc(-1);
						})
					)
				).append(
					$('<td></td>').css({
						textAlign: "center",
						verticalAlign: "middle",
					}).append(
						$('<img/>', { 
							src: self.opts.buttonImgPause
						}).css({opacity: self.opts.buttonOpacity}).click(function(){
							clearInterval(self.timer);
							self.timer = "";
 						}).bind("touchstart", function(){
							event.preventDefault();
							clearInterval(self.timer);
							self.timer = "";
						})
					)
				).append(
					$('<td></td>').css({
						textAlign: "right",
						verticalAlign: "middle",
					}).append(
						$('<img/>', { 
							src: self.opts.buttonImgFwd
						}).css({opacity: self.opts.buttonOpacity}).click(function(){
							self.automovePrc(1);
						}).bind("touchstart", function(){
							event.preventDefault();
							self.automovePrc(1);
						})
					)
				)
			);
			this.$id.append($table);
		}

		if ( this.opts.src2 ) { // 画像の切り替え
			var $switch = $('<span></span>', { text: self.opts.switchText }).css({
				fontSize: self.opts.switchSize,
				backgroundColor: self.opts.switchBgColor,
				padding: self.opts.switchPadding,
				color: self.opts.switchColor,
				opacity: self.opts.buttonOpacity,
				verticalAlign: "top",
				textAlign: "center",
			}).click(function(){
				if ( self.$id.find('div:nth-child(2)').css("opacity") == 0 ) {
					self.$id.find('div:nth-child(2)').animate({opacity: self.opts.buttonOpacity},self.opts.durationTime);
				} else {
					self.$id.find('div:nth-child(2)').animate({opacity: 0.0},self.opts.durationTime);
				}
			}).bind("touchstart", function() {
				event.preventDefault();
				if ( self.$id.find('div:nth-child(2)').css("opacity") == 0 ) {
					self.$id.find('div:nth-child(2)').animate({opacity: self.opts.buttonOpacity},self.opts.durationTime);
				} else {
					self.$id.find('div:nth-child(2)').animate({opacity: 0.0},self.opts.durationTime);
				}
			})

			this.$id.append(
				$("<p></p>")					
					.css({
					    position: "absolute",
					    top: "30%",
					    right: 0,
					    left: 0,
						display: "table-cell",
						textAlign: "center",
//						cursor: "pointer"
					}).append($switch)
			);
		}

		this.img = new Image();

		this.img.onload = function(){ // imageが読み込まれたら、imageの幅を取得して、maxLeftを定義する。

			var imgRatio = self.$id.height() / self.img.height;  // 画像の高さを合わせて表示するための変形比率を定義
			self.imgWidth = self.img.width * imgRatio; // 変形画像の幅
			self.imgHeight = self.$id.height(); // 変形画像の高さ

			if ( self.opts.round == false ) {
				self.maxLeft = self.$id.width() - self.imgWidth;
					// もっとも左に移動したときの画像の左端のスクリーンの左端に対する座標<0
			} else {  // 360°パノラマの場合
				self.maxLeft = self.$id.width() - self.imgWidth * 10;  // 2017-11-02 変更 *2 to *10
					// もっとも左に移動したときの画像の左端のスクリーンの左端に対する座標<0
			}
			self.xcache_tmp = 0; // 2019-04-27

			self.$id.find('div:first').css({ // 画像用の<div>を設定
				opacity: 1.0,
				backgroundImage: "url(" + self.opts.src + ")", // キャメルケースで記載（"background-image"→backgroundImage)
//				backgroundSize: self.imgWidth + "px," + self.imgHeight + "px", // 変形比率で表示 
				backgroundSize: "auto 100%",  // 2017-10-30 変更
				width: self.imgWidth*10 + "px"  // 2017-11-02 変更 *2 to *10
			});
			self.$id.find('div:last').css({ // 切り替え画像用の<div>を設定
				opacity: 0.0,
				backgroundImage: "url(" + self.opts.src2 + ")", // キャメルケースで記載（"background-image"→backgroundImage)
//				backgroundSize: self.imgWidth + "px," + self.imgHeight + "px", // 変形比率で表示 
				backgroundSize: "auto 100%",  // 2017-10-30 変更
				width: self.imgWidth*10 + "px"  // 2017-11-02 変更 *2 to *10
			});
		}

		this.img.src = this.opts.src;
		this.maxLeft = self.maxLeft;
		this.imgWidth = self.imgWidth;
		this.imgHeight = self.Height;
	
		this.$id.mousedown( function(e) { 
			self.opts.dragObj = true;
			var x = e.pageX ;  // マウスダウンした場所のスクリーンの座標
			self.opts.dx = x - self.opts.xcache;  // マウスダウンした場所の画像の座標
			return false;  // ドラッグで文字が選択されないようにする。
		});
		this.$id.mouseup( function(e) { 
			self.opts.dragObj = false;
		});
		this.$id.mousemove( function(e) { 
			if(!self.opts.dragObj)return;
			var x = e.pageX ;
			self.xcache_tmp = x - self.opts.dx; // ドラッグによる移動量

			// 	以下、2017-11-02追加
			var imgRatio = self.$id.height() / self.img.height;  // 画像の高さを合わせて表示するための変形比率を定義
			self.imgWidth = self.img.width * imgRatio; // 変形画像の幅
			if ( self.opts.round == false ) {
				self.maxLeft = self.$id.width() - self.imgWidth; 
					// もっとも左に移動したときの画像の左端のスクリーンの左端に対する座標<0
			} else {  // 360°パノラマの場合
				self.maxLeft = self.$id.width() - self.imgWidth * 10;
					// もっとも左に移動したときの画像の左端のスクリーンの左端に対する座標<0
			}

			if ( self.opts.round == true ) { self.roundPrc(); }; // 360°パノラマの場合
			if(self.maxLeft < self.xcache_tmp && 0 > self.xcache_tmp){ self.movePrc(); }; // 画像が可動の範囲であれば実行
		});

		this.$id.bind("touchstart", function() {
			event.preventDefault();
			self.opts.dragObj = true;
			var x = event.changedTouches[0].pageX ;  // マウスダウンした場所のスクリーンの座標
			self.opts.dx = x - self.opts.xcache;  // マウスダウンした場所の画像の座標
			return false;  // ドラッグで文字が選択されないようにする。
		});
		this.$id.bind("touchend", function() { 
			event.preventDefault();
			self.opts.dragObj = false;
		});
		this.$id.bind("touchmove", function() { 
			event.preventDefault();
			if(!self.opts.dragObj)return;
			var x = event.changedTouches[0].pageX ;
			self.xcache_tmp = x - self.opts.dx; // ドラッグによる移動量

			// 	以下、2017-11-02追加
			var imgRatio = self.$id.height() / self.img.height;  // 画像の高さを合わせて表示するための変形比率を定義
			self.imgWidth = self.img.width * imgRatio; // 変形画像の幅
			if ( self.opts.round == false ) {
				self.maxLeft = self.$id.width() - self.imgWidth; 
					// もっとも左に移動したときの画像の左端のスクリーンの左端に対する座標<0
			} else {  // 360°パノラマの場合
				self.maxLeft = self.$id.width() - self.imgWidth * 10;
					// もっとも左に移動したときの画像の左端のスクリーンの左端に対する座標<0
			}
			if ( self.opts.round == true ) { self.roundPrc(); }; // 360°パノラマの場合
			if(self.maxLeft < self.xcache_tmp && 0 > self.xcache_tmp){ self.movePrc(); }; // 画像が可動の範囲であれば実行
		});
	
	};

	$.extend($.dragPanorama.prototype,{

		roundPrc: function() { // 360°パノラマの場合の処理
			if ( this.xcache_tmp >= 0 ) {this.xcache_tmp -= this.imgWidth;}
			if ( this.xcache_tmp <= this.maxLeft ) {this.xcache_tmp += this.imgWidth*9;} // 2017-11-04 1 -> 9
		},

		movePrc: function() { // 移動処理
			this.$id.find('div').css("left", this.xcache_tmp + "px");
			this.opts.xcache = this.xcache_tmp; // 画像の左端のスクリーンの左端に対する座標
		},

		automovePrc: function(moveStep) { // 自動移動
			if (this.timer) return;
			var self = this;
			this.timer = setInterval(function(){
				self.xcache_tmp = self.opts.xcache - moveStep;

				// 	以下、2017-11-02追加
				var imgRatio = self.$id.height() / self.img.height;  // 画像の高さを合わせて表示するための変形比率を定義
				self.imgWidth = self.img.width * imgRatio; // 変形画像の幅
				if ( self.opts.round == false ) {
					self.maxLeft = self.$id.width() - self.imgWidth; 
						// もっとも左に移動したときの画像の左端のスクリーンの左端に対する座標<0
				} else {  // 360°パノラマの場合
					self.maxLeft = self.$id.width() - self.imgWidth * 10;
						// もっとも左に移動したときの画像の左端のスクリーンの左端に対する座標<0
				}

				if ( self.opts.round == true ) { self.roundPrc(); }; // 360°パノラマの場合
				if(self.maxLeft < self.xcache_tmp && self.xcache_tmp < 0){ // 画像が可動の範囲であれば実行
					self.movePrc();
				} else {
					clearInterval(self.timer);
					self.timer = "";
				}
			}, 1000/self.opts.speed )
		}
	});

})(jQuery);
