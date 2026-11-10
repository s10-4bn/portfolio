var token_;  // KKK

var map;
var markerHere;

var group = [];
var pLatLng = [];
var hereLatLng;
var TB_photo = "YES";
var index;

var infobox;
var infobox_time;

var TimeZoneOffset = 9;

// index.html 内のモーダルから呼び出す初期化関数（iframeは使用しない）
function initMap2(options) {
    options = options || {};
    index = options.index;
    batchFlag = false;

    if (options.batch) {
        for (var i = 0; i < document.name_form.length; i++) {
//console.log(i,document.name_form[i].check.checked);
            if (document.name_form[i].check.checked) {
                batchFlag = true;
                break;
            }
        }
        if (!batchFlag) {
            alert("写真が選択されていません");
            closeMapModal();
            return false;
        }
        hereLatLng = new google.maps.LatLng(0, 0);
    } else {
        var selectedPhoto = photo[Number(index)];
        if (!selectedPhoto) return false;
        hereLatLng = new google.maps.LatLng(
            Number(selectedPhoto.latitude), Number(selectedPhoto.longitude)
        );
    }

    drawMap();
    return true;
}

// 画像検索を行う関数
function drawMap () {
	// 写真の位置情報だけを地図に表示します。GPX/XMLの読み込みは行いません。
	drawPhotoMap();
}


//　写真のhtml作成
function drawPhotoMap ( ) {

	var maxLat = -1000;
	var minLat =  1000;
	var maxLng = -1000;
	var minLng =  1000;
    for( var i=0; i<photo.length; i++ ) {

        var photoItem = photo[i];
		if ( parseFloat(photoItem.latitude) != 0 ) {
			if( parseFloat(photoItem.latitude) > maxLat) maxLat = parseFloat(photoItem.latitude);
			if( parseFloat(photoItem.latitude) < minLat) minLat = parseFloat(photoItem.latitude);
			if( parseFloat(photoItem.longitude) > maxLng) maxLng = parseFloat(photoItem.longitude);
			if( parseFloat(photoItem.longitude) < minLng) minLng = parseFloat(photoItem.longitude);
		}
	}
	var ctrLat = (maxLat+minLat)/2;
	var ctrLng = (maxLng+minLng)/2;
	var rangeLat = maxLat-minLat;
	var rangeLng = maxLng-minLng;
	var var_zoomLat = Math.floor( Math.log(180/rangeLat/256*600) / Math.log(2) );
	var var_zoomLng = Math.floor( Math.log(180/rangeLng/256*800) / Math.log(2) );
	var var_zoom = Math.min ( var_zoomLat, var_zoomLng ) +1;
	if(var_zoom>18) var_zoom=18;
	if (!var_zoom) {
		var ctrLat = 35.426669;
		var ctrLng = 140.304183;
		var_zoom = 10;
	}
	var point_ctr = new google.maps.LatLng(ctrLat,ctrLng);

	var myOptions = {
    	zoom: var_zoom,
    	center: point_ctr,
      	mapTypeId: google.maps.MapTypeId.ROADMAP
    };
 
 	map = new google.maps.Map(document.getElementById('map_canvas'),myOptions);


 	var photo_html = "";
	for (var i = 0; i < photo.length; i++) {
    	var photoItem = photo[i];

		var myLat = photoItem.latitude;
		var myLng = photoItem.longitude;
		pLatLng[i] = myLat + ',' + myLng;

		var group_num = 1000+i;
		group[i] = "Group" + group_num;

		for (var j=0; j<i; j++) {
			if (pLatLng[i] == pLatLng[j]) {
				 group[i] = group[j];
			}
		}

		if (group[i] == "Group" + group_num) {
		var image = new google.maps.MarkerImage('images/camera.png',
      		new google.maps.Size(32,32), // size
      		new google.maps.Point(0,0), // origin
      		new google.maps.Point(0, 32)); // anchor

		var marker = new google.maps.Marker({
        	position: new google.maps.LatLng(Number(myLat),Number(myLng)),
            map: map,
			icon: image
        });

		}

		var photo_title = "";
		photo_title += "<b>"+photoItem.title+"</b>";
		photo_title += '<span>('+photoItem.datetaken.substr(0,10)+')</span>';

		if ( photoItem.description._content != "" ){
			photo_title += "<p> 「"+photoItem.description._content+"」</p>";
		}

		// ローカル写真では localUrl を使用し、Flickr用URLを組み立てない
		var fullImageUrl = photoItem.localUrl || (
			photoItem.server && photoItem.secret
			? 'https://live.staticflickr.com/' + photoItem.server + '/' + photoItem.id + '_' + photoItem.secret + '.jpg'
			: ''
		);
		var thumbnailImageUrl = photoItem.thumbnailUrl || fullImageUrl;
		if (fullImageUrl) {
			photo_html += '<a href="' + fullImageUrl + '" title="' + photo_title +
				'" class="thickbox" rel="' + group[i] + '"><img src="' + thumbnailImageUrl + '"></a>';
		}

		if (group[i] == "Group" + group_num) {
		set_Marker_Info(marker, i);
		}

	}

	// 写真の座標を示す矢印を定義
	var image = new google.maps.MarkerImage('http://www.google.com/mapfiles/gadget/arrowSmall80.png',
    	new google.maps.Size(27, 31), // size
    	new google.maps.Point(0,0), // origin
    	new google.maps.Point(10, 31) // anchor
	);

	markerHere = new google.maps.Marker({
    	position: hereLatLng,
        map: map,
		icon: image
    });

//	document.getElementById("tmp").innerHTML = photo_html;
//	tb_init('a.thickbox');


  	google.maps.event.addListener(map, 'click', function(event) {
		hereLatLng = event.latLng;
		markerHere.setMap(null);
		markerHere = new google.maps.Marker({
    		position: hereLatLng,
        	map: map,
			icon: image
    	});


  	});

}

