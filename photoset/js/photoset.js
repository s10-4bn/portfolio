// photosetから写真を削除できるように変更した（2017-10-08）

var token_;

/* Chat GPT が削除
var folderPathLength = location.href.lastIndexOf("/");
var folderPath = location.href.substring(0,folderPathLength);
var url = folderPath + "/mymap.kml";
*/

var data_;
var count = 0;
var countMax = 0;
var batchFlag = false;
var indexLastChecked;
var photo_prev = [];
var photo = [];
var lat_prev = [];
var lon_prev = [];
var my_photoset_title;
var my_photoset_description;

var flickrPhotoset;

var photoset;

window.onresize = function(){
	PhotoEdit (data_);
}

window.onload = function () {
/*
	var params = location.href.split("?")[1];

	if (params) {
	var param = params.split("&");

	for (var i in param) {
		if (param[i].split("=")[0] == "photoset_id") {
			photoset_id = param[i].split("=")[1]
		}
	}
	}
*/



	$("#selectLocalPhotoFolder").on("click", function() {
	
	    $("#localPhotoFolder").val("");
	
	    $("#localPhotoFolder").trigger("click");
	
	});
	
	
	$("#localPhotoFolder").on("change", function(e) {

		$("#initialize").css({display: "none"}); 
//		$("#collections").css({display: "block"});

	    var files = Array.from(e.target.files);
	
	    if (!files.length) {
	        return;
	    }

    // .jpg / .jpeg / .txt 以外を削除
    files = files.filter(function(file) {
        return /\.(jpe?g|txt)$/i.test(file.name);
    });

//console.log(files);

        // フォルダを含む相対パス
		var file = files[0];
        var path = file.webkitRelativePath;
        var parts = path.split("/");
        var photosetId = parts[0];
	
collections = [];
           photoset = {
                id: photosetId,
                title: photosetId,
                photos: []
            };

$.each(files, function(i, file) {

        // -----------------------------------
        // photoを追加
        // -----------------------------------

        photoset.photos.push(file);

    });


//			getSetInfo(collection_title);

	// linkのhtml作成
	link_html = "";	
	link_html += '<div  class="link_ref"><a id="quit" onclick="saveMeta();">保存</a></div>';
	link_html += '<p class="link_ref"><a onclick="Quit();">編集終了</a></p>';

	document.getElementById("link").innerHTML = link_html;
//console.log(photoset);
	EditPhotos();
		
	});









}


function EditPhotos () {

	photo_prev = null;


        flickrPhotoset = new FlickrPhotoset({
            localMode: true,
            localFiles: photoset.photos,
            localTitle: photoset.title,
            localDescription: ""
        });

        flickrPhotoset.getInfo(function() {
			my_photoset_title = flickrPhotoset.infoData.photoset.title._content;
			my_photoset_description = flickrPhotoset.infoData.photoset.description._content;
		
			header_html = "";
			header_html += "<div>";
			header_html += "<h1>" + my_photoset_title + "</h1>";
		
			header_html += "<form class='photo_caption' name='header_form'>";
			header_html += "<textarea name='heder_description' value='' rows=5 cols=80 onkeyup='textarea_resize(this)'>"
						 + flickrPhotoset.infoData.photoset.description._content + "</textarea>";
			header_html += "</form>";
		
			header_html += "</div>";
		
			document.getElementById("header").innerHTML = header_html;
        });

        flickrPhotoset.getPhotos(function(data) {
//console.log(data);
			data_ = data;
			PhotoEdit(data_);
        });









};


