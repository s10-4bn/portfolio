var GMOverlayHtml = function(opts) { // ver.3.2
// ver.3.0 jQueryを用いた記述に変更
// ver.3.1 animationを選択できるように変更
// ver.3.2 contentに入力したときにエラーが出るのを修正した（2016-12-27）
	var defaults = {
		offsetX: 0,
		offsetY: 0,
		position: null,
		content: null,
		$content: null,
		animation: null // スライドアップさせるときは "slideUp"
	}
	$.extend( true, this, defaults, opts );
}

// 	以下は、https://developers.google.com/maps/documentation/javascript/customoverlays に従って記載。

GMOverlayHtml.prototype = new google.maps.OverlayView();

GMOverlayHtml.prototype.onAdd = function() {
	// 何度も呼ばれる可能性があるので、divが未設定の場合のみ要素生成
	if (!this.$div) {
		// 出力したい要素生成
		this.$div = $('<div></div>').css({
			position: 'absolute',
			border: '0px none'
		});
		if (this.content) this.$content = $(this.content); // 2016-12-27 修正
		if (this.$content) this.$div.append(this.$content);
		// 要素を追加する子を取得
		var panes = this.getPanes();
		// 要素追加
		$(panes.overlayImage).append( this.$div ); // overlayImage: marker の foreground を含む pane
	}
}

GMOverlayHtml.prototype.draw = function() {
	// 緯度、軽度の情報を、Pixel（google.maps.Point）に変換
	var point = this.getProjection().fromLatLngToDivPixel(this.position);

	var offsetX = this.offsetX;
	var offsetY = this.offsetY;
	if ( typeof this.offsetX == "string" ) {
		if ( this.offsetX.slice(-1) == "%" ) {
			offsetX = this.offsetX.slice(0,-1)/100*this.$content.width();
		}
		if ( this.offsetX.slice(-2) == "px" ) {
			offsetX = Number( this.offsetX.slice(0,-2) );
		}
	}
	if ( typeof this.offsetY == "string" ) {
		if ( this.offsetY.slice(-1) == "%" ) {
			offsetY = this.offsetY.slice(0,-1)/100*this.$content.height();
		}
		if ( this.offsetY.slice(-2) == "px" ) {
			offsetY = Number( this.offsetY.slice(0,-2) );
		}
	}

	switch (this.animation) {
		case "slideUp":
			this.$content.css({
				display: 'none',
				position: "fixed",
				left: point.x + offsetX + 'px',
				bottom: -( point.y + offsetY ) + "px"
			}).stop(true,true).slideDown();
			break;
		default:
			this.$content.css({
				position: "fixed",
				left: point.x + offsetX + "px",
				top: point.y + offsetY + "px"
			});
			break;
	}

}

GMOverlayHtml.prototype.onRemove = function() {
	if (this.$div) {
		this.$div.remove();
		this.$div = null;
	}
}


