
var token_;

var myRet = false;
var photoset_id = [];
var photoset_title = [];
var photoset_primary_id = [];
var photoset_primary_secret = [];
var photoset_primary_server = [];
var photoset_primary_farm = [];
var photoset_description = [];
var photoset_Lat = [];
var photoset_Lng = [];

var family_search = [];

var collection_title = "";

var year = "2011";

var collection_html;

var collections;
var flickrPhotosets = [];

var photoset_primaryUrl = [];


	var folderPathLength = location.href.lastIndexOf("/");
	var folderPath = location.href.substring(0,folderPathLength);
	var url = folderPath + "/mymap.kml";
	var heightPhoto = 500;
	var scrollTopSpeed = 500; // (ms) ページトップに戻るボタンのスピード
	var scrollTopFade = 1000; // (ms) ページトップに戻るボタンのフェード
	var slideshowCloseButtonDuration = 3000; // (ms) スライドショーを閉じるボタンを表示する期間
	var slideCloseButtonDuration = 3000; // (ms) スライドを閉じるボタンを表示する期間
	var animationDuration = 1000; // (ms) アニメーションの遷移時間

window.onload = function(){

	$("#initialize").css({display: "block"}); 
	$("#collections").css({display: "none"});
	$("#photoset").css({display: "none"});

	$("#selectLocalPhotoFolder").on("click", function() {
	
	    $("#localPhotoFolder").val("");
	
	    $("#localPhotoFolder").trigger("click");
	
	});
	
	
	$("#localPhotoFolder").on("change", function(e) {

		$("#initialize").css({display: "none"}); 
		$("#collections").css({display: "block"});

	    var files = Array.from(e.target.files);
	
	    if (!files.length) {
	        return;
	    }

    // .jpg / .jpeg / .txt 以外を削除
    files = files.filter(function(file) {
        return /\.(jpe?g|txt)$/i.test(file.name);
    });

    files.sort(function(a, b) {

        var pathA = a.webkitRelativePath.split("/");
        var pathB = b.webkitRelativePath.split("/");

        // 最初のフォルダ名
        var folderA1 = pathA[1] || "";
        var folderB1 = pathB[1] || "";

        var result = folderB1.localeCompare(folderA1);

        if (result !== 0) {
            return result;
        }

        // 次のフォルダ名
        var folderA2 = pathA[2] || "";
        var folderB2 = pathB[2] || "";

        return folderB2.localeCompare(folderA2);

        if (result !== 0) {
            return result;
        }

        // 3. ファイル名：昇順
        return a.name.localeCompare(b.name);

    });


//console.log(files);
	
collections = [];
$.each(files, function(i, file) {

        // フォルダを含む相対パス
        var path = file.webkitRelativePath;

        // 例：
        // "2011/2011-01-01 東京/DSC_0001.jpg"
        var parts = path.split("/");

        // collection / photoset / photo の3階層でないものは除外
        if (parts.length < 3) {
            return;
        }

        var collectionId = parts[1];
        var photosetId = parts[2];
        var fileName = parts[3];

        // -----------------------------------
        // collectionを探す
        // -----------------------------------

        var collection = collections.find(function(item) {
            return item.id === collectionId;
        });

        // なければ新規作成
        if (!collection) {
            collection = {
                id: collectionId,
                title: collectionId,
                photosets: []
            };

            collections.push(collection);

		}

        // -----------------------------------
        // photosetを探す
        // -----------------------------------

        var photoset = collection.photosets.find(function(item) {
            return item.id === photosetId;
        });

        // なければ新規作成
        if (!photoset) {

            photoset = {
                id: photosetId,
                title: photosetId,
                photos: []
            };

            collection.photosets.push(photoset);
        }


        // -----------------------------------
        // photoを追加
        // -----------------------------------
/*
        photoset.photos.push({

            name: fileName,

            path: path,

            file: file

        });
*/
        photoset.photos.push(file);

    });

console.log(collections);





			getSetInfo(collection_title);
		
	});

	
}