function PhotoEdit ( data_ ) {

    photo_prev = data_.photoset.photo;
	photo = data_.photoset.photo;
	photoset_id = data_.photoset.id;
//console.log(data_);

	if ( ! photo_prev ) return;
    if ( ! photo_prev.length ) return;
	for ( var i=0; i<photo_prev.length; i++ ){
		lat_prev[i] = photo_prev[i].latitude;
		lon_prev[i] = photo_prev[i].longitude;
		photo[i].datetaken = photo_prev[i].datetaken;
		photo[i].id = photo_prev[i].id;
		photo[i].server = photo_prev[i].server;
		photo[i].secret = photo_prev[i].secret;
		photo[i].description._content = photo_prev[i].description._content
	}


	var maxLat = -1000;
	var minLat =  1000;
	var maxLng = -1000;
	var minLng =  1000;
    for( var i=0; i<photo.length; i++ ) {
		if ( photo[i].latitude != 0 ) {
			if(photo[i].latitude > maxLat) maxLat = photo[i].latitude;
			if(photo[i].latitude < minLat) minLat = photo[i].latitude;
			if(photo[i].longitude > maxLng) maxLng = photo[i].longitude;
			if(photo[i].longitude < minLng) minLng = photo[i].longitude;
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

	$("#contents").height($(window).height() - $("#header").outerHeight(true)); 
	$(window).on('resize', function(){
		$("#contents").height($(window).height() - $("#header").outerHeight(true)); 
	});

 	col_num = Math.floor($(document).width()/500);
 	if (col_num < 1 ) col_num = 1;

 	var photo_html = '<table id="photo_table" border="0" cellpadding="5">';

 	var td_num = 0;

    for( var i=0; i<photo.length; i++ ) {

   		if (td_num % col_num == 0) {
   			photo_html += '<tr>';
  		}

		photo_html += '<td class="photo">';

		photo_html += "<form name='name_form'>";

		photo_html += '<div class="map_check">';
		photo_html += '<input type="checkbox" size=10 name="check" onclick="clickCheckbox(this);"></div>';


/* Chat GPTが削除
		if ( photo[i].latitude != 0 ) {
			photo_html +='<a name="name_map" href="map2.html?ll=' + photo[i].latitude + ',' + photo[i].longitude + '&index=' + i +
			             '&photoset_id=' + photoset_id + '&batch=false' +
			             '&top=none&TB_iframe=true&width=800&height=620" class="thickbox" title="Google Map">map</a>';
		} else {
			photo_html +='<a name="name_map" style="color:gray;" href="map2.html?ll=' + photo[i].latitude + ',' + photo[i].longitude + '&index=' + i +
			             '&photoset_id=' + photoset_id + '&batch=false' +
			             '&top=none&TB_iframe=true&width=800&height=620" class="thickbox" title="Google Map">map</a>';
		}
*/


// Chat GPT が挿入（ここから）
        var mapLinkColor = (photo[i].latitude == 0) ? "color:gray;" : "";
        photo_html += '<a name="name_map" href="#" style="' + mapLinkColor +
                      '" onclick="openMapModal(' + i + ', false); return false;" title="Google Map"  class="thickbox">map</a>';
// Chat GPT が挿入（ここまで） 


		photo_html += "<div class='photo_date'>"+photo[i].datetaken.substr(0,10).replace(/:/g, '-') +"</div>";

		photo_html += "<p class='image'>";
		photo_html += "<a href='https://www.flickr.com/photos/"+data_.photoset.owner+"/"+photo[i].id+"/in/set-"+photoset_id+"' target='_blank' >";
//		photo_html += "<img class='photo_image' src ='https://live.staticflickr.com/"+photo[i].server+"/"+photo[i].id+"_"+photo[i].secret+".jpg'>";
		photo_html += "<img class='photo_image' src =" + photo[i].localUrl + ">";
		photo_html +="</a>";
		photo_html += "</p>";

//		photo_html += "<form class='photo_caption' name='name_form'>";
		photo_html += "<input type='text' name='name_title' value='' size=50 style='font-weight: bold;' ><br/>";
		photo_html += "<textarea name='name_description' value='' rows=3 cols=50 onkeyup='textarea_resize(this)'></textarea>";
		photo_html += "</form>";

		photo_html += "<br/>";
		photo_html += "</td>";

   		if (td_num % col_num == col_num-1) {
    		photo_html += '</tr>';
   		}
 
   		td_num++;
		
    }


	photo_html += "<p style='clear: left;'></p>";
	document.getElementById("contents").innerHTML = photo_html;


	var document_height = $(document).height();
	var header_height = $(header).height();
	document.getElementById("contents").style.height = (document_height - header_height) + "px";


	if ( photo.length == 1 ){
			document.name_form.name_title.value = photo[0].title;
//			document.name_form.name_description.value = photo[0].description._content.split("[CR]").join("\n");
			document.name_form.name_description.value = photo[0].description._content;
	}else{
   		for( var i=0; i<photo.length; i++ ) {	
			document.name_form[i].name_title.value = photo[i].title;
//			document.name_form[i].name_description.value = photo[i].description._content.split("[CR]").join("\n");
			document.name_form[i].name_description.value = photo[i].description._content;
		}
	}



// Buttons作成
	html = "";	
	html += '<div  class="buttons"><a onclick="allSelect();">全て選択</a><a>&nbsp;</a><a onclick="allUnSelect();">選択解除</a></div>';
	html += '<div  class="buttons"><a onclick="batchTitle();">一括タイトル入力</a><a>&nbsp;</a><a onclick="deletePrefix();">一括プレフィクス削除</a></div>';

/* Chat GPT が削除
	html +='<div><a class="thickbox" href="map2.php?ll=0,0&index=0' + '&batch=true' +
*/			             '&photoset_id=' + photoset_id + '&top=none&TB_iframe=true&width=800&height=620" title="Google Map">一括map入力</a></div>';
// Chat GPT が 挿入（ここから）
    html += '<div><a href="#" onclick="openMapModal(null, true); return false;" title="Google Map" class="thickbox">一括map入力</a></div>';
// Chat GPT が 挿入（ここまで）

	html += '<div  class="buttons"><a onclick="removePhoto();">削除</a></div>';

	document.getElementById("buttons").innerHTML = html;

//  Chat GPT が削除
//	tb_init('a.thickbox, area.thickbox, input.thickbox');
	// 地図はiframeを使わず、index.html内のモーダルで表示します。


}

// ------------------------------------------------------------
// ローカルファイルへメタデータを保存
// ------------------------------------------------------------
async function saveMeta() {

    if (!window.showDirectoryPicker) {
        alert("このブラウザではフォルダへの書き込みに対応していません。Chromeで http://localhost または https:// から開いてください。");
        return;
    }

    if (!photo || !photo.length) {
        alert("保存する写真がありません。");
        return;
    }

    var photoChanges = [];
    var descriptionChanged =
        my_photoset_description !== document.header_form.heder_description.value;

    // 画面の入力値と、読み込み時の値を比較
    for (var i = 0; i < photo.length; i++) {
        var form = (photo.length === 1)
            ? document.name_form
            : document.name_form[i];

        var title = form.name_title.value;
        var description = form.name_description.value;
        var latitude = Number(photo[i].latitude);
        var longitude = Number(photo[i].longitude);

        if (!Number.isFinite(latitude)) latitude = 0;
        if (!Number.isFinite(longitude)) longitude = 0;

        var titleChanged = photo[i].title !== title;
        var descriptionChanged = photo[i].description._content !== description;
        var latitudeChanged = latitude !== Number(lat_prev[i]);
        var longitudeChanged = longitude !== Number(lon_prev[i]);

        if (titleChanged || descriptionChanged || latitudeChanged || longitudeChanged) {
            photoChanges.push({
                index: i,
                title: title,
                description: description,
                latitude: latitude,
                longitude: longitude
            });
        }
    }

    if (!descriptionChanged && photoChanges.length === 0) {
        alert("変更されていません。");
        return;
    }

    // 保存先として、最初に写真を読み込んだフォルダそのものを選択
    var directoryHandle;
    try {
        directoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    } catch (e) {
        if (e && e.name === "AbortError") return;
        alert("保存先フォルダを開けませんでした。\n" + (e.message || e));
        return;
    }

    if (photoset && photoset.id && directoryHandle.name !== photoset.id) {
        var ok = confirm(
            "選択したフォルダ名は「" + directoryHandle.name + "」です。\n" +
            "写真を読み込んだフォルダ「" + photoset.id + "」とは異なります。\n\n" +
            "このフォルダに保存してよろしいですか？"
        );
        if (!ok) return;
    }

    document.body.style.cursor = "wait";

    try {
        var savedPhotoCount = 0;

        // 写真ファイルのEXIFを書き換える
        for (var j = 0; j < photoChanges.length; j++) {
            var change = photoChanges[j];
            var photoItem = photo[change.index];
            var relativePath = getLocalRelativePath(photoItem);
            var fileHandle = await getFileHandleByPath(directoryHandle, relativePath);
            var currentFile = await fileHandle.getFile();
            var updatedBlob = await createJpegWithMetadata(
                currentFile,
                change.title,
                change.description,
                change.latitude,
                change.longitude
            );

            var writable = await fileHandle.createWritable();
            await writable.write(updatedBlob);
            await writable.close();

            // 次回保存時に古いFileオブジェクトを使わないよう更新
            photoItem.localFile = await fileHandle.getFile();
            photoItem.title = change.title;
            photoItem.description._content = change.description;
            photoItem.latitude = change.latitude;
            photoItem.longitude = change.longitude;
            lat_prev[change.index] = change.latitude;
            lon_prev[change.index] = change.longitude;
            savedPhotoCount++;
        }

        // Photosetの説明を info.txt に保存（UTF-8）
        if (descriptionChanged) {
            var infoFile = (photoset.photos || []).find(function(file) {
                return file.name.toLowerCase() === "info.txt";
            });
            var infoPath = infoFile ? getLocalRelativePath(infoFile) : "info.txt";
            var infoHandle;
            if (infoFile) {
                infoHandle = await getFileHandleByPath(directoryHandle, infoPath);
            } else {
                infoHandle = await directoryHandle.getFileHandle("info.txt", { create: true });
            }
            var infoWritable = await infoHandle.createWritable();
            await infoWritable.write(new Blob(
                [document.header_form.heder_description.value],
                { type: "text/plain;charset=utf-8" }
            ));
            await infoWritable.close();
            my_photoset_description = document.header_form.heder_description.value;
        }

        alert(
            "保存しました。\n" +
            "画像ファイル：" + savedPhotoCount + "枚\n" +
            "info.txt：" + (descriptionChanged ? "保存" : "変更なし")
        );

    } catch (e) {
        console.error("ローカル保存エラー:", e);
        alert("保存中にエラーが発生しました。\n" + (e.message || e) +
              "\n\n保存済みのファイルがある場合は、そのファイルは更新されています。");
    } finally {
        document.body.style.cursor = "auto";
    }
}

// File.webkitRelativePath から、選択した写真フォルダ内の相対パスを取得
function getLocalRelativePath(fileOrPhoto) {
    if (!fileOrPhoto) throw new Error("元画像ファイルが見つかりません。");
    if (fileOrPhoto.localRelativePath) return fileOrPhoto.localRelativePath;

    var file = fileOrPhoto.localFile || fileOrPhoto;
    var relativePath = file.webkitRelativePath || file.name;
    var parts = relativePath.split("/").filter(Boolean);

    // webkitdirectory で選択したフォルダ名を取り除く
    if (parts.length > 1 && photoset && parts[0] === photoset.id) {
        parts.shift();
    }

    return parts.join("/");
}

// 相対パスをたどって FileSystemFileHandle を取得
async function getFileHandleByPath(directoryHandle, relativePath) {
    var parts = relativePath.split("/").filter(Boolean);
    if (!parts.length) throw new Error("画像ファイルの相対パスが空です。");

    var currentDirectory = directoryHandle;
    for (var i = 0; i < parts.length - 1; i++) {
        currentDirectory = await currentDirectory.getDirectoryHandle(parts[i]);
    }
    return await currentDirectory.getFileHandle(parts[parts.length - 1]);
}

// 文字列を Windows XPTitle / XPComment 用 UTF-16LE バイト配列に変換
function encodeXPText(value) {
    var text = String(value == null ? "" : value);
    var bytes = [];
    for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i);
        bytes.push(code & 0xff, (code >> 8) & 0xff);
    }
    bytes.push(0, 0); // NULL terminator
    return bytes;
}

