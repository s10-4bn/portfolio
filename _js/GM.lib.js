var GMKml = function(options) {
// Google My Maps で作成したKmlを表示する
// 1.1 ラインの中央にnameを表示するように変更した。
// 2.0 click,mouseoverに対応する等機能を拡張した。
// hotspotを反映するようにした（2017-10-09）
//
// スタイルが崩れるのを防ぐため、mapのdivエレメントに次のスタイルを指定すること
// （this.div_.style.width = "fit-content"; を追加したので不要かもしれない）
/*
#map_canvas label{
	width: auto;
	display: inline;
}
#map_canvas img { 
	max-width: none; 
	max-height: none; 
}
*/
// 2018-07-07 地図の右半分でラベルの文字が自動改行されてしまうのを以下にて対策した。
// 	this.div_.style.whiteSpace = "nowrap";  を追加した。
/*
2019-05-04: zIndexを入力できるように変更した。
2019-08-14: descriptionのリンクをクリックできるように変更した。
*/

	var defaults = {
		useDefaultIcon: false,
		defaultIcon: "http://s10-4bn.sunnyday.jp/_icon/pin.png",
		tempIcon: "http://www.gstatic.com/mapspro/images/stock/503-wht-blank_maps.png",
		fontWeight: "bold",
		fontSize: "14px",
		fontFamily: "arial, sans-serif",
		point: {
			zIndex: 9999, // 2019-05-04 追加
			showTitle: true,
			showDescription: false,
			click: "showDescription",
			mouseover: null,
			title: {
				font: "bold 14px arial, sans-serif",
				color: "black",
				margin: "0px",
				backgroundColor: "rgba( 255, 255, 255, 0.7)"
			},
			description: {
				backgroundColor: "white",
				font: "normal 14px arial, sans-serif",
				color: "black",
				margin: "0px",
				closeButtonSrc: "http://s10-4bn.sunnyday.jp/_icon/close.png"
			}
		},
		line: {
			zIndex: 95, // 2019-08-15 追加
			showTitle: true,
			showDescription: false,
			click: "showDescription",
			mouseover: null,
			margin: "0px",
			padding: "5px",
			title: {
				font: "bold 14px arial, sans-serif",
				color: "black",
				margin: "0px"
			},
			description: {
				backgroundColor: "white",
				font: "normal 14px arial, sans-serif",
				color: "black",
				margin: "0px",
				padding: "5px",
				closeButtonSrc: "http://s10-4bn.sunnyday.jp/_icon/close.png"
			}
		},
		polygon: {
			zIndex: 90, // 2019-08-15 追加
			showTitle: true,
			showDescription: false,
			click: "showDescription",
			mouseover: null,
			title: {
				font: "bold 14px arial, sans-serif",
				color: "black",
				margin: "0px"
			},
			description: {
				backgroundColor: "white",
				font: "normal 14px arial, sans-serif",
				color: "black",
				margin: "0px",
				closeButtonSrc: "http://s10-4bn.sunnyday.jp/_icon/close.png"
			}
		},
	};

	$.extend(true, this, defaults, options); // デフォルトオプションと渡されたオプションのマージ

	this.init();

};