function getSetInfo(collection_title) {
//console.log(collections);
	$("#list").html($('<img>', {
		src: "images/loadingAnimation.gif"
	}));

	photoset_id.length = 0;
	photoset_title.length = 0;
	photoset_primary_id.length = 0;
	photoset_primary_secret.length = 0;
	photoset_primary_server.length = 0;
	photoset_primary_farm.length = 0;
	photoset_description.length = 0;


		collection_html = "";

    	$.each(collections, function(i1,collection){ // 各collectionの情報取得
//console.log(collection);
			var collection_title_tmp = collection.title;
			if ( collection_title == "" ) {
				collection_title = collection_title_tmp;
			}

			var onClick_text = 'getSetInfo(\'' + collection_title_tmp + '\'); return false;';
			collection_html += '<a onClick="' + onClick_text + '">' + collection_title_tmp + '</a>';

			if ( collection_title_tmp == collection_title){

				var collection_id = collection.id;

        		$.each(collection.photosets, function(i2,photoset){ // 各setの情報取得
					var photoset_id_tmp = photoset.id;
					var photoset_title_tmp = photoset.title;

        flickrPhotosets[i2] = new FlickrPhotoset({
            localMode: true,
            localFiles: photoset.photos,
            localTitle: photoset.title,
            localDescription: ""
        });

        flickrPhotosets[i2].getInfo(function() {
//console.log(flickrPhotosets[i2].infoData.photoset);
						photoset_id[i2] = photoset_id_tmp;
						photoset_title[i2] = photoset_title_tmp;
						var photoset_primary_id_tmp = "";
						var photoset_primary_secret_tmp = "";
						photoset_primary_id[i2] = "";
						photoset_primary_secret[i2] = "";
						photoset_primary_server[i2] = "";
						photoset_primary_farm[i2] = "";
//console.log(photoset_primaryUrl);
						photoset_primaryUrl[i2] = "";
						if (flickrPhotosets[i2].infoData.photoset.primaryUrl) {
						photoset_primaryUrl[i2] = flickrPhotosets[i2].infoData.photoset.primaryUrl;
						}
						photoset_description[i2] = flickrPhotosets[i2].infoData.photoset.description._content;

								ShowList();
        });
//console.log(i2, photoset_title[i2],flickrPhotosets[i2].infoData.photoset.description._content);

//console.log(photoset_primaryUrl);
//								ShowList();




				});

			}

		});


		document.getElementById("collection_list").innerHTML = collection_html;


}              


function ShowList() {

	$("#collections").css({display: "block"});
	$("#photoset").css({display: "none"});

	if ( screen.availWidth < 1000 ) {
		target = "_self";
	} else {
		target = "_new";
	}

	var $table = $('<table>').addClass("set_table");

	var td_num = 0;
    for( var i=0; i<photoset_id.length; i++ ) {

		if (!photoset_description[i]) photoset_description[i] = "";
//console.log(i, photoset_title[i],photoset_description[i]);

		if (td_num % 2 == 0 || target == "_self") {
			var $tr = $('<tr>');
		}

			$tr
			.append($('<td>').addClass("td_txt")
				.append($('<a>', {	
					href: "photoset.html?photoset_id=" + photoset_id[i],
					target: target  
					})
					.append( $('<img>', { 
						'src': photoset_primaryUrl[i],
        				width: "100px"
					}))
				.data("flickrPhotoset", flickrPhotosets[i])
				.on("click", function() {
						event.preventDefault();
						var flickrPhotoset = $(this).data("flickrPhotoset");
						showPhotoset( flickrPhotoset );
				}))
				.append($('<p>').addClass("link_set")
					.append($('<a>', {	
						href: "photoset.html?photoset_id=" + photoset_id[i], 
						target: target,
						text: photoset_title[i]
					})
				.data("flickrPhotoset", flickrPhotosets[i])
				.on("click", function() {
						event.preventDefault();
						var flickrPhotoset = $(this).data("flickrPhotoset");
						showPhotoset( flickrPhotoset );
				}))
				)
				.append($('<div class="description">' 
//							+ photoset_description[i].replace(/\n/g,"<br/>") 
							+ photoset_description[i].replace(/\n/g,"") 
						+ '</div>'
				))

				.append($('<div style="clear: both"></div>'
				))


			);

			if (td_num % 2 == 1 || target == "_self") {
				$table.append($tr);
			}

			td_num++;

	}


	if (td_num % 2 == 1 && target == "_new") {
		$table
		.append($tr
			.append($('<td>').addClass("td_txt"))
		);

	}

	$("#list").html($table);

}