function decimalToDMS(value) {
    var absolute = Math.abs(value);
    var degrees = Math.floor(absolute);
    var minutesFloat = (absolute - degrees) * 60;
    var minutes = Math.floor(minutesFloat);
    var seconds = (minutesFloat - minutes) * 60;
    var denominator = 1000000;
    return [
        [degrees, 1],
        [minutes, 1],
        [Math.round(seconds * denominator), denominator]
    ];
}

// JPEGの画像データを再圧縮せず、EXIFだけを書き換える
async function createJpegWithMetadata(file, title, description, latitude, longitude) {
    if (!window.piexif) {
        throw new Error("EXIF書き込みライブラリ piexifjs が読み込まれていません。");
    }

    var bytes = new Uint8Array(await file.arrayBuffer());
    var binary = "";
    var chunkSize = 0x8000;
    for (var offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(offset, offset + chunkSize));
    }

    var exif = piexif.load(binary);
    exif["0th"] = exif["0th"] || {};
    exif["Exif"] = exif["Exif"] || {};
    exif["GPS"] = exif["GPS"] || {};

    // タイトル・説明（日本語対応のUTF-16LE）
    var xpTitleTag = piexif.ImageIFD.XPTitle || 0x9c9b;
    var xpCommentTag = piexif.ImageIFD.XPComment || 0x9c9c;
    exif["0th"][xpTitleTag] = encodeXPText(title);
    exif["0th"][xpCommentTag] = encodeXPText(description);

    // GPS座標
    if (Number.isFinite(latitude) && Number.isFinite(longitude) &&
        Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 &&
        (latitude !== 0 || longitude !== 0)) {

        exif["GPS"][piexif.GPSIFD.GPSVersionID] = [2, 3, 0, 0];
        exif["GPS"][piexif.GPSIFD.GPSLatitudeRef] = latitude < 0 ? "S" : "N";
        exif["GPS"][piexif.GPSIFD.GPSLatitude] = decimalToDMS(latitude);
        exif["GPS"][piexif.GPSIFD.GPSLongitudeRef] = longitude < 0 ? "W" : "E";
        exif["GPS"][piexif.GPSIFD.GPSLongitude] = decimalToDMS(longitude);
    } else {
        delete exif["GPS"][piexif.GPSIFD.GPSLatitudeRef];
        delete exif["GPS"][piexif.GPSIFD.GPSLatitude];
        delete exif["GPS"][piexif.GPSIFD.GPSLongitudeRef];
        delete exif["GPS"][piexif.GPSIFD.GPSLongitude];
    }

    var exifBytes = piexif.dump(exif);
    var updatedBinary = piexif.insert(exifBytes, binary);
    var output = new Uint8Array(updatedBinary.length);
    for (var k = 0; k < updatedBinary.length; k++) {
        output[k] = updatedBinary.charCodeAt(k) & 0xff;
    }
    return new Blob([output], { type: "image/jpeg" });
}