// mouseoverで表示する写真を定義
function set_Marker_Info(marker, num) {

    // グローバルの写真配列から対象写真を取得する
    var photoItem = window.photo && window.photo[num];
    if (!photoItem) {
        console.warn("写真データが見つかりません。index:", num);
        return;
    }

    var photoTitle = photoItem.title || "";
    // ローカル写真は localUrl、Flickr写真は Flickr のサムネイルURLを使用
    var previewUrl = photoItem.localUrl || photoItem.thumbnailUrl || (
        photoItem.server && photoItem.secret
        ? 'https://live.staticflickr.com/' + photoItem.server + '/' + photoItem.id + '_' + photoItem.secret + '_t.jpg'
        : ''
    );
    var content = '<p style="font-size:12px; background:darkgray;">' + photoTitle +
        '</p>' + (previewUrl ? '<img src="' + previewUrl + '" style="max-width:100px; max-height:100px;">' : '');

    google.maps.event.addListener(marker, 'mouseover', function() {
        infobox = new ImgBox({
            position: marker.getPosition(),
            height: 100,
            width: 100,
            offsetX: 0,
            offsetY: 0,
            map: map,
            content: content
        });
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
        if (infobox) infobox.setMap(null);
    });

    google.maps.event.addListener(marker, 'click', function() {
        var image = new google.maps.MarkerImage('https://www.google.com/mapfiles/gadget/arrowSmall80.png',
            new google.maps.Size(27, 31),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 31)
        );
        hereLatLng = new google.maps.LatLng(photoItem.latitude, photoItem.longitude);
        markerHere.setMap(null);
        markerHere = new google.maps.Marker({
            position: hereLatLng,
            map: map,
            icon: image
        });
    });

}


// 地図上の任意の座標にcontentを表示する
function ImgBox(opts) {
  	google.maps.OverlayView.call(this);
  	this.latlng_ = opts.position;
  	this.content_ = opts.content;
  	this.map_ = opts.map;
  	this.height_ = opts.height;
  	this.width_ = opts.width;
  	this.size_ = new google.maps.Size(this.height_, this.width_);
  	this.offsetY_ = opts.offsetY;
  	this.offsetX_ = opts.offsetX;
  	this.setMap(this.map_);
}

ImgBox.prototype = new google.maps.OverlayView();

ImgBox.prototype.onRemove = function() {
  	if (this.div_) {
    	this.div_.parentNode.removeChild(this.div_);
    	this.div_ = null;
  	}
};


// Called when the overlay is first added to the map.
ImgBox.prototype.onAdd = function() {
  	// Creates the element if it doesn't exist already.
  	this.createElement();
};

// Redraw based on the current projection and zoom level.
ImgBox.prototype.draw = function() {
  	// Since we use bounds changed listener, projection is sometimes null
  	if (!this.getProjection()) {
    	return;
  	}

  	var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
  	if (!pixPosition) return;

  	// Now position our DIV based on the DIV coordinates of our bounds
  	this.div_.style.width = this.width_ + 'px';
  	this.div_.style.left = pixPosition.x + this.offsetX_ + 'px';
  	this.div_.style.height = this.height_ + 'px';
  	this.div_.style.top = pixPosition.y + this.offsetY_ + 'px';
  	this.div_.style.display = 'block';
  
};

ImgBox.prototype.createElement = function() {

  	var panes = this.getPanes();
  	var div = this.div_;

  	if (!div) {
    	div = this.div_ = document.createElement('div');
    	div.style.border = '0px none';
    	div.style.position = 'absolute';
    	div.style.overflow = 'hidden';
    	var contentDiv = document.createElement('div');
    	if (typeof this.content_ == 'string') {
      		contentDiv.innerHTML = this.content_;
    	} else {
      		contentDiv.appendChild(this.content_);
    	}

    	div.appendChild(contentDiv);
    	div.style.display = 'none';
    	panes.floatPane.appendChild(div);

  	} else if (div.parentNode != panes.floatPane) {
    	// The panes have changed.  Move the div.
    	div.parentNode.removeChild(div);
    	panes.floatPane.appendChild(div);
  	} else {
    	// The panes have not changed, so no need to create or move the div.
  	}

    // Set the overlay's div_ property to this DIV
    this.div_ = div;

};