// KMLファイル読み込みマーカーへデータ格納
GMKml.prototype.init = function(){

	var self = this;

	//	ポイントの設定
	self.point.data = [];
	var index = 0;
 	$(self.xml).find("Placemark").each(function(){
		var name = $(this).find("name").text();
		var styleUrl = $(this).find("styleUrl").text().substr(1);
		var description = $(this).find("description").text();
		$(this).find("Point").each(function(){
			var coordinates = $(this).find("coordinates").text().split(",");
			var lng = coordinates[0];
			var lat = coordinates[1];
			var latlng = new google.maps.LatLng(lat,lng);
			// Styleを<Style>から探す
 			$(self.xml).find("Style").each(function(){
				if ( $(this).attr("id") == styleUrl ) {
					self.point.data[index] = setPointData(this, self, latlng, name, description);
				}
			});
			// Styleを<StyleMap>から探す
 			$(self.xml).find("StyleMap").each(function(){
				if ( $(this).attr("id") == styleUrl ) { 
					$(this).find("Pair").each(function(){
						if ( $(this).find("key").text() == "normal" ){
							var styleUrl = $(this).find("styleUrl").text().substr(1);
				 			$(self.xml).find("Style").each(function(){
								if ( $(this).attr("id") == styleUrl ) {
									self.point.data[index] = setPointData(this, self, latlng, name, description);
								}
							});
						}
					});
				}
			});
			index++;
		});
	});

	//	ラインの設定
	self.line.data = [];
	var index = 0;
 	$(self.xml).find("Placemark").each(function(){
		var name = $(this).find("name").text();
		var description = $(this).find("description").text();
		var styleUrl = $(this).find("styleUrl").text().substr(1);
		$(this).find("LineString").each(function(){
			var coordinates = [];
			var coordinatesTmp = $(this).find("coordinates").text().split(" ");
			for ( i = 0; i < coordinatesTmp.length; i++ ) {
				var tmp = { lat: Number(coordinatesTmp[i].split(",")[1]),
									  lng: Number(coordinatesTmp[i].split(",")[0])
				}
				if (tmp.lat) coordinates.push(tmp);
			}
			var latlng = new google.maps.LatLng(coordinates[parseInt(coordinates.length/2)].lat,coordinates[parseInt(coordinates.length/2)].lng);
			// Styleを<Style>から探す
 			$(self.xml).find("Style").each(function(){
				if ( $(this).attr("id") == styleUrl ) {
					self.line.data[index] = selfLineData(this, self, coordinates,	latlng, name, description);
				}
			});
			// Styleを<StyleMap>から探す
 			$(self.xml).find("StyleMap").each(function(){
				if ( $(this).attr("id") == styleUrl ) { 
					$(this).find("Pair").each(function(){
						if ( $(this).find("key").text() == "normal" ){
							var styleUrl = $(this).find("styleUrl").text().substr(1);
				 			$(self.xml).find("Style").each(function(){
								if ( $(this).attr("id") == styleUrl ) {
									self.line.data[index] = selfLineData(this, self, coordinates, latlng, name, description);

								}
							});
						}
					});
				}
			});
			index++;
		});
	});

	//	ポリゴンの設定
	self.polygon.data = [];
	var index = 0;
 	$(self.xml).find("Placemark").each(function(){
		var name = $(this).find("name").text();
		var description = $(this).find("description").text();
		var styleUrl = $(this).find("styleUrl").text().substr(1);
		$(this).find("Polygon").each(function(){
			var coordinates = [];
			var coordinatesTmp = $(this).find("coordinates").text().split(" ");
			for ( i = 0; i < coordinatesTmp.length; i++ ) {
				var tmp = { lat: Number(coordinatesTmp[i].split(",")[1]),
									  lng: Number(coordinatesTmp[i].split(",")[0])
				}
				if (tmp.lat) coordinates.push(tmp);
			}
			var latlng = new google.maps.LatLng(coordinates[parseInt(coordinates.length/2)].lat,coordinates[parseInt(coordinates.length/2)].lng);
			// Styleを<Style>から探す
 			$(self.xml).find("Style").each(function(){
				if ( $(this).attr("id") == styleUrl ) {
				  self.polygon.data[index] = selfPolygonData(this, self, coordinates, latlng, name, description);
				}
			});
			// Styleを<StyleMap>から探す
 			$(self.xml).find("StyleMap").each(function(){
				if ( $(this).attr("id") == styleUrl ) { 
					$(this).find("Pair").each(function(){
						if ( $(this).find("key").text() == "normal" ){
							var styleUrl = $(this).find("styleUrl").text().substr(1);
				 			$(self.xml).find("Style").each(function(){
								if ( $(this).attr("id") == styleUrl ) {
								  self.polygon.data[index] = selfPolygonData(this, self, coordinates, latlng, name, description);
								}
							});
						}
					});
				}
			});
			index++;
		});
	});

	return self;

	function setPointData(that, self, latlng, name, description){
		var iconUrl = $(that).find("href").text();
		var iconX = $(that).find("hotSpot").attr("x") || 0;
		var iconY = $(that).find("hotSpot").attr("y") || 0;
		if ( self.useDefaultIcon == true && iconUrl == self.tempIcon ) iconUrl = self.defaultIcon;							
		var $content = $('<p></p>').css({
						font: self.point.title.font,
						color: self.point.title.color,
						margin: self.point.title.margin,
						backgroundColor: self.point.title.backgroundColor
				}).text(name);
		var http = description.match(/http.*?html/);
		if(http) description = description.replace(http[0], "<a href='" + http[0] + "' target=_blank>" + http[0] + "</a>");
		var $description = $('<div></div>').css({
			backgroundColor : self.point.description.backgroundColor
		})
		.append(
			$('<p></p>').css({
				font: self.point.title.font,
				color: self.point.title.color,
				margin: self.point.title.margin
			}).text(name)
		)
		.append(
			$('<div>' + description + '</div>').css({
				font: self.point.description.font,
				color: self.point.description.color,
				margin: self.point.description.margin
			})
		)
		.append(
			$('<div style="text-align: right; cursor: pointer;"><img src=' + self.point.description.closeButtonSrc + '></div>')
		)
		;
		var obj = {
			position: new google.maps.Marker({
				map: self.map, 
				position: latlng,
				icon: {
					url: iconUrl,
					anchor: new google.maps.Point(iconX, iconY)
				},
				zIndex: self.point.zIndex
			}),
			title: new GMOverlayHtml({
				map: self.map, 
				position: latlng,
				offsetX: 16,
				offsetY: -22,
				content: $content[0].outerHTML
			}),
			description: new GMOverlayHtml({
				map: self.map, 
				position: latlng,
				offsetX: 16,
				offsetY: -22,
				content: $description[0].outerHTML
			})
		};
		return obj;
	};

	function selfLineData(that, self, coordinates, latlng, name, description){
		var strokeColorBGR = $(that).find("LineStyle").find("color").text().substr(2);
		var strokeColor = "#" + strokeColorBGR.substr(4,2) + strokeColorBGR.substr(2,2) +strokeColorBGR.substr(0,2);
		var strokeWeight = $(that).find("LineStyle").find("width").text();
		var strokeOpacity = parseInt($(that).find("LineStyle").find("color").text().substr(0,2), 16)/255;
		var $content = $('<p></p>').css({
						font: self.line.title.font,
						color: self.line.title.color,
						margin: self.line.title.margin
				}).text(name);
		var http = description.match(/http.*?html/);
		if(http) description = description.replace(http[0], "<a href='" + http[0] + "' target=_blank>" + http[0] + "</a>");
		var $description = $('<div></div>').css({
			backgroundColor : self.line.description.backgroundColor,
			padding: self.line.padding
		})
		.append(
			$('<p></p>').css({
				font: self.line.title.font,
				color: self.line.title.color,
				margin: self.line.title.margin
			}).text(name)
		)
		.append(
			$('<div>' + description + '</div>').css({
				font: self.line.description.font,
				color: self.line.description.color,
				margin: self.line.description.margin,
				padding: self.line.description.padding
			})
		)
		.append(
			$('<div style="text-align: right; cursor: pointer;"><img src=' + self.line.description.closeButtonSrc + '></div>')
		)
		;
		var obj = {
			path: new google.maps.Polyline({
		    path: coordinates,
		    strokeColor: strokeColor,
		    strokeOpacity: strokeOpacity,
		    strokeWeight: strokeWeight,
				zIndex: self.line.zIndex
  		}),
			title: new GMOverlayHtml({
				map: self.map, 
				position: latlng,
				offsetX: 5,
				offsetY: -14,
				content: $content[0].outerHTML
			}),
			description: new GMOverlayHtml({
				map: self.map, 
				position: latlng,
				offsetX: 16,
				offsetY: -22,
				content: $description[0].outerHTML
			})
		}
		return obj;
	};

	function selfPolygonData(that, self, coordinates, latlng, name, description){
		var strokeColorBGR = $(that).find("LineStyle").find("color").text().substr(2);
		var strokeColor = "#" + strokeColorBGR.substr(4,2) + strokeColorBGR.substr(2,2) +strokeColorBGR.substr(0,2);
		var strokeWeight = $(that).find("LineStyle").find("width").text();
		var fillColorBGR = $(that).find("PolyStyle").find("color").text().substr(2);
		var fillColor = "#" + strokeColorBGR.substr(4,2) + strokeColorBGR.substr(2,2) +strokeColorBGR.substr(0,2);
		var strokeWeight = $(that).find("LineStyle").find("width").text();
		var strokeOpacity = parseInt($(that).find("LineStyle").find("color").text().substr(0,2), 16)/255;
		var fillOpacity = parseInt($(that).find("PolyStyle").find("color").text().substr(0,2), 16)/255;
		var $content = $('<p></p>').css({
			font: self.polygon.title.font,
			color: self.polygon.title.color,
			margin: self.polygon.title.margin
		}).text(name);
		var http = description.match(/http.*?html/);
		if(http) description = description.replace(http[0], "<a href='" + http[0] + "' target=_blank>" + http[0] + "</a>");
		var $description = $('<div></div>').css({
			backgroundColor : self.polygon.description.backgroundColor
		})
		.append(
			$('<p></p>').css({
				font: self.polygon.title.font,
				color: self.polygon.title.color,
				margin: self.polygon.title.margin
			}).text(name)
		)
		.append(
			$('<div>' + description + '</div>').css({
				font: self.polygon.description.font,
				color: self.polygon.description.color,
				margin: self.polygon.description.margin
			})
		)
		.append(
			$('<div style="text-align: right; cursor: pointer;"><img src=' + self.polygon.description.closeButtonSrc + '></div>')
		)
		;
		var obj = {
			path: new google.maps.Polygon({
		    paths: coordinates,
		    strokeColor: strokeColor,
		    strokeOpacity: strokeOpacity,
		    strokeWeight: strokeWeight,
		    fillColor: fillColor,
		    fillOpacity: fillOpacity,
				zIndex: self.polygon.zIndex
		  }),
			title: new GMOverlayHtml({
				map: self.map, 
				position: latlng,
				offsetX: 5,
				offsetY: -14,
				content: $content[0].outerHTML
			}),
			description: new GMOverlayHtml({
				map: self.map, 
				position: latlng,
				offsetX: 16,
				offsetY: -22,
				content: $description[0].outerHTML
			})
		};
		return obj;
	};

}
 