function List_search() {

	searchWord = $("#search")[0].value;

	$("#list").html($('<img>', {
		src: "images/loadingAnimation.gif"
	}));

	photoset_id.length = 0;
	var idx = -1;

	$.each(collections, function(i1,collection){ // 各collectionの情報取得

		var collection_title_tmp = collection.title;
		var collection_id = collection.id;
		var collection_set = collection.set;

		$.each(collection.photosets, function(i2,photoset){ // 各setの情報取得

			if (photoset.title.indexOf(searchWord) > -1 || photoset.title.indexOf(searchWord) > -1) {

				var photoset_id_tmp = photoset.id;
				var photoset_title_tmp = photoset.title;

		        flickrPhotoset_tmp = new FlickrPhotoset({
		            localMode: true,
		            localFiles: photoset.photos,
		            localTitle: photoset.title,
		            localDescription: ""
		        });
	
		        flickrPhotoset_tmp.getInfo(function() {
					idx++;
			        flickrPhotosets[idx] = new FlickrPhotoset({
			            localMode: true,
			            localFiles: photoset.photos,
			            localTitle: photoset.title,
			            localDescription: ""
			        });
			        flickrPhotosets[idx].getInfo(function() {
						photoset_id[idx] = photoset_id_tmp;
						photoset_title[idx] = photoset_title_tmp;
						var photoset_primary_id_tmp = "";
						var photoset_primary_secret_tmp = "";
						photoset_primary_id[idx] = "";
						photoset_primary_secret[idx] = "";
						photoset_primary_server[idx] = "";
						photoset_primary_farm[idx] = "";
						photoset_primaryUrl[idx] = "";
						if (flickrPhotoset_tmp.infoData.photoset.primaryUrl) {
							photoset_primaryUrl[idx] = flickrPhotosets[idx].infoData.photoset.primaryUrl;
						}
						photoset_description[idx] = flickrPhotosets[idx].infoData.photoset.description._content;
	
						ShowList();
			        });
		        });

			}

		});

	});

}