function photos_set_LatLng ( param ) {

// Photoにlatitude,longitudeを書く

	// リクエスト
	var accessor = {
    	consumerSecret: consumerSecret, 
      	tokenSecret: oauth_token_secret
    };
    var message = {
    	method: "GET", 
      	action: "https://www.flickr.com/services/rest", 
      	parameters: { 
        	oauth_signature_method: "HMAC-SHA1", 
        	oauth_consumer_key: consumerKey,
			oauth_token: oauth_token,
			photo_id: param.photo_id,
			format: "json",
			jsoncallback: "jsonMeta3",
			lat: param.latitude,
			lon: param.longitude,
			method: "flickr.photos.geo.setLocation"
      	}
    };
//    agent.postRest(message, accessor);

	OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var target = OAuth.addToURL(message.action, message.parameters);
    var options = {
      type: message.method,
//	  dataType: "script",
      url: target,
      success: function(data, dataType) { jsonMeta3(data); },
	  error: function(XMLHttpRequest, textStatus, errorThrown){alert("!!"+errorThrown);}    };

//	$.support.cors = true;
//	$.ajax(options);

    var script  = document.createElement( 'script' );
    script.type = 'text/javascript';
    script.src  = target;
    document.body.appendChild( script );
}


function jsonMeta3 ( data ){

//alert('stat= ' + data.stat);
//alert('code= ' + data.code);
//alert('message= ' + data.message);

	count++;
	if ( count >= countMax ){
		document.body.style.cursor = 'auto';
		document.body.disabled = false;
		alert('保存しました。(' + countMax + '件)');
		$('#TB_overlay').trigger("unload").unbind().remove();
	}

}