// kmlデータを表示
GMKml.prototype.setMap = function (map){

	var self = this;

	//	ポイントを表示
 	$.each(self.point.data, function(index){

		// 初期設定
		self.point.data[index].position.setMap(map);
		if ( self.point.showTitle == true ) {
			self.point.data[index].title.setMap(map);
		}

		// mouseoverの処理
		if ( self.point.mouseover == "showTitle" ) {
			var marker = self.point.data[index].position;
			var overlayHtml = self.point.data[index].title;
	  	google.maps.event.addListener(marker, 'mouseover', function(e) {
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(null);
		  	});
	  	});
		} else if ( self.point.mouseover == "showDescription" ) {
			var marker = self.point.data[index].position;
			var overlayHtml = self.point.data[index].description;
	  	google.maps.event.addListener(marker, 'mouseover', function(e) {
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(null);
		  	});
	  	});
		}

		// clickの処理
		if ( self.point.click == "showTitle" ) {
			var marker = self.point.data[index].position;
			var overlayHtml = self.point.data[index].title;
			overlayHtml.click = "remove";
	  	google.maps.event.addListener(marker, 'click', function(e) {
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(self.map);
		  	});
	  	});
		} else if ( self.point.click == "showDescription" ) {
			var marker = self.point.data[index].position;
			var overlayHtml = self.point.data[index].description;
			overlayHtml.click = "remove";
	  	google.maps.event.addListener(marker, 'click', function(e) {
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(self.map);
		  	});
	  	});
		}

	});

	//	ラインを表示
 	$.each(self.line.data, function(index){

		// 初期設定
		self.line.data[index].path.setMap(map);
		if ( self.line.showTitle == true ) {
			self.line.data[index].title.setMap(map);
		}

		// mouseoverの処理
		if ( self.line.mouseover == "showTitle" ) {
			var marker = self.line.data[index].path;
			var overlayHtml = self.line.data[index].title;
	  	google.maps.event.addListener(marker, 'mouseover', function(e) {
				overlayHtml.position = e.latLng;
				marker.position = e.latLng;
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(null);
	  		});
	  	});
		} else if ( self.line.mouseover == "showDescription" ) {
			var marker = self.line.data[index].path;
			var overlayHtml = self.line.data[index].description;
	  	google.maps.event.addListener(marker, 'mouseover', function(e) {
				overlayHtml.position = e.latLng;
				marker.position = e.latLng;
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(null);
		  	});
	  	});


		}

		// clickの処理
		if ( self.line.click == "showTitle" ) {
			var marker = self.line.data[index].path;
			var overlayHtml = self.line.data[index].title;
			overlayHtml.click = "remove";
	  	google.maps.event.addListener(marker, 'click', function(e) {
				overlayHtml.position = e.latLng;
				marker.position = e.latLng;
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(self.map);
		  	});
	  	});
		} else if ( self.line.click == "showDescription" ) {
			var marker = self.line.data[index].path;
			var overlayHtml = self.line.data[index].description;
			overlayHtml.click = "remove";
	  	google.maps.event.addListener(marker, 'click', function(e) {
				overlayHtml.position = e.latLng;
				marker.position = e.latLng;
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(self.map);
		  	});
	  	});

		}

	});

	//	ポリゴンを表示
 	$.each(self.polygon.data, function(index){

		// 初期設定
		self.polygon.data[index].path.setMap(map);
		if ( self.polygon.showTitle == true ) {
			self.polygon.data[index].title.setMap(map);
		}

		// mouseoverの処理
		if ( self.polygon.mouseover == "showTitle" ) {
			var marker = self.polygon.data[index].path;
			var overlayHtml = self.polygon.data[index].title;
	  	google.maps.event.addListener(marker, 'mouseover', function(e) {
				overlayHtml.position = e.latLng;
				marker.position = e.latLng;
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(null);
		  	});
	  	});
		} else if ( self.polygon.mouseover == "showDescription" ) {
			var marker = self.polygon.data[index].path;
			var overlayHtml = self.polygon.data[index].description;
	  	google.maps.event.addListener(marker, 'mouseover', function(e) {
				overlayHtml.position = e.latLng;
				marker.position = e.latLng;
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(null);
		  	});
	  	});
		}

		// clickの処理
		if ( self.polygon.click == "showTitle" ) {
			var marker = self.polygon.data[index].path;
			var overlayHtml = self.polygon.data[index].title;
			overlayHtml.click = "remove";
	  	google.maps.event.addListener(marker, 'click', function(e) {
				overlayHtml.position = e.latLng;
				marker.position = e.latLng;
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(null);
		  	});
	  	});
		} else if ( self.polygon.click == "showDescription" ) {
			var marker = self.polygon.data[index].path;
			var overlayHtml = self.polygon.data[index].description;
			overlayHtml.click = "remove";
	  	google.maps.event.addListener(marker, 'click', function(e) {
				overlayHtml.position = e.latLng;
				marker.position = e.latLng;
				overlayHtml.setMap(self.map);
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(null);
		  	});
	  	});
		}

	});

}

