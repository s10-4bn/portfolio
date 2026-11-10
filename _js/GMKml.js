var GMKml = function(options) { // ver.1.1
// Kmlを表示する
// 1.1 ラインの中央にnameを表示するように変更した。

	var defaults = {
		useDefaultIcon: false,
		defaultIcon: "http://www.geocities.jp/winchester_cathedral_nostalgy/_icon/pin.png",
		tempIcon: "http://www.gstatic.com/mapspro/images/stock/503-wht-blank_maps.png",
		fontWeight: "bold",
		fontSize: "14px",
		fontFamily: "arial, sans-serif"
	};
	$.extend(true, this, defaults, options); // デフォルトオプションと渡されたオプションのマージ

	this.init();

};

// KMLファイル読み込みマーカーへデータ格納
GMKml.prototype.init = function(){

	var self = this;

	//	ポイントの設定
	self.point = [];
	var index = 0;
 	$(self.xml).find("Placemark").each(function(){
		var name = $(this).find("name").text();
		var styleUrl = $(this).find("styleUrl").text().substr(1);
		$(this).find("Point").each(function(){
			var coordinates = $(this).find("coordinates").text().split(",");
			var lng = coordinates[0];
			var lat = coordinates[1];
			var latlng = new google.maps.LatLng(lat,lng);

			// Styleを<Style>から探す
 			$(self.xml).find("Style").each(function(){
				if ( $(this).attr("id") == styleUrl ) {
					var iconUrl = $(this).find("href").text();
					if ( self.useDefaultIcon == true && iconUrl == self.tempIcon ) iconUrl = self.defaultIcon;							
					var $content = $('<a></a>').css({
										fontWeight: self.fontWeight,
										fontSize: self.fontSize,
										fontFamily: self.fontFamily
							}).text(name);

				  self.point[index] = {
						position: new google.maps.Marker({
													map: self.map, 
													position: latlng,
													icon: {
														url: iconUrl
													},
													clickable: false
						}),
						title: new GMOverlayHtml({
							map: self.map, 
							position: latlng,
							offsetX: 10,
							offsetY: -14,
							content: $content[0].outerHTML
						})
					};

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
									var iconUrl = $(this).find("href").text();
									if ( self.useDefaultIcon == true && iconUrl == self.tempIcon ) iconUrl = self.defaultIcon;							
									var $content = $('<a></a>').css({
														fontWeight: self.fontWeight,
														fontSize: self.fontSize,
														fontFamily: self.fontFamily
											}).text(name);

								  self.point[index] = {
										position: new google.maps.Marker({
																	map: self.map, 
																	position: latlng,
																	icon: {
																		url: iconUrl
																	},
																	clickable: false
										}),
										title: new GMOverlayHtml({
											map: self.map, 
											position: latlng,
											offsetX: 10,
											offsetY: -14,
											content: $content[0].outerHTML
										})
									};

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
	self.line = [];
	var index = 0;
 	$(self.xml).find("Placemark").each(function(){
		var name = $(this).find("name").text();
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
					var strokeColor = "#" + $(this).find("LineStyle").find("color").text().substr(2);
					var strokeWeight = $(this).find("LineStyle").find("width").text();
					var strokeOpacity = parseInt($(this).find("LineStyle").find("color").text().substr(0,2), 16)/255;

					var $content = $('<a></a>').css({
										fontWeight: self.fontWeight,
										fontSize: self.fontSize,
										fontFamily: self.fontFamily
							}).text(name);

				  self.line[index] = {
						path: new google.maps.Polyline({
					    path: coordinates,
					    strokeColor: strokeColor,
					    strokeOpacity: strokeOpacity,
					    strokeWeight: strokeWeight,
							clickable: false
  								}),
						title: new GMOverlayHtml({
							map: self.map, 
							position: latlng,
							offsetX: 5,
							offsetY: -14,
							content: $content[0].outerHTML
						})
					};

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
									var strokeColor = "#" + $(this).find("LineStyle").find("color").text().substr(2);
									var strokeWeight = $(this).find("LineStyle").find("width").text();
									var strokeOpacity = parseInt($(this).find("LineStyle").find("color").text().substr(0,2), 16)/255;

									var $content = $('<a></a>').css({
														fontWeight: self.fontWeight,
														fontSize: self.fontSize,
														fontFamily: self.fontFamily
											}).text(name);

								  self.line[index] = {
										path: new google.maps.Polyline({
									    path: coordinates,
									    strokeColor: strokeColor,
									    strokeOpacity: strokeOpacity,
									    strokeWeight: strokeWeight,
											clickable: false
	  								}),
										title: new GMOverlayHtml({
											map: self.map, 
											position: latlng,
											offsetX: 5,
											offsetY: -14,
											content: $content[0].outerHTML
										})
									};

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
	self.polygon = [];
	var index = 0;
 	$(self.xml).find("Placemark").each(function(){
		var name = $(this).find("name").text();
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

			// Styleを<Style>から探す
 			$(self.xml).find("Style").each(function(){
				if ( $(this).attr("id") == styleUrl ) {
					var strokeColor = "#" + $(this).find("LineStyle").find("color").text().substr(2);
					var strokeWeight = $(this).find("LineStyle").find("width").text();
					var fillColor = "#" + $(this).find("PolyStyle").find("color").text().substr(2);
					var strokeWeight = $(this).find("LineStyle").find("width").text();
					var strokeOpacity = parseInt($(this).find("LineStyle").find("color").text().substr(0,2), 16)/255;
					var fillOpacity = parseInt($(this).find("PolyStyle").find("color").text().substr(0,2), 16)/255;

				  self.polygon[index] = {
						path: new google.maps.Polygon({
					    paths: coordinates,
					    strokeColor: strokeColor,
					    strokeOpacity: strokeOpacity,
					    strokeWeight: strokeWeight,
					    fillColor: fillColor,
					    fillOpacity: fillOpacity,
							clickable: false
					  })
					}

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
									var strokeColor = "#" + $(this).find("LineStyle").find("color").text().substr(2);
									var strokeWeight = $(this).find("LineStyle").find("width").text();
									var fillColor = "#" + $(this).find("PolyStyle").find("color").text().substr(2);
									var strokeWeight = $(this).find("LineStyle").find("width").text();
									var strokeOpacity = parseInt($(this).find("LineStyle").find("color").text().substr(0,2), 16)/255;
									var fillOpacity = parseInt($(this).find("PolyStyle").find("color").text().substr(0,2), 16)/255;

								  self.polygon[index] = {
										path: new google.maps.Polygon({
									    paths: coordinates,
									    strokeColor: strokeColor,
									    strokeOpacity: strokeOpacity,
									    strokeWeight: strokeWeight,
									    fillColor: fillColor,
									    fillOpacity: fillOpacity,
											clickable: false
									  })
									}

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

}
 
// kmlデータを表示
GMKml.prototype.setMap = function (map){

	var self = this;

	//	ポイントを表示
 	$.each(self.point, function(i){
		self.point[i].position.setMap(map);
		self.point[i].title.setMap(map);
	});

	//	ラインを表示
 	$.each(self.line, function(i){
		self.line[i].path.setMap(map);
		self.line[i].title.setMap(map);
	});

	//	ポリゴンを表示
 	$.each(self.polygon, function(i){
		self.polygon[i].path.setMap(map);
	});

}

// ViewportのLatLngBoundsを計算
GMKml.prototype.getDefaultViewport = function (){

	var self = this;
	var lat = [];
	var lng = [];

	//	ポイント
 	$.each(self.point, function(i){
		var point = self.point[i].position.getPosition();
			lat.push(point.lat());
			lng.push(point.lng());
	});

	//	ライン
 	$.each(self.line, function(i){
		var lineArray = self.line[i].path.getPath().getArray();
		$.each(lineArray, function(j){
			lat.push(lineArray[j].lat());
			lng.push(lineArray[j].lng());
		});
	});

	//	ポリゴン
 	$.each(self.polygon, function(i){
		var polygonArray = self.polygon[i].path.getPath().getArray();
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