function removePhoto_ ( param ) {

// Photoをphotosetから削除する。

	// リクエスト
	var accessor = {
    	consumerSecret: consumerSecret, 
      	tokenSecret: oauth_token_secret
    };
    var message = {
    	method: "GET", 
      	action: "https://www.flickr.com/services/rest", 
      	parameters: { 
        	oauth_signature_method: "HMAC-SHA1", 
        	oauth_consumer_key: consumerKey,
			oauth_token: oauth_token,
			photo_id: param.photo_id,
			photoset_id: photoset_id,
			format: "json",
			jsoncallback: "jsonMeta4",
			method: "flickr.photosets.removePhoto"
      	}
    };
//    agent.postRest(message, accessor);

	OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var target = OAuth.addToURL(message.action, message.parameters);
    var options = {
      type: message.method,
//	  dataType: "script",
      url: target,
      success: function(data, dataType) { jsonMeta3(data); },
	  error: function(XMLHttpRequest, textStatus, errorThrown){alert("!!"+errorThrown);}    };

//	$.support.cors = true;
//	$.ajax(options);

    var script  = document.createElement( 'script' );
    script.type = 'text/javascript';
    script.src  = target;
    document.body.appendChild( script );

}


function jsonMeta4 ( data ){

//alert('stat= ' + data.stat);
//alert('code= ' + data.code);
//alert('message= ' + data.message);

	count++;
	if ( count >= countMax ){
		document.body.style.cursor = 'auto';
		document.body.disabled = false;
		alert('保存しました。(' + countMax + '件)');
		$('#TB_overlay').trigger("unload").unbind().remove();
	}

}