function showPhotoset(flickrPhotoset) {

console.log(flickrPhotoset);
	$("#collections").css({display: "none"});
	$("#photos").html("");
	$("#photoset").css({display: "block"});

	$("#back").css({display: "block"}).on("click", function(){
		ShowList();
	});

	$("#slideshow").css({display: "none"}); // 2020-05-01

	var currentScrollTop = 0;
	var slideImage;
	var photoIndex;
	var slideSrc = [];
	var currentSlide = 0;

	// Loading image の表示
    $("#photo-container").prepend("<div id='showImgSequence-loading-image'><img src='http://s10-4bn.sunnyday.jp/_img/img-loading.gif'></div>");
    $("#showImgSequence-loading-image").css({
        position: "fixed",
        bottom: "15px",
        left: "15px",
        opacity: "0.7",
		zIndex: "99"
	});

	//ページトップに戻るボタン等の定義
	$("#btn-top").hide();
	$("#btn-top").click(function() {
		$("html,body").animate({scrollTop: 0}, scrollTopSpeed, 'swing');
	});
	$(window).scroll(function(){
		if ( $(this).scrollTop() > 100) {
			$("#btn-top").fadeIn(scrollTopFade);
		} else {
			$("#btn-top").fadeOut(scrollTopFade);
		}	
	});

        var data = flickrPhotoset.infoData;
        var description = data.photoset.description._content.replace(/\n/g,"<br/>");
        var $id = $("#setInfo").html(
            $('<h1>').html(data.photoset.title._content)
        ).append(
            $('<p>').html(description)
        );


		$("#map-title").html("<p>" + data.photoset.title._content + "</p>");

        // ----------------------------------------------
        // 写真取得
        // ----------------------------------------------

        flickrPhotoset.getPhotos(function() {

//            count++;

            var list =
                flickrPhotoset
                    .photosData
                    .photoset
                    .photo;
//console.log(list);
            $.each(list, function(i, photo) {


                // --------------------------------------
                // 既存プログラムと同じ情報を追加
                // --------------------------------------

				if (!photo.datetaken) { photo.datetaken = photo.folderName.substr(0, 10) }

                // --------------------------------------
                // 現在使っているタイトル処理
                // --------------------------------------

                if (photo.title) {

                    var photo_title = photo.title;


                    if (
                        photo.title.charAt(0) == "1" ||
                        photo.title.charAt(0) == "2"
                    ) {

                        if (
                            photo.title.indexOf(" ") != -1
                        ) {

                            photo_title =
                                photo.title.substr(
                                    photo.title.lastIndexOf(" ") + 1,
                                    photo.title.length
                                );

                        } else {

                            photo_title =
                                photo.title.substr(
                                    15,
                                    photo.title.length
                                );
                        }
                    }


                    flickrPhotoset
                        .photosData
                        .photoset
                        .photo[i]
                        .title = photo_title;
                }

            });
//console.log(flickrPhotoset);

		var list = flickrPhotoset.photosData.photoset.photo;

	    for( var i=0; i<list.length; i++ ) {

	        var photo = list[i];

			if (photo.title)	{
				var photo_title = photo.title;
				if ( photo.title.charAt(0) == "1" || photo.title.charAt(0) == "2" ){
					if ( photo.title.indexOf("]") != -1 ) {
						var photo_title = photo.title.substr(photo.title.indexOf("]")+1,photo.title.length);
					} else {
						var photo_title = photo.title.substr(15,photo.title.length);
					}
				}
				flickrPhotoset.photosData.photoset.photo[i].title = photo_title;

			}

		}

		if ( screen.availWidth < 1500 ) {
			var imgSuffix = "_n";  // 320
		} else {
			var imgSuffix = "";  // 500
		}

		flickrPhotoset.showPhotoList("#photos", { 
			imgSuffix: imgSuffix,
			onClick: function(){
				showSlide();
			}
		});		

		$("#map-to-photo").on( "click", function(){
			showPhoto();
		});



		// 地図を表示

		var list = flickrPhotoset.photosData.photoset.photo;

//		$("#map-container").height($(window).height()); 
//		$("#map-container").width($(window).width());
		$("#map-canvas").css({height: "100%"});
//console.log( $("#map-container").height() );

		$(window).on('resize', function(){
			$("#map-container").height($(window).height()); 
			$("#map-container").width($(window).width());
		});

		var timeTmp=new Date(); 
		var folderPathLength = location.href.lastIndexOf("/");
		var folderPath = location.href.substring(0,folderPathLength);
//		var myURL = folderPath + "/mymap.kml"+"?d="+timeTmp.getMinutes()+timeTmp.getSeconds();
//	    var myURL = "http://s10-4bn.sunnyday.jp/family/kml/" + photoset_id +".kml"+"?d="+timeTmp.getMinutes()+timeTmp.getSeconds();
		var myURL = "";



		flickrPhotoset.showMap("#map-canvas", { 
			customKml: "true" ,
			mapURL: myURL
		});
//  コメントアウトしないと地図の中央が左上に表示されてしまう。ことはなくなった。2018-03-07
		$("#map-container").css({
			display: "none",
			visibility: "hidden"});
 
		$("#photo-to-map").on( "click", function(){
			showMap();
		});


		// スライドをセット
		$("#slide").html("");
		flickrPhotoset.setSlide("#slide");	
// 2020-07-29 追加
		var slideCloseButtonTimer;
		$(window).on("orientationchange", function(){
			clearTimeout(slideCloseButtonTimer);
			$closeButton.css({opacity: 1.0});
			slideCloseButtonTimer = setTimeout( function() {
				$closeButton.animate( {opacity: 0.0}, animationDuration );
				}, slideCloseButtonDuration 
			);
// ここまで
/* 2020-07-29 削除
			var slideWidth = window.innerWidth;
			var slideHeight = window.innerHeight;
			if ( slideWidth < 800 ) {
				if( slideWidth > slideHeight){
//					$closeButton.hide();
					$closeButton.css({opacity: 0.0});
				}else{
//					$closeButton.show();
					$closeButton.css({opacity: 1.0});
				}
			}
*/
		});

		var $closeButton = $("<div>close</div>").css({
			position: "absolute",
			right: "0",
			top: "0",
			color: "white",
			backgroundColor: "grey"
		});
		$closeButton.on( "click", function(){
			// フルスクリーン対応
			if(!navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){ // PCの場合のみ処理
				if (document.webkitCancelFullScreen) {
			    document.webkitCancelFullScreen();
			  } else if (document.mozCancelFullScreen) {
			    document.mozCancelFullScreen();
			  } else {
			    document.exitFullscreen();
			  }
			}
			//                2019-04-24追加, 2019-09-15 修正
			showPhoto(); 
		}).appendTo($("#slide-container"));

		// 2018-03-11 追加
		var $downloadButton = $("<a></a>").attr("id","download").css({
			position: "absolute",
			right: "0",
			bottom: "0",
			color: "white",
			backgroundColor: "grey"
		}).append($("<img src='http://s10-4bn.sunnyday.jp/_icon/download.png' title='ダウンロード' />"));

		$downloadButton.on( "click", function(){ 
			alert("新しく開いたウィンドーの画像を右クリックして保存してください。");  // 2018-09-23
			flickrPhotoset.downloadPhoto( "download", flickrPhotoset.currentSlide); 
		} ).appendTo($("#slide-container"));
		// ここまで


// 2020-05-01 追加
//		var slideCloseButtonTimer;  //2020-07-29
		$("#slide-container").on("mousemove", function(){
			clearTimeout(slideCloseButtonTimer);
			$closeButton.css({opacity: 1.0});
			$downloadButton.css({opacity: 1.0});
			$("#slide-container").css({ cursor: "pointer" });
			slideCloseButtonTimer = setTimeout( function() {
				$closeButton.css({opacity: 1.0}).animate( {opacity: 0.0}, animationDuration );
				$downloadButton.css({opacity: 1.0}).animate( {opacity: 0.0}, animationDuration );
				$("#slide-container").css({ cursor: "none" });
				}, slideCloseButtonDuration 
			);
		});

		// 	スライドショーをセット
		$("#slideshow-button").html("slideshow").on("click", function () {
			showSlideshow();
			// フルスクリーン対応
			if(!navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){ // PCの場合のみ処理
			  var slideShow = document.getElementById("slideshow");
			  if (slideShow.webkitRequestFullScreen) { // Chrome
			    slideShow.webkitRequestFullScreen();
			  } else if (slideShow.mozRequestFullScreen) { // Firefox
			  	slideShow.mozRequestFullScreen();
				} else if (slideShow.msRequestFullscreen) {
					slideShow.msRequestFullscreen(); // IE
				} else if (slideShow.requestFullScreen) { //  HTML5 Fullscreen API仕様
			    slideShow.requestFullScreen();
			  } else {
					alert('ご利用のブラウザはフルスクリーン操作に対応していません');
					return;
			  }
			}
			// 	スライドショーを閉じるボタンの定義
			var $slideshowCloseButton = $("<div>close</div>").css({
				position: "absolute",
				"z-indx": "99",
				right: "0",
				top: "0",
				color: "white",
				backgroundColor: "grey",
				cursor: "pointer" 
			}).appendTo($("#slideshow"));
			var slideshowCloseButtonTimer;
			$("#slideshow").on("mousemove", function(){
				clearTimeout(slideshowCloseButtonTimer);
				$slideshowCloseButton.css({opacity: 1.0});
				$("#slideshow").css({ cursor: "auto" });
				slideshowCloseButtonTimer = setTimeout( function() {
					$slideshowCloseButton.css({opacity: 1.0}).animate( {opacity: 0.0}, animationDuration );
					$("#slideshow").css({ cursor: "none" });
					}, slideshowCloseButtonDuration 
				);
			});
			$slideshowCloseButton.on( "click", function(){ 
				// フルスクリーン対応
				if(!navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){ // PCの場合のみ処理
					if (document.webkitCancelFullScreen) { // Chrome
				    document.webkitCancelFullScreen();
				  } else if (document.mozCancelFullScreen) { // Firefox
				    document.mozCancelFullScreen();
				  } else if (document.msExitFullscreen) { // IE
				    document.msExitFullscreen();
				  } else if (document.exitFullscreen){
				    document.exitFullscreen(); // HTML5 Fullscreen API仕様
				  }
				}
				clearInterval(flickrPhotoset.slideTimer);
				showPhoto(); 
			});
		});
// ここまで
















        });





	var showSlide = function(){
console.log("HERE"); //OK
		// フルスクリーン対応
		if(!navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){ // PCの場合のみ処理
		  var x = document.getElementById("slide-container");
		  if (x.webkitRequestFullScreen) {
		    x.webkitRequestFullScreen();
		  } else if (x.mozRequestFullScreen) {
		  x.mozRequestFullScreen();
		  } else {
		    x.requestFullScreen();
		  }
		}
		//            2019-04-24 追加, 2019-09-12 PCのみ実行に修正
	
		var fadeSpeed = 500;
	
		var slideWidth = window.innerWidth;
	    if ( slideWidth < 800 ) {
	    }
	
		$("#map-container").css({
			display: "none",
			visibility: "hidden"});
		$("#photo-container").css({
			visibility: "hidden"});
		$("#slide-container").css({
			position: "fixed",  // 2019-02-11 added
			display: "block",
			visibility: "visible",
			opacity: 0
		}).animate(
			{opacity:'1'},fadeSpeed
		);
	
	};

	var showPhoto = function(){
	
//		$("html,body").animate({scrollTop: currentScrollTop}, 10, 'linear'); // 2019-02-11 deleted
	
		var fadeSpeed = 500;
	
		$("#dummy").remove();
	
		$("#map-container").css({
			display: "none",
			visibility: "hidden"});
		$("#slide-container").css({
			display: "none",
			visibility: "hidden"});
		$("#slideshow").css({
			display: "none",
			visibility: "hidden"});
		$("#photo-container").css({
			display: "block",
			visibility: "visible",
			opacity: 0
		}).animate(
			{opacity:'1'},fadeSpeed
		);
	
		$(window).trigger('resize');  // 地図をリサイズした時、レイアウトが崩れるのを防ぐために追加した（2017-10-29）
	
	};



	// スライドショーを表示する関数　2020-05-01追加
	var showSlideshow = function(){
console.log("showSlideshow");
		var fadeSpeed = 500;	
		$("#dummy").remove();
		$("#photo-container").css({
			display: "none",
			visibility: "hidden"
		});

		$("#map-container").css({
			display: "none",
			visibility: "hidden"
		});	

		$("#slideshow").css({
			display: "block",
			visibility: "visible",
			opacity: 0
		}).animate(
			{opacity:'1'},fadeSpeed
		);	

		$("#slideshow").html("");
		flickrPhotoset.slideshow("#slideshow", { slidePosition: "full"});
	};

	var showMap = function(){
	
		var fadeSpeed = 500;
	
		$("#dummy").remove();
	
		$("#photo-container").css({
			display: "none",
			visibility: "hidden"
		});
		$("#slide-container").css({
			display: "none",
			visibility: "hidden"});
		$("#map-container").css({
			overflow: "hidden",
			display: "block",
			visibility: "visible",
			opacity: 0
		}).animate(
			{opacity:'1'},fadeSpeed
		);
$("#map-container").show();
console.log($("#map-container").height());
	
		$(window).trigger('resize');  // 写真をリサイズした時、レイアウトが崩れるのを防ぐために追加した（2017-10-29）
	
	};

}