// ViewportのLatLngBoundsを計算
GMKml.prototype.getDefaultViewport = function (){

	var self = this;
	var lat = [];
	var lng = [];

	//	ポイント
 	$.each(self.point.data, function(i){
		var point = self.point.data[i].position.getPosition();
			lat.push(point.lat());
			lng.push(point.lng());
	});

	//	ライン
 	$.each(self.line.data, function(i){
		var lineArray = self.line.data[i].path.getPath().getArray();
		$.each(lineArray, function(j){
			lat.push(lineArray[j].lat());
			lng.push(lineArray[j].lng());
		});
	});

	//	ポリゴン
 	$.each(self.polygon.data, function(i){
		var polygonArray = self.polygon.data[i].path.getPath().getArray();
		$.each(polygonArray, function(j){
			lat.push(polygonArray[j].lat());
			lng.push(polygonArray[j].lng());
		});
	});

	var sw = new google.maps.LatLng(Math.min.apply(null,lat), Math.min.apply(null,lng)); 
	var ne = new google.maps.LatLng(Math.max.apply(null,lat), Math.max.apply(null,lng)); 

	return new google.maps.LatLngBounds(sw,ne);

}

google.maps.LatLngBounds.prototype.getZoom = function (mapId){

	var maxLat = this.getNorthEast().lat();
	var maxLng = this.getNorthEast().lng();
	var minLat = this.getSouthWest().lat();
	var minLng = this.getSouthWest().lng();

	var rangeLat = maxLat-minLat;
	var rangeLng = maxLng-minLng;
	var zoomLat = Math.floor( Math.log(340/rangeLat*$('#'+mapId).height()/256) / Math.log(2) );
	var zoomLng = Math.floor( Math.log(340/rangeLng*$('#'+mapId).width()/256) / Math.log(2) );

	return Math.min ( zoomLat, zoomLng );

}