function photos_set_Meta ( param ) {

// Photoにtitle,descriptionを書く

	// リクエスト
	var accessor = {
    	consumerSecret: consumerSecret, 
      	tokenSecret: oauth_token_secret
    };
    var message = {
    	method: "GET", 
      	action: "https://www.flickr.com/services/rest", 
      	parameters: { 
        	oauth_signature_method: "HMAC-SHA1", 
        	oauth_consumer_key: consumerKey,
			oauth_token: oauth_token,
			photo_id: param.photo_id,
			format: "json",
			jsoncallback: "jsonMeta",
			description: param.photo_description,
			secret: param.photo_secret,
			title: param.photo_title,
			method: "flickr.photos.setMeta"
      	}
    };
//    agent.postRest(message, accessor);

	OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var target = OAuth.addToURL(message.action, message.parameters);

    var options = {
      type: message.method,
//	  dataType: "script",
      url: target,
      success: function(data, dataType) { jsonMeta(data); },
	  error: function(XMLHttpRequest, textStatus, errorThrown){alert("!!"+errorThrown);}    };

//	$.support.cors = true;
//	$.ajax(options);

    var script  = document.createElement( 'script' );
    script.type = 'text/javascript';
    script.src  = target;
    document.body.appendChild( script );

}

function jsonMeta ( data ){
//alert(data);
//alert('stat= ' + data.stat);
//alert('code= ' + data.code);
//alert('message= ' + data.message);

	count++;
	if ( count >= countMax ){
		document.body.style.cursor = 'auto';
		document.body.disabled = false;
		alert('保存しました。(' + countMax + '件)');
		$('#TB_overlay').trigger("unload").unbind().remove();
	}

}

function textarea_resize(Tarea){ 
    var areaH = Tarea.style.height;
    if(Tarea.value == ""){areaH=26+"px";}
    areaH = parseInt(areaH) - 30;
    if(areaH < 30){areaH = 30}
 	Tarea.style.height = areaH + "px";
	Tarea.style.height = (parseInt(Tarea.scrollHeight)) + "px";
}

function photoset_edit_Meta ( param ) {

// Photosetにdescriptionを書く

	// リクエスト
	var accessor = {
    	consumerSecret: consumerSecret, 
      	tokenSecret: oauth_token_secret
    };

    var message = {
    	method: "GET",  // ###### なぜかPOSTではNG #######
      	action: "https://api.flickr.com/services/rest", 
      	parameters: { 
        	oauth_signature_method: "HMAC-SHA1", 
        	oauth_consumer_key: consumerKey,
			oauth_token: oauth_token,
			photoset_id: param.photoset_id,
			format: "json",
			jsoncallback: "jsonMeta",
			description: param.photoset_description,
			title: param.photoset_title,
			method: "flickr.photosets.editMeta"
      	}
    };
//    agent.postRest(message, accessor);

	OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var target = OAuth.addToURL(message.action, message.parameters);
    var options = {
      type: message.method,
//	  dataType: "script",
      url: target,
      success: function(data, dataType) { jsonMeta(data); },
	  error: function(XMLHttpRequest, textStatus, errorThrown){alert("!!"+errorThrown);}    
	};

//	$.support.cors = true;
//	$.ajax(options);

    var script  = document.createElement( 'script' );
    script.type = 'text/javascript';
    script.src  = target;
    document.body.appendChild( script );
}


function jsonMeta2 ( data ){

//alert('stat= ' + data.stat);
//alert('code= ' + data.code);
//alert('message= ' + data.message);

	count++;
	if ( count >= countMax ){
		document.body.style.cursor = 'auto';
		document.body.disabled = false;
		alert('保存しました。(' + countMax + '件)');
		$('#TB_overlay').trigger("unload").unbind().remove();
	}

}

function setLatLng (index,LatLng){
	var elements = document.getElementsByName("name_map");
	if ( batchFlag == true ){	
			for( var i=0; i<photo_prev.length; i++ ) {
				if ( document.name_form[i].check.checked == true ){
					photo[Number(i)].latitude = LatLng.lat();
					photo[Number(i)].longitude = LatLng.lng();
					elements[i].style.color = "red";
				}
				document.name_form[i].check.checked = false;
			}
	}else{
		photo[Number(index)].latitude = LatLng.lat();
		photo[Number(index)].longitude = LatLng.lng();
		elements[Number(index)].style.color = "red";
	}

// Chat GPT が削除
//	tb_remove();

// Chat GPT が追加
	closeMapModal();

}

function Quit(){

	var countFlag = 0;

// Counter をセット

// Photsetのdescriptionが変わっているか判定
	if ( my_photoset_description != document.header_form.heder_description.value ){
		countFlag++;
	}

// Photoのtitleかdescriptionが変わっているか判定
	for( var i=0; i<photo_prev.length; i++ ) {
		if ( photo_prev[i].title != document.name_form[i].name_title.value || photo_prev[i].description._content != document.name_form[i].name_description.value ){
			countFlag++;
		}
	}

// Photoのlatitudeかlongitudeが変わっているか判定
	for( var i=0; i<photo_prev.length; i++ ) {
		if ( photo[i].latitude != lat_prev[i] || photo[i].longitude != lon_prev[i] ){
			countFlag++;
		}
	}

// Photoが削除されているか判定
// 削除されているか判定
	$(".photo").each(function(index,element) {
		if ( $(this).hasClass("photo_removed") ) {
			countFlag++;
		}
	});

	if ( countFlag > 0 ){
		var flag = confirm("保存していませんが、よろしいですか？")
		if ( flag == false ){ return; }
	}

	window.open("photoset.php?photoset_id=" + photoset_id, "_self");

}

function allSelect(){
	for ( var i=0; i<document.name_form.length; i++ ){
		document.name_form[i].check.checked = true;
	}
}

function allUnSelect(){
	for ( var i=0; i<document.name_form.length; i++ ){
		document.name_form[i].check.checked = false;
	}
	indexLastChecked = undefined;
}

function batchTitle(){

	for ( var i=0; i<document.name_form.length; i++ ){
		if ( document.name_form[i].check.checked == true ){
			batchFlag = true;
		}
	}

	if ( batchFlag == true ){
	var title = prompt("タイトルを入力してください");

	for ( var i=0; i<document.name_form.length; i++ ){
		if ( document.name_form[i].check.checked == true ){
			document.name_form[i].name_title.value = title;
		}
		document.name_form[i].check.checked = false;
	}
	batchFlag = false;
	}

}