var GMOverlayHtml = function(opts) { // ver.4.0
// ver.3.0 jQueryを用いた記述に変更
// ver.3.1 animationを選択できるように変更
// ver.3.2 contentに入力したときにエラーが出るのを修正した（2016-12-27）
// ver.4.0 IE,Firefoxでの不具合対応(2017-08-26)
// ver.4.1 widthを入力可能にした（2017-09-16）
	var defaults = {
		width: null,
		offsetX: 0,
		offsetY: 0,
		position: null,
		content: null,
		$content: null,
		animation: null, // スライドアップさせるときは "slideUp"
		click: null
	}
	$.extend( true, this, defaults, opts );

//	this.setMap(this.map);

}

// 	以下は、https://developers.google.com/maps/documentation/javascript/customoverlays に従って記載。

GMOverlayHtml.prototype = new google.maps.OverlayView();

GMOverlayHtml.prototype.onAdd = function() {
	// 何度も呼ばれる可能性があるので、div_が未設定の場合のみ要素生成
  if (!this.div_) {
  	// 出力したい要素生成
    this.div_ = document.createElement( "div" );
    this.div_.style.position = "absolute";
    this.div_.style.border = "0px none";
		if (this.content) this.$content = $(this.content); // 2016-12-27 修正
		if (this.$content) $(this.div_).append(this.$content);
    // 要素を追加する子を取得
    var panes = this.getPanes();
    // 要素追加
		$(panes.floatPane).append(this.div_);

  }

}

GMOverlayHtml.prototype.draw = function() {

  if (this.div_) {

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
	
		this.div_.style.left = ( point.x + offsetX ) + 'px';
		this.div_.style.width = "fit-content"; // 2017-08-26 追加
		this.div_.style.whiteSpace = "nowrap";   // 2018-07-07 追加
		if ( this.width ) this.div_.style.width = this.width
	
		switch (this.animation) {
			case "slideUp":
				$(this.div_).css({
					bottom: -Math.round( point.y + offsetY ) + "px"
				});
				this.$content.css({
					display: 'none',
				}).stop(true,true).slideDown();
				break;
			case "slideDown":
	  		this.div_.style.top = ( point.y + offsetY ) + 'px';
				this.$content.css({
					display: 'none',
				}).stop(true,true).slideDown();
				break;
			default:
	  		this.div_.style.top = ( point.y + offsetY ) + 'px';
				break;
		}
	
		var self = this;
	  google.maps.event.addDomListener(self.div_, "click", function(e) {
		 	if(self.click == "remove"){	
				self.setMap(null);
			}
	  });

	}
}

GMOverlayHtml.prototype.onRemove = function() {
	if (this.div_) {
		this.div_.parentNode.removeChild(this.div_);
		this.div_ = null;
	}
}