function deletePrefix(){

	for ( var i=0; i<document.name_form.length; i++ ){
		if ( document.name_form[i].check.checked == true ){
			if ( document.name_form[i].name_title.value.charAt(0) == "1" 
			  || document.name_form[i].name_title.value.charAt(0) == "2" ){
				if ( document.name_form[i].name_title.value.indexOf("]") != -1 ) {
					document.name_form[i].name_title.value 
					= document.name_form[i].name_title.value.substr(document.name_form[i].name_title.value.indexOf("]")+1,document.name_form[i].name_title.value.length);
	
				} else {
					document.name_form[i].name_title.value 
					= document.name_form[i].name_title.value.substr(16,document.name_form[i].name_title.value.length);
				}
			}
		}
	}

}

function removePhoto(){

	var counter = 0;
	for ( var i=0; i<document.name_form.length; i++ ){
		if ( document.name_form[i].check.checked == true ){
			counter++;
		}
	}

//	var response = confirm( counter + "枚の写真がこのPhotosetから削除されます" );

//	if (response) {
		$(".photo").each(function(index,element) {
			if ( document.name_form[index].check.checked == true ){
				$(this).css({display: "none"}).addClass("photo_removed");
			}			
		});
//	}

}

function tbRemove (){

	alert("写真が選択されていません");
	tb_remove();

}

function clickCheckbox(obj){
//	alert(indexLastChecked);
	
	if ( obj.checked != true ){ return; }
//alert('OK');

	for ( var i=0; i<document.name_form.length; i++ ){

		if ( obj == document.name_form[i].check ){
			if ( event.shiftKey == true ){
				if ( indexLastChecked < i ){
					for ( var j=indexLastChecked+1; j<i; j++){
						document.name_form[j].check.checked = true;
					}
				}else{
					for ( var j=i+1; j<indexLastChecked; j++){
						document.name_form[j].check.checked = true;
					}
				}
			}
			indexLastChecked = Number(i);
			break;
		}
	}

}

// Chat GPT が作成
// 地図モーダルを表示（map2.html / iframe は使用しない）
function openMapModal(photoIndex, isBatch) {

    closeMapModal();

    var overlay = document.createElement("div");
    overlay.id = "mapModalOverlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9998;";
    overlay.onclick = closeMapModal;

    var modal = document.createElement("div");
    modal.id = "mapModalWindow";
    modal.style.cssText = "position:fixed;left:5%;top:5%;width:90%;height:90%;background:#fff;z-index:9999;display:flex;flex-direction:column;border-radius:5px;overflow:hidden;";
    modal.onclick = function(e) { e.stopPropagation(); };

    var bar = document.createElement("div");
    bar.style.cssText = "height:42px;min-height:42px;display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:0 12px;background:#f2f2f2;";
    bar.innerHTML = '<button type="button" onclick="setLatLng(mapIndexForModal, hereLatLng)">決定</button>' +
                    '<button type="button" onclick="closeMapModal()">閉じる</button>';

    var canvas = document.createElement("div");
    canvas.id = "map_canvas";
    canvas.style.cssText = "width:100%;height:calc(100% - 42px);flex:1;";

    var tmp = document.createElement("div");
    tmp.id = "tmp";
    tmp.style.display = "none";

    modal.appendChild(bar);
    modal.appendChild(canvas);
    modal.appendChild(tmp);
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    window.mapIndexForModal = photoIndex;
    window.batchFlag = !!isBatch;

    google.maps.event.trigger(window, "resize");

    var ok = initMap2({ index: photoIndex, batch: !!isBatch, photosetId: photoset_id });
    if (!ok) closeMapModal();
}

function closeMapModal() {
    var modal = document.getElementById("mapModalWindow");
    var overlay = document.getElementById("mapModalOverlay");
    if (window.map) {
        window.map = null;
    }
    if (modal) modal.remove();
    if (overlay) overlay.remove();
    window.batchFlag = false;

}
