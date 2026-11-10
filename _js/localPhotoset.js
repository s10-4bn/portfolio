var FlickrPhotoset = function () { 
/*　変更履歴
ver.2.1 slideshowを追加。originalsecret対応可能にした。
ver 2.2 表示するスライドの数を制限できるようにした（slideNumber）
ver 2.3 kml表示に対応、マーカーに任意のアイコンを指定できるように変更。
ver.2.4 カスタムkml表示に対応。ローカルファイルは使えない。中心指定を可能にした。（2017-02-18）
ver.2.5 overlayHtml の offsetを変更した。(2017-08-26)
ver.2.6 .list .photosId .photos_ownwer を廃止した（2017-09-16）
2018-01-20: showPhotoList(), setSlide(), showSlide() を追加した。
2018-01-22: gestureHandling: "greedy" をデフォルトにした。
2018-01-28: FlickrAPIの継承をやめた。
2018-02-04: setSlide()で、アニメーション中の操作を中止した。
2018-02-04: iPhoneのランドスケープで見たときにスライドが上下に動くのを直した。
　liの高さがimgよりも高くなってしまうことが原因のようであった。
　img の displayをblockにして対策した。
2018-02-17: locationデータがない時にフリーズするのを修正した。
2018-03-11: downloadPhotoを追加した。
2018-03-31: ストリートビュー対応にした。写真のポップアップにcloseボタンをつけた。
2018-08-17: modalMapで座標を表示するようにした。
2018-09-23: Google Chrome ver60からa要素のdownload属性が同一オリジンポリシーに厳密になったため、
　オリジナル画像が別のウィンドーで開くように変更した。
2018-12-02: modalMapの不具合をなくした。
2018-12-23: fitBoundsがうまく効かないのでコメントアウトした。
2019-04-09: showPhotoListを修正。横長の写真を大きく表示するように修正した。ただし、imgSuffix="","_n"のみに対応
2019-04-09: showPhotoListを修正。mapのスタイルをCSSで定義できるように変更した。
2019-04-18: http://static.flickr.com/ → https://live.staticflickr.com/ に変更等
2019-05-04: modalMapでkmlを表示するようにした。
2019-09-15: デフォルトのピンチズームに対応するようにした。画像はオリジナルを読み込むようにした。
2019-09-20: iPhoneでのmodalの写真の大きさを適切になるように修正した。
2020-04-21: showSlide()で、IE11の不具合を修正した（2018-02-04のiPhone対応だとIE11で不具合が発生していた）
2020-04-29: setSlide()を変更
2021-11-07: showPhotoListで画像の縮小率を指定できるようにした（imgRatio）
*/

	this.init.apply(this, arguments); 
}
//FlickrPhotoset.prototype = Object.create(FlickrAPI.prototype);
//FlickrPhotoset.prototype.constructor = FlickrPhotoset;

$.extend(FlickrPhotoset.prototype, {

	init: function (prms) {
		$.extend( true, this, prms ); 
	},

	rest: function( opts, fnc ) {
	
		var mandatories = {
			api_key: this.api_key,
			format: 'json',
			nojsoncallback: '1'
		}
		$.extend( opts, mandatories );
	
	    // APIリクエストURLの生成
	    var url = 'https://www.flickr.com/services/rest/?' + o2s(opts);
		$.getJSON(url, fnc);

	},

	restAuth: function( my_secret, opts, fnc ) { 

		var mandatories = {
			api_key: this.api_key,
			auth_token: this.token,
			format: 'json',
			nojsoncallback: '1'
		}
		$.extend( opts, mandatories );
	
	    var l = [];
	    for( var key in opts ) {
	        var k = key;
	        	var v = opts[key];
	        l[l.length] = k+v;
	    }
		l.sort();
	    var b = l.join( '' );
		var api_sig_ = hex_md5( my_secret + b );
		opts.api_sig = api_sig_;

	    // APIリクエストURLの生成
	    var url = 'https://www.flickr.com/services/rest/?' + o2s(opts);
		$.getJSON(url, fnc);

	},

	restOauth: function( opts, fnc) {

		var mandatories = {
	        oauth_signature_method: "HMAC-SHA1", 
	        oauth_consumer_key: this.consumerKey,
			oauth_token: this.oauth_token,
			format: "json",
			nojsoncallback: "1",
		}
		$.extend( opts, mandatories );
	    var message = {
	      method: "GET",   // POSTではIEで動作しない。
	      action: "https://www.flickr.com/services/rest", 
	      parameters: opts
	    };
	    var accessor = {
	      consumerSecret: this.consumerSecret, 
	      tokenSecret: this.oauth_token_secret
	    };
	    OAuth.setTimestampAndNonce(message);
	    OAuth.SignatureMethod.sign(message, accessor);
	    var target = OAuth.addToURL(message.action, message.parameters);
	//	$.support.cors = true;
		$.getJSON(target, fnc);

	},

	getInfo: function ( func ) { // Header

    // =========================================
    // ローカルモード
    // =========================================
    if (this.localMode) {


        this.getLocalInfo(func);
        return;
/*
        var self = this;

        self.infoData = {
            photoset: {
				id:: self.localTitle || "",
                title: {
                    _content: self.localTitle || ""
                },
                description: {
                    _content: self.localDescription || ""
                }
            }
        };
// console.log(self.localDescription); // NG
// console.log(self.infoData.photoset.description._content); // NG
        func(self.infoData);
        return;
*/
    }


    // =========================================
    // Flickrモード
    // =========================================

		var self = this;

	    var flickrPrms = { 
			method: 'flickr.photosets.getInfo',
			photoset_id: this.photoset_id,
	    };
		if ( this.token ) {
			this.restAuth( this.secret, flickrPrms, function(data) {
				if(data.message) console.log(data.message);
				self.infoData = data;
				func();
			}); 
		} else if ( this.oauth_token ){
			this.restOauth( flickrPrms, function(data) {
				if(data.message) console.log(data.message);
				self.infoData = data;
				func();
			}); 
		} else {
			this.rest( flickrPrms, function(data) {
				if(data.message) console.log(data.message);
				self.infoData = data;
				func();
			});
		}
	},

getLocalInfo: async function (func) {

    var self = this;

    // -----------------------------------------
    // JPGファイルを取得
    // -----------------------------------------

    var files = this.localFiles || [];


    // -----------------------------
    // info.txt を探す
    // -----------------------------
    var infoFile = files.find(function(file) {
        return file.name.toLowerCase() === "info.txt";
    });

    var description = "";
//console.log(files);
    if (infoFile) {
        try {
            description = await infoFile.text();
        } catch (e) {
            console.error("info.txt の読み込みに失敗:", e);
        }
    }


    // -----------------------------
    // ファイル名に "!" を含む画像を探す
    // -----------------------------

    var primaryFile = files.find(function(file) {

        return (
            file.name.indexOf("!") !== -1 &&
            /\.(jpe?g)$/i.test(file.name)
        );

    });

	if (!primaryFile) {

    	primaryFile = files.find(function(file) {
	
        return /\.(jpe?g)$/i.test(file.name);

    });

}

//});

    // -----------------------------
    // 代表画像のURLを作る
    // -----------------------------
    var primaryUrl = "";

    if (primaryFile) {
        primaryUrl = URL.createObjectURL(primaryFile);
    }

    // -----------------------------------------
    // Flickrと同じ構造にする
    // -----------------------------------------

    self.infoData = {

        photoset: {
            title: { _content: self.localTitle || "" },
            description: { _content: description },
        	primaryFile: primaryFile, 
			primaryUrl: primaryUrl,
        }
    };
// console.log(self.infoData.photoset.title); 
	func();


/*
    return {
        description: description,
        primaryFile: primaryFile,
        primaryUrl: primaryUrl
    };
*/

},


	showInfo: function ( id, opts ) {

		var defaults = {
			titleCSS: {
			   	margin: '0px', padding: '5px',
				font: 'bold 32px arial,sans-serif', color: 'black',
			   	textAlign: 'left'
			},
			captionCSS: {
			   	margin: '0px', padding: '10px', 
				font: '14px arial,sans-serif', color: 'black',
			   	textAlign: 'left'
			}
		};
		var prms = $.extend( true, {}, defaults, opts );

		var data = this.infoData;

		var description = data.photoset.description._content.replace(/\n/g,"<br/>");
		var $id = $(id).html(
			$('<div>').html(data.photoset.title._content).css(prms.titleCSS)
		).append(
			$('<p>').html(description).css(prms.captionCSS)
		);

	},

	getPhotos: function ( func ) { // Photos

    // =========================================
    // ローカルモード
    // =========================================
    if (this.localMode) {
        this.getLocalPhotos(func);
        return;
    }

    // =========================================
    // htmlモード
    // =========================================
    if (this.htmlMode) {
        this.getHtmlPhotos(func);
        return;
    }

    // =========================================
    // Flickrモード
    // =========================================

		var self = this;

	    var flickrPrms = { 
			method: 'flickr.photosets.getPhotos',
			photoset_id: this.photoset_id,
			extras: 'geo,date_taken,owner_name,description,o_dims,original_format',
	    };
		if ( this.token ) {
			this.restAuth( this.secret, flickrPrms, function(data) {
				self.photosData = data;
				func(data);
			}); 
		} else if ( this.oauth_token ){
			this.restOauth( flickrPrms, function(data) {
				self.photosData = data;
				func(data);
			});
		} else {
			this.rest( flickrPrms, function(data) {
				self.photosData = data;
				func(data);
			});
		}

	},

getLocalPhotos: async function (func) {

    var self = this;

    var photoList = [];

    // -----------------------------------------
    // JPGファイルを取得
    // -----------------------------------------

    var files = this.localFiles || [];


    // -----------------------------------------
    // JPGを処理
    // -----------------------------------------

    for (var i = 0; i < files.length; i++) {

        var file = files[i];

        if (!file.name.match(/\.(jpg|jpeg)$/i)) {
            continue;
        }

        var url = URL.createObjectURL(file);


        // -------------------------------------
        // 画像サイズを取得
        // -------------------------------------

        var width = 0;
        var height = 0;

        try {

            var size = await getImageSize(url);

            width = size.width;
            height = size.height;

        } catch (e) {

            console.log("画像サイズ取得失敗:", file.name);
        }

        var thumbnailUrl = "";

        // -------------------------------------
        // EXIF情報を取得
        // -------------------------------------


        // -------------------------------------
        // 撮影日時
        // -------------------------------------

        var datetaken = "";

        // -------------------------------------
        // GPS
        // -------------------------------------

        var latitude = 0;
        var longitude = 0;

        // -------------------------------------
        // Flickrと似た写真オブジェクトを作る
        // -------------------------------------
		var title = file.name.replace(/\.jpe?g$/i, "");
		title = title.replace(/!/g, "");
        var photo = {

            id: file.name,

            title: title,

            description: {
                _content: ""
            },

            datetaken: "",

            latitude: latitude,

            longitude: longitude,

            o_width: width,

            o_height: height,

            // ローカル画像用
            localUrl: url,

            thumbnailUrl: thumbnailUrl,

            // 元ファイルと、選択フォルダ内での相対パス
            localFile: file,
            localRelativePath: (function() {
                var path = file.webkitRelativePath || file.name;
                var parts = path.split("/").filter(Boolean);
                if (parts.length > 1 && parts[0] === self.localTitle) parts.shift();
                return parts.join("/");
            })(),

            folderName: self.localTitle
        };




        // piexifjsでXPTitle / XPCommentを読み込む
        // exif-jsはXPタグを標準では扱わないため、ここだけpiexifjsを使用
        var xpMeta = await readXPMetadata(file);
        if (xpMeta.title) photo.title = xpMeta.title;
        if (xpMeta.description) photo.description._content = xpMeta.description;

        // その他のEXIF / GPS / IPTC情報を読み込む
        await new Promise(function(resolve) {
            EXIF.getData(file, function() {
	        const lat = EXIF.getTag(this, "GPSLatitude");
	        const latRef = EXIF.getTag(this, "GPSLatitudeRef");
	        const lng = EXIF.getTag(this, "GPSLongitude");
	        const lngRef = EXIF.getTag(this, "GPSLongitudeRef");
	        const datetaken = EXIF.getTag(this, "DateTimeOriginal");
			if (datetaken) {
				photo.datetaken = datetaken.slice(0,10)
			}
	                    
	        if (lat && lng) {
				photo.latitude = convertDMSToDD(lat, latRef);
	            photo.longitude = convertDMSToDD(lng, lngRef);
			}


		    // -----------------------------------------
		    // 写真の説明
		    // -----------------------------------------
		
		    var description = photo.description._content || "";
		
/*
		    // XMP
		    if (this.xmpdata) {
		
		        console.log("XMP =", this.xmpdata);
		
		        // XMPの内容から説明を探す
		        var match = this.xmpdata.match(
		            /<dc:description[^>]*>[\s\S]*?<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>/i
		        );
		
		        if (match) {
		            description = match[1];
		        }
		    }
*/
		
		    // XPCommentがなければ従来のIPTC Captionを読む
		    if (!description) {
		        var iptc = EXIF.getAllIptcTags(this);
		        if (iptc.caption) {
		            description = decodeIPTCText(iptc.caption);
		        }
		    }
		    if (description) {
		        photo.description = { _content: description };
		    }

            resolve();
            });
        });

        photoList.push(photo);
    }


    // -----------------------------------------
    // ファイル名順に並べる
    // -----------------------------------------

    photoList.sort(function(a, b) {

        return a.id.localeCompare(
            b.id,
            undefined,
            {
                numeric: true,
                sensitivity: "base"
            }
        );

    });

/*
    // -----------------------------------------
    // 代表画像を取得
    // ファイル名に "!" を含む画像
    // -----------------------------------------

    var primaryPhoto = photoList.find(function(photo) {
        return photo.id.indexOf("!") !== -1;
    });
*/

    // -----------------------------------------
    // Flickrと同じ構造にする
    // -----------------------------------------

    self.photosData = {

        photoset: {

/*            title: self.localTitle || "",

            description: {
                _content: description
            },

            primary: primaryPhoto ? primaryPhoto.id : "",

            owner: "",
*/

            photo: photoList
        }
    };
//console.log(self.photosData.photoset.description._content);
    func(self.photosData);
},

getHtmlPhotos: async function (func) {

    var self = this;

    var photoList = [];

    // -----------------------------------------
    // JPGファイルを取得
    // -----------------------------------------

    var files = this.htmlFiles || [];


    // -----------------------------------------
    // JPGを処理
    // -----------------------------------------

    for (var i = 0; i < files.length; i++) {

        var file = files[i];
/*
        if (!file.name.match(/\.(jpg|jpeg)$/i)) {
            continue;
        }
*/
        var url = file.src;

/*
        // -------------------------------------
        // 画像サイズを取得
        // -------------------------------------

        var width = 0;
        var height = 0;

        try {

            var size = await getImageSize(url);

            width = size.width;
            height = size.height;

        } catch (e) {

            console.log("画像サイズ取得失敗:", file.name);
        }
*/
        var thumbnailUrl = "";
        var datetaken = "";
        var latitude = file.lat;
        var longitude = file.lng;

        // -------------------------------------
        // Flickrと似た写真オブジェクトを作る
        // -------------------------------------
		var title = file.title;
        var photo = {

            id: file.title,
            title: title,
            description: {
                _content: ""
            },
            datetaken: "",
            latitude: latitude,
            longitude: longitude,
            o_width: "",
            o_height: "",
            localUrl: url,
            thumbnailUrl: thumbnailUrl,
            // 元ファイル
            localFile: file,

            folderName: self.localTitle
        };

        photoList.push(photo);
    }

/*
    // -----------------------------------------
    // ファイル名順に並べる
    // -----------------------------------------

    photoList.sort(function(a, b) {

        return a.id.localeCompare(
            b.id,
            undefined,
            {
                numeric: true,
                sensitivity: "base"
            }
        );

    });
*/
    // -----------------------------------------
    // Flickrと同じ構造にする
    // -----------------------------------------

    self.photosData = {

        photoset: {

            photo: photoList
        }
    };
//console.log(self.photosData.photoset.description._content);
    func(self.photosData);
},

	showPhotos: function ( id, opts ) {

		var defaults = {
			divCSS: {
				margin: '5px',
			   	float: 'left'
			},
			titleCSS: {
			   	margin: '0px',
				font: 'bold 16px arial,sans-serif', color: 'black',
				textAlign: 'left',  
				textDecoration: 'none'
			},
			captionCSS: {
			   	margin: '0px', 
				font: '16px arial,sans-serif', color: 'black',
			   	textAlign: 'left'
			},
			imgCSS: {
			   	border: 'none'
			},
			dateCSS: {
				font: '14px arial,sans-serif',
			   	textAlign: 'right',
				color: 'dimgray',
			   	margin: '0px 5px'
			},
			mapCSS: {
			   	margin: '0px 5px',
				font: 'bold 14px arial,sans-serif', color: 'green',
			   	float: 'left',
				cursor: 'pointer'
			}
		};
		var prms = $.extend( true, {}, defaults, opts );

		var list = this.photosData.photoset.photo;
		var photoset_owner = this.photosData.photoset.owner;

		this.$box = [];
		var $contents = $(id).html("");

	    for( var i=0; i<list.length; i++ ) {
	        var photo = list[i];

			var $li = $('<li></li>').css(prms.divCSS);

			if ( photo.latitude != 0 ) {
				var $map = $('<a></a>', { 
					text: 'map',
				} ).css(prms.mapCSS).addClass('modal').attr("data-mylat", photo.latitude).attr("data-mylng", photo.longitude);

				$li.append($map);
				this.modalMap();
			}

			var $date = $('<div></div>', { text: photo.datetaken.substr(0,10) } ).css(prms.dateCSS);
			var $ahref = $('<a></a>', {	
				href: 'http://www.flickr.com/photos/' 
					+ photoset_owner + '/' + photo.id + '/in/set-' + this.photoset_id, 
				target: '_blank' 
			});
			var $img = $('<img>', { 
/*
				'src': 'http://static.flickr.com/' + photo.server + '/' + photo.id+ '_' + photo.secret + '.jpg' 
*/
				'src': 'https://live.staticflickr.com/' + photo.server + '/' + photo.id+ '_' + photo.secret + '.jpg' 

			}).css(prms.imgCSS);
			$li.append($date).append($ahref.append($img));

			if (photo.title)	{
				var $photoTitle = $('<div></div>', { text: photo.title }).css(prms.titleCSS);
				$li.append($photoTitle);
			}
			if (photo.description._content){
				var $photoCaption = $("<div>" + photo.description._content.replace(/\n/g,"<br/>") + "</div>")
				.css(prms.captionCSS);
				$li.append($photoCaption);
			}
			$contents.append($li);
			this.$box[i] = $li;
	  	}
		var $img = $(id).find('img');
		$(id).children('li').css({display: "none"});
	
		var self = this;
		var imgIndex = 0;
		self.imgWidth = [];
	 	$img.bind('load',function(){

            $(this).addClass("imgLoaded");
	
			imgIndex++;

            for( var i=0; i<imgIndex; i++ ) {

                if ( $($img[i]).hasClass("imgLoaded") ) {

			        $(id).children('li').eq(i).css({
                    	display:'block',
                        opacity:'0',
                    }).animate(
						{opacity:'1'},1000
					);

                    $($img[i]).removeClass("imgLoaded");
                    self.imgWidth[i] = $($img[i]).width();
                    $(id).children('li').eq(i).css({
                    	width: self.imgWidth[i]
                    });

                }

            }
	
			if ( imgIndex >= $img.length ) {
				self.photoTable (id); 
	  		}

		});


		$(window).on('resize', function(){
			self.photoTable(id);
		});


	},

	slideshow: function ( id, opts ) {

		var defaults = {
				slidePosition: "window",
				slideSize: "o",
				slideRandom: false,
				interval: 8000,
				animateTime: 1500,
				slideNumber: ""  // 表示するスライドの数を制限する場合に定義する
		};
		var prms = $.extend( true, {}, defaults, opts );	// {}にdefaultsを上書きし、さらにoptsを上書きしてprmsに保存する

		if ( prms.slidePosition == "window" ) {
			this.slideWidth = $(window).width();
			this.slideHeight = $(window).height();
			var mandatory = {
				idCss: {
					position: "absolute",
          width: this.slideWidth,
          height: this.slideHeight,
				},
				div1Css: {
					position: "absolute"
				},
				div2Css: {
            display: "table-cell",
            width: this.slideWidth,
            height: this.slideHeight,
            textAlign: "center",
            verticalAlign: "middle"
				},
				imgCss: {
					maxWidth: "100%",
					maxHeight: "100%",
				}
			};
		} else { 
			this.slideWidth = $(id).width();
			this.slideHeight = $(id).height();
			var mandatory = {
				idCss: {
				},
				div1Css: {
					position: "absolute"
				},
				div2Css: {
					position: "relative",
            display: "table-cell",
            width: this.slideWidth,
            height: this.slideHeight,
            textAlign: "center",
            verticalAlign: "middle"
				},
				imgCss: {
					maxWidth: "100%",
					maxHeight: "100%",
				}
			};
}
		$.extend( true, prms, mandatory );	// prmsにmandatoryを上書きする。

		var loading = new Loading();
  	loading.start();

		this.slideshowId = id;
		var list = this.photosData.photoset.photo;

		$(id).css(prms.idCss).append( 
			$("<div></div>").css(prms.div1Css).append(
				$("<div></div>").css(prms.div2Css)
			)
		).append( 
			$("<div></div>").css(prms.div1Css).append(
				$("<div></div>").css(prms.div2Css)
			)
		);

		var imgList = new ImageLoader();

		switch ( prms.slideSize ) { 	
		
			case "o":	
				for ( i=0; i<list.length; i++) {
			  	var photo = list[i];
					var src =  photo.localUrl;
					imgList.add(src);
				}
				break;

			case "":
				for ( i=0; i<list.length; i++) {
			  	var photo = list[i];
					var src =  photo.localUrl;
					imgList.add(src);
				}
				break;				

			default:
				for ( i=0; i<list.length; i++) {
			  	var photo = list[i];
					var src =  photo.localUrl;
					imgList.add(src);
				}
				break;	

		}

		if ( prms.slideRandom ) {
			imgList.imageList.sort(
			    function() {
			        return Math.random() - 0.5;  // 戻り値の正負をランダムにする
			    }
			);
		}

		if (prms.slideNumber) {
			imgList.imageList.length = prms.slideNumber;
		}

		imgList.start();

		var self = this;
		var slideIndex = 0;

		imgList.onPprogress = function(event) {
			if ( imgList.loadedList.length < slideIndex+2 ) {
				nextSlide();
			}
		}

		nextSlide();

		$(window).on("resize orientationchange", function(){
			if ( prms.slidePosition == "full" ) {
				var slideWidth = $(window).width();
				var slideHeight = $(window).height();
			} else {
				var slideWidth = $(id).width();
				var slideHeight = $(id).height();
			}
			$( id + " div:nth-child(2) div" ).width(slideWidth);
			$( id + " div:nth-child(2) div" ).height(slideHeight);
			$( id + " div:nth-child(1) div" ).width(slideWidth);
			$( id + " div:nth-child(1) div" ).height(slideHeight);
		});

		function nextSlide() {
			clearInterval(self.slideTimer);
			loading.stop();
			if ( imgList.loadedList.length > slideIndex ) {
				$(id + " div:nth-child(2) div").html($("<img>", { src: imgList.imageList[slideIndex] }).css(prms.imgCss));
				$(id + " div:nth-child(2) div").css({opacity: 0.0}).animate( {opacity: 1.0}, prms.animateTime, function () {
					$(id + " div:nth-child(1) div").html($("<img>", { src: imgList.imageList[slideIndex] }).css(prms.imgCss));
				});
				$(id + " div:nth-child(1) div").css({opacity: 1.0}).animate( {opacity: 0.0},prms.animateTime );
				self.slideTimer = setInterval( function() {
						slideIndex++;
//						if ( slideIndex >= self.list.length ) { slideIndex = 0; }
						if ( slideIndex >= imgList.imageList.length ) { slideIndex = 0; }
						nextSlide();
				}, prms.interval );
			} else {
				loading.start();
			}
		}
			
	},

	photoTable: function (id) {

		var border = 0;
		var cellpadding = 5;
	    var windowMargin = 10;
	
		var $html = $('<div>');
	  	var td_num = 0;
		var colPix = 0;
	    for( var i=0; i<this.$box.length; i++ ) {
	
			if ( colPix+this.imgWidth[i]+2*cellpadding > $(window).width() - 2*windowMargin ) {
				td_num = 0;
				colPix = 0;
				$table.append($tr);
				$html.append($table);
			}
	
	   		if (td_num == 0) {
				var $table = $('<table>', { border:  border});
				var $tr = $('<tr>');
	  		}
	
			var $td = $('<td>', { padding: "5px"}).css({
				padding: String(cellpadding) + "px",
				width: this.imgWidth[i] + "px"
			}).append(this.$box[i].html());
			colPix += this.imgWidth[i]+2*cellpadding;
	
			$tr.append($td);
	   		if (i == this.$box.length-1) {
				$table.append($tr);
				$html.append($table);
	   		}
	
	    	td_num++;
	
		}
	
		$(id).html($html);
	},

	modalMap: function (opts) {

		var defaults = {
			markerSetting: {
				image: {
					url: "http://s10-4bn.sunnyday.jp/_icon/camera.png",
		      		size: new google.maps.Size(32,32),
		      		origin: new google.maps.Point(0,0),
		      		anchor: new google.maps.Point(17, 32),
					scaledSize: new google.maps.Size(32,32)
				},
				animation: null
			},
			arrowSetting: {
				image: new google.maps.MarkerImage( // 写真の座標を示す矢印の画像
					"http://www.google.com/mapfiles/gadget/arrowSmall80.png",
			    	new google.maps.Size(27, 31), // size
			    	new google.maps.Point(0,0), // origin
			    	new google.maps.Point(10, 60) // anchor
				),
				animation: google.maps.Animation.BOUNCE
			},
			modalSize: {
				width: "80%",
				height: "80%"
			},
			mapURL: "",   // 2019-05-04 追加
			customKml: false,
			kmlOptions: { // 2019-05-04 追加
				suppressInfoWindows: false,
				preserveViewport: true
			},
			customKmlOptions: { // 2019-05-04 追加 
      	point: {
      		showTitle: true,
      		click: "showDescription",
      		mouseover: null
      	},
      	line: {
      		showTitle: false,
      		click: null,
      		mouseover: "showTitle"
      	},
      	polygon: {
      		showTitle: false,
      		click: "showDescription",
      		mouseover: null
      	}
      }
		};
		var prms = $.extend( true, {}, defaults, opts );

		var list = this.photosData.photoset.photo;

		var self = this;
		$('body').off('click', '.modal').on('click', '.modal', function(){

			var $overlay = $('<div></div>').css({
						position: 'fixed', top: '0', left: '0',
						width: '100%', height: '100%',
						backgroundColor: 'black', opacity: '0.75'
			}).appendTo("body");
			var $modal = $("<div id = 'mapModal'></div>").css({
				display: 'none',
				position: 'absolute', top: '0', left: '0',
				width: prms.modalSize.width, height: prms.modalSize.height,
				backgroundColor: 'white', opacity: '1.0'
			}).appendTo("body").fadeIn('slow');
			var $modal_map = $("<div id='mapModal_map'></div>").css({
				position: 'relatice', top: '0', left: '0',
				width: '100%', height: '100%',
				backgroundColor: 'white', opacity: '1.0'
			}).appendTo($modal);

			var $latlng = $("<p>" + $(this).data("mylat") + ", " + $(this).data("mylng") + "</p>").css({
					position: "fixed",
					bottom: "10%",
					left: "10%",
					backgroundColor: "white",
					zIndex: "5",
					margin: "5px 5px 25px 5px",
					padding: "2px 5px"
				}).appendTo("body").fadeIn('slow');

			var gm = new GmLayout( "#mapModal_map", list )
			self.map = new google.maps.Map( document.getElementById('mapModal_map'),{
		    	zoom: gm.zoom,
		    	center: gm.ctr,
		      mapTypeId: google.maps.MapTypeId.ROADMAP,
					gestureHandling: "greedy"
			});
	
			var image = new google.maps.MarkerImage('http://s10-4bn.sunnyday.jp/_icon/camera.png',
	      		new google.maps.Size(32,32), // size
	      		new google.maps.Point(0,0), // origin
	      		new google.maps.Point(17, 32)); // anchor
			var pg = new PhotoGroup ( self.map, list, image );

			for ( key in pg.group ) {
				self.setMarkerPopup(pg.group[key]);
			}
	
			var latlng = new google.maps.LatLng(Number($(this).data("mylat")),Number($(this).data("mylng")));

			var marker = new google.maps.Marker({
		    	position: latlng,
		      map: self.map,
					animation: prms.arrowSetting.animation,
					icon: prms.arrowSetting.image
		    });

			modalResize($modal); 

			$overlay.off().click(function(){
		    	$modal.fadeOut('slow',function(){
					$modal.remove();
				});
				$overlay.fadeOut('slow',function(){
					$overlay.remove();
				});
				$latlng.fadeOut('slow',function(){
					$latlng.remove();
				});
			});

			var me = self;
			if (prms.mapURL){ // 2019-05-04 追加
				if (prms.customKml) {
			    $.ajax({
		        url: prms.mapURL,
		        type: 'GET',
		        dataType: 'xml',
		        timeout: 10000,
		        error: function(XMLHttpRequest, textStatus, errorThrown) {
							if (textStatus == "timeout") {
				            	alert("kmlのロードを失敗しました。再読み込みしてみてください。");
							}
		        },
		        success: function(xml){
							// map が形成されるのを待って initialize_gpx を実行
							var counter = 0;
							var timerID = setInterval(function(){
								if(me.map){ // map が形成されていたら実行
									clearInterval(timerID);  // setIntervalをクリアする
									prms.customKmlOptions.map = self.map;
									prms.customKmlOptions.xml = xml;
									var kml = new GMKml(prms.customKmlOptions);
				          kml.setMap(self.map);
								}
								if(counter>=10){ // 一定時間が経過したらsetIntervalを抜ける
									clearInterval(timerID);  // setIntervalをクリアする
								}
								counter++;
							},500);
		        }
			    });
				} else {
					//var ctaLayer = new google.maps.KmlLayer(prms.mapURL, prms.kmlOptions);
					//ctaLayer.setMap(self.map);
					var ctaLayer = new geoXML3.parser({
					    map: self.map,
					    singleInfoWindow: true,
					    processStyles: true
					});
					
					ctaLayer.parse(prms.mapURL);
				}
			}

			$(window).on('resize', function(){
					modalResize($modal);
			});

		});

	},

	showMap: function ( id, opts ) {

		var defaults = {
			mapOptions : {
				streetview : true,  // 2018-03-31 追加
				gestureHandling: "greedy"
			},
			marker: {
				url: "http://s10-4bn.sunnyday.jp/_icon/camera.png",
				sizeX: 32,
				sizeY: 32,
				anchorX: 17,
				anchorY: 32
			},
			image: {
				url: "http://s10-4bn.sunnyday.jp/_icon/camera.png",
	      		size: new google.maps.Size(32,32),
	      		origin: new google.maps.Point(0,0),
	      		anchor: new google.maps.Point(17, 32),
				scaledSize: new google.maps.Size(32,32)
			},
			customKml: false,
			mapURL: "",
			kmlOptions: {
				suppressInfoWindows: false,
				preserveViewport: true
			},
			customKmlOptions: { // 2019-05-04 追加 
      	point: {
					zIndex: 0,
      		showTitle: true,
      		click: "showDescription",
      		mouseover: null
      	},
      	line: {
      		showTitle: false,
      		click: null,
      		mouseover: "showTitle"
      	},
      	polygon: {
      		showTitle: false,
      		click: "showDescription",
      		mouseover: null
      	}
      },
			mapCenter: null	
		};
		var prms = $.extend( true, {}, defaults, opts );

		var list = this.photosData.photoset.photo;

		$(id).css({height: "100%"});

		var gm = new GmLayout( id, list );

		prms.mapOptions.zoom = gm.zoom;
		prms.mapOptions.center = gm.ctr;
	 	this.map = new google.maps.Map( $(id)[0], prms.mapOptions );

/*		var image = new google.maps.MarkerImage(prms.marker.url,
      		new google.maps.Size(prms.marker.sizeX, prms.marker.sizeY), // size
      		new google.maps.Point(0,0), // origin
      		new google.maps.Point(prms.marker.anchorX, prms.marker.anchorY)); // anchor  */
		var pg = new PhotoGroup ( this.map, list, prms.image );

		for ( key in pg.group ) {
			if (typeof pg.group[key] === "object") {
				this.setMarker(pg.group[key]);
				this.setMarkerPopup(pg.group[key]);
			}
		}

		var self = this;
		$(window).on('resize', function(){
			google.maps.event.trigger(self.map, 'resize');
		});

		if (prms.mapCenter) {
			self.map.setCenter(prms.mapCenter);
		}

		if (prms.mapURL){
	
			if (prms.customKml) {
		    $.ajax({
		        url:prms.mapURL,
		        type:'GET',
		        dataType:'xml',
		        timeout:10000,
		        error:function(XMLHttpRequest, textStatus, errorThrown) {
					if (textStatus == "timeout") {
		            	alert("kmlのロードを失敗しました。再読み込みしてみてください。");
					}
		        },
		        success:function(xml){

					// map が形成されるのを待って initialize_gpx を実行
					var counter = 0;
					var timerID = setInterval(function(){
						if(self.map){ // map が形成されていたら実行
							clearInterval(timerID);  // setIntervalをクリアする
								prms.customKmlOptions.map = self.map;
								prms.customKmlOptions.xml = xml;
								var kml = new GMKml(prms.customKmlOptions);		
/*		
		                var kml = new GMKml({
		                    map: self.map,
		                    xml: xml,
		                    point: {
														zIndex: 0,
		                        showTitle: true,
		                        click: "showDescription",
		                        mouseover: null
		                    },
		                    line: {
		                        showTitle: false,
		                        click: null,
		                        mouseover: "showTitle"
		                    },
		                    polygon: {
		                        showTitle: false,
		                        click: "showDescription",
		                        mouseover: null
		                    }
		                });
*/		
		                kml.setMap(self.map);
		
//		                var latlngBounds = kml.getDefaultViewport();
//		                self.map.fitBounds(latlngBounds);
		
		
						}
						if(counter>=10){ // 一定時間が経過したらsetIntervalを抜ける
							clearInterval(timerID);  // setIntervalをクリアする
						}
						counter++;
					},500);

		        }
		    });
			} else {
				//var ctaLayer = new google.maps.KmlLayer(prms.mapURL, prms.kmlOptions);
				//ctaLayer.setMap(self.map);
				var ctaLayer = new geoXML3.parser({
				    map: self.map,
				    singleInfoWindow: true,
				    processStyles: true
				});
				
				ctaLayer.parse(prms.mapURL);
			}

		}

	},

	setMarker: function ( groupImg ) {

		var marker = groupImg[0].marker;
		google.maps.event.addListener(marker, 'click', function() {

				// 	以下変更 2017-11-07
				$overlay = $('<div></div>').css({
							position: 'fixed', top: '0', left: '0',
							width: '100%', height: '100%',
							backgroundColor: 'black', opacity: '0.75'
				}).appendTo("body");

				var $modal = $("<div></div>").appendTo("body");
				for ( i=0; i<groupImg.length; i++) {

					$div = 	
						$("<div></div>").css({
								position: 'fixed', top: '0', left: '0',
								backgroundColor: 'white', opacity: '0.0'
						}).append(
							$('<img src = ' + groupImg[i].src +'>')
						).append(
							$("<p>" + groupImg[i].title + " (" + (i+1) + "/" + groupImg.length + ")</p>")
							.css({
								textAlign: "center",
								margin: "0px", padding: "5px"								
							})
						);
					
					if ( i != 0 ) {
						$('<div></div>', { text: "<"}).css({
								position: "absolute", bottom: '0', left: '0px',
								margin: "0px", padding: "2px",
								cursor: "pointer"
						}).on("click",function(){
							var $active = $modal.find("div.active");
							if ($active.prev().length) {
								$active.removeClass('active').css({zIndex: 1});
								var $prev = $active.prev().addClass('active');      	// activeな要素の次の要素を$nextに定義
								modalResize($prev);
//								$prev.css({opacity: 0.0}).css({zIndex: 2})
//							    	.animate({opacity: 1.0}, 1000, function() {$active.css({opacity: 0.0});});
								$prev.css({opacity: 0.0}).css({zIndex: 2})
							    	.animate({opacity: 1.0}, 1000);
								$active.animate({opacity: 0.0}, 1000);
							} 
						}).appendTo($div);
					}
					if ( i != groupImg.length-1 ) {
						$('<div></div>', { text: ">"}).css({
								position: "absolute", bottom: '0', right: '0px',
								margin: "0px", padding: "2px",
								cursor: "pointer"
						}).on("click",function(){
							var $active = $modal.find("div.active");
							if ($active.next().length) {
								$active.removeClass('active').css({zIndex: 1});
								var $next = $active.next().addClass('active');      	// activeな要素の次の要素を$nextに定義
								modalResize($next);
								$next.css({opacity: 0.0}).css({zIndex: 2})
							    	.animate({opacity: 1.0}, 1000);
								$active.animate({opacity: 0.0}, 1000);
							} 
						}).appendTo($div);
					}

// 2018-03-31 追加			
					$('<img src="http://s10-4bn.sunnyday.jp/_icon/close.png">').css({
							position: "absolute", top: '0', right: '0px',
							margin: "0px", padding: "0px",
							cursor: "pointer"
					}).on("click",function(){
				    	$modal.fadeOut('slow',function(){
							$modal.remove();
						});
						$overlay.fadeOut('slow',function(){
							$overlay.remove();
						});
					}).appendTo($div);
// ここまで

					$div.appendTo($modal);
					$div.find("img").on("load", function(){
						$(this).find("img").off("load");
						modalResize($(this).parent());
					});

				}

				var $active = $modal.find("div:first")
				$active.find("img").on("load", function(){
					$active.css({opacity: 0.0}).addClass('active')
							.animate({opacity: 1.0}, 1000).css({zIndex: 2});
				});

				$overlay.off().click(function(){
			    	$modal.fadeOut('slow',function(){
						$modal.remove();
					});
					$overlay.fadeOut('slow',function(){
						$overlay.remove();
					});
				});

				$(window).on('resize', function(){
					var $active = $modal.find("div.active");
					modalResize($active);
				});
				// 	以上変更 2017-11-07

	    });

	},

	setMarkerPopup: function ( groupImg ) {

		var marker = groupImg[0].marker;

		var $content = 
		$("<div></div>").css({
			backgroundColor: "white",
			border: "1px",
//			overflow: "hidden"
		}).append(
			$("<p></p>", { 
				text: groupImg[0].title 
			}).css({
				padding: "0px",
				margin: "0px"
			})
		).append(
			$("<img>", {
				src: groupImg[0].thum
//				src: "https://live.staticflickr.com/65535/55450948517_e5a207f9f3.jpg"
			}).css({
				width : "200px",
//				height : "100px",
				verticalAlign: "bottom"
			})
		);
//console.log($content.html());
	 	$content.find("img").bind('load',function(){

//console.log($content.find("img")[0].width + "px");
			var overlayHtml = new GMOverlayHtml({
				width: "200px",
//				width: $content.find("img")[0].width + "px",
				position: groupImg[0].marker.getPosition(), 
				$content: $content, 
				animation: "slideUp",
				offsetX: "-50%", 
				offsetY: "-35px"
			});
		
		  	google.maps.event.addListener(marker, 'mouseover', function() {
		    	overlayHtml.setMap(this.map);
		  	});
		
		  	google.maps.event.addListener(marker, 'mouseout', function() {
		  		overlayHtml.setMap(null);
		  	});

		});

	},

	switch: function ( id1, id2, idJudge, func, opts) {

		var defaults = {
			switchText: "写真 / 地図",
			switchCSS: {
				position: "absolute", top: '0', right: '0',
				margin: "10px", padding: "0px 10px 0px 10px",
				font: 'normal 16px arial,sans-serif', color: 'blue', backgroundColor: "#BBFFFF",
				cursor: "pointer",
    			borderRadius: "4px",
			    boxShadow: "2px 5px 5px 0px rgba(31, 31, 31, 0.5)",
			    textShadow: "1px 1px 1px rgba(0, 0, 0, 0.8)"
			},
			switchCSS_hover: {
			    backgroundColor: "#CCFFFF",
			    top: "-3px",
			    boxShadow: "2px 8px 5px 0px rgba(31, 31, 31, 0.5)",
			    cursor: "pointer"
			}
		};
		var prms = $.extend( true, {}, defaults, opts );

		$(id1).addClass("active");

		var self = this;
		$('<div></div>', { text: prms.switchText}).css(prms.switchCSS).appendTo("body").on("click",function(){

			$(this).css(prms.switchCSS);

			if ( ! $(idJudge).html() ) { 
				func(); 
			}

			if ( $(id1).hasClass("active") ) { // id1が表示されているとき
				$(id1).removeClass("active").css("display", "none"); // id1を非表示にする
				$(id2).addClass("active").css("display", "none").fadeIn(); // id2をfadeInで表示する
			} else { // id2が表示されているとき
				$(id2).removeClass("active").css("display", "none"); // id2を非表示にする。
				$(id1).addClass("active").css("display", "none").fadeIn(); // id1をfadeInで表示する
			}
			google.maps.event.trigger(self.map, 'resize');
		}).hover(
			function(){
				$(this).css(prms.switchCSS_hover);
			},
			function(){
				$(this).css(prms.switchCSS);
			}
		);

	},

	layout: function ( headerId, contentsId ) {
		$("body").css({overflow: "hidden"});
		$(contentsId).height($(window).height() - $(headerId).outerHeight(true)); 
		var self = this;
		$(window).on('resize', function(){
			$(contentsId).height($(window).height() - $(headerId).outerHeight(true)); 
		});
	},

	showPhotoList: function ( id, opts ) {

		var defaults = {
			onClick: "",
			imgSuffix: "_n",
			liCSS: {},
			imgRatio: "1.0",  // 2021-11-07 追加
			localImgSize: "500",
			titleCSS: {
			   	margin: '0px',
				font: 'bold 16px arial,sans-serif', color: 'black',
				textAlign: 'left',  
				textDecoration: 'none'
			},
			captionCSS: {
			   	margin: '0px', 
				font: '16px arial,sans-serif', color: 'black',
			   	textAlign: 'left'
			},
			imgCSS: {
			   	border: 'none',
				cursor: "pointer"
			},
			dateCSS: {
				font: '14px arial,sans-serif',
			   	textAlign: 'right',
				color: 'black',
			   	margin: '0px 5px'
			},
			mapCSS: {
			   	margin: '0px 5px',
				font: 'bold 14px arial,sans-serif', color: 'green',
			   	float: 'left',
				cursor: 'pointer'
			},
			mapClass: "flickrPhotoset-mapClass",
			mapURL: "",   // 2019-05-04 追加
			customKml: false,   // 2019-05-04 追加
			kmlOptions: { // 2019-05-04 追加
				suppressInfoWindows: false,
				preserveViewport: true
			},
			customKmlOptions: { // 2019-05-04 追加 
      	point: {
      		showTitle: true,
      		click: "showDescription",
      		mouseover: null
      	},
      	line: {
      		showTitle: false,
      		click: null,
      		mouseover: "showTitle"
      	},
      	polygon: {
      		showTitle: false,
      		click: "showDescription",
      		mouseover: null
      	}
      }
		};
		var mandatory = {
			liCSS: {
				float: "left",
				display: "block"
			}
		};

		var self = this;

//		var prms = $.extend( true, {}, defaults, opts, mandatory );
		var prms = $.extend( {}, defaults, opts, mandatory );
		var photoWidth = [];
		var photoHeight = [];
		var $liPhoto = [];

		this.photoImage = new ImageLoader();

		var list = this.photosData.photoset.photo;
//console.log(list);
		var photoset_owner = this.photosData.photoset.owner;

		var $contents = $(id).html("");

	    for( var i=0; i<list.length; i++ ) {
	        var photo = list[i];
// 以下追加  2019-04-09
			var imgSuffix = prms.imgSuffix;
			if ( screen.width > 1024 ) {
				if ( Number(photo.o_width)/Number(photo.o_height) >= 2.0 ) {
					//if ( prms.imgSuffix == "" ) imgSuffix = "_b";
					//if ( prms.imgSuffix == "_n" ) imgSuffix = "_c";
				}
			}

// ここまで

			if ( imgSuffix == "_o" ) { // 2021-11-07 修正
				var photoSrc =  photo.localUrl;
			} else {
				var photoSrc = photo.localUrl;
			}

			this.photoImage.add(photoSrc);
		}

		this.photoImage.start();
		this.photoImage.onLoaded = function() {
			$("#showImgSequence-loading-image").fadeOut(1000).remove();
		}

		$(window).on('resize', function(){
			photoList(id);
		});

		var self = this;
		var photoIndex = 0;
		this.photoImage.onPprogress = function(event) {
			var img = event.data;
			if (self.localMode) {prms.imgRatio = prms.localImgSize / Math.max(img.width,img.height)}
			img.width = img.width * parseFloat(prms.imgRatio);  // 2021-11-07 追加
			img.height = img.height * parseFloat(prms.imgRatio);  // 2021-11-07 追加
			photoWidth[photoIndex] = img.width;
			photoHeight[photoIndex] = img.height;

	        var photo = list[photoIndex];

			$liPhoto[photoIndex] = $('<li></li>')
            .css(prms.liCSS);

			if ( photo.latitude != 0 ) {
				var $map = $('<a></a>', { 
					text: 'map',
				} )
                .css(prms.mapCSS).addClass(prms.mapClass)
                .addClass('modal').attr("data-mylat", photo.latitude).attr("data-mylng", photo.longitude);

				$liPhoto[photoIndex].append($map);
				self.modalMap({ // 2019-05-04 追加
					mapURL: prms.mapURL,   
					customKml: prms.customKml,
					kmlOptions: prms.kmlOptions,
					customKmlOptions: prms.customKmlOptions
				});
			}

			var $date = $('<div></div>', { text: photo.datetaken.substr(0,10) } )
                .css(prms.dateCSS);
			var $img = $('<img>', { 
				src: self.photoImage.imageList[photoIndex], // 修正 2019-04-09
				width: img.width  // 2021-11-07 追加
			}).css(prms.imgCSS).addClass("photo-img").on( "click", function(){

				currentScrollTop = $(window).scrollTop();

				var imgIndex = $('img.photo-img').index(this);
				var slideWidth = window.innerWidth;
				self.currentSlide = imgIndex;
				self.$slide.css({left:(-self.currentSlide*slideWidth)});	
				self.showSlide();
				if(prms.onClick) { prms.onClick(); }		
			});
			$liPhoto[photoIndex].append($date).append($img);

			if (photo.title)	{
				var photo_title = photo.title;
				if ( photo.title.charAt(0) == "1" || photo.title.charAt(0) == "2" ){
					if ( photo.title.indexOf("]") != -1 ) {
						var photo_title = photo.title.substr(photo.title.indexOf("]")+1,photo.title.length);
					} else {
						var photo_title = photo.title.substr(15,photo.title.length);
					}
				}
				photo.title = photo_title;
				var $photoTitle = $('<div></div>', { text: photo.title })
                    .css(prms.titleCSS);
				$liPhoto[photoIndex].append($photoTitle);
			}
			if (photo.description._content){
				var $photoCaption = $("<div>" + photo.description._content.replace(/\n/g,"<br/>") + "</div>")
				.css(prms.captionCSS);
				$liPhoto[photoIndex].append($photoCaption);
			}
            $liPhoto[photoIndex].append("<br/>");
			$contents.append($liPhoto[photoIndex]);
			photoList(id);
			photoIndex++;

		}

        $contents.after("<div style='clear: both;'></div>");

		var photoList = function(id) {
		
			$(id + "> .showImgSequence-next-line").remove();
			$(id).prepend("<div class='showImgSequence-next-line' style='clear: both'></div>");
		
			var cellpadding = 10;
		
			var colPix = 0;
			var tmpIndex = 0;
			var colHeight = 0;
			var marginLeft = cellpadding;
		
		    for( var i=0; i<$liPhoto.length; i++ ) {
		
				if ( colPix+photoWidth[i]+cellpadding > $(id).width() ) {
					var marginLeft = ( $(id).width() - colPix - cellpadding ) / (i-tmpIndex+1 ) + cellpadding;
					colPix = 0;
					for ( j=tmpIndex; j<i; j++ ) {
						var marginTopBottom = ( colHeight - photoHeight[j] + cellpadding ) /2;
						$liPhoto[j].animate({ 
							"margin-left": marginLeft+"px",
							"margin-right": "0px",
							"margin-top": marginTopBottom+"px",
							"margin-bottom": marginTopBottom+"px"
						}, "fast"); 

						if ( j == i-1 ) {
							$liPhoto[j].after("<div class='showImgSequence-next-line' style='clear: both'></div>"); 
						}
		
					}
		
					tmpIndex = i;
					colHeight = 0;	
		   		}
				colHeight = Math.max ( colHeight, photoHeight[i] + cellpadding );
				colPix += photoWidth[i]+cellpadding;

				if ( i == $liPhoto.length-1 ) {
					$liPhoto[i].after("<div class='showImgSequence-next-line' style='clear: both'></div>"); 
				}
			
			}
		
			if ( photoIndex < $liPhoto.length ) { // resizeの時は実行しない
				for ( j=tmpIndex; j<$liPhoto.length; j++ ) {
					var marginTopBottom = ( colHeight - photoHeight[j] ) /2;
					if ( j == $liPhoto.length-1  ) { $liPhoto[j].hide() };
//console.log(photoWidth[j]);
					$liPhoto[j].css({ 
						"width": photoWidth[j]+"px",
						"margin-left": cellpadding+"px",
						"margin-right": "0px",
						"margin-top": marginTopBottom+"px",
						"margin-bottom": marginTopBottom+"px"
					}); 
					if ( j == $liPhoto.length-1  ) { $liPhoto[j].fadeIn(1000) };
				}
			}
		
			for ( j=tmpIndex; j<$liPhoto.length; j++ ) {
				var marginTopBottom = ( colHeight - photoHeight[j] ) /2;
				$liPhoto[j].animate({ 
					"width": photoWidth[j]+"px",
					"margin-left": marginLeft+"px",
					"margin-right": "0px",
					"margin-top": marginTopBottom+"px",
					"margin-bottom": marginTopBottom+"px"
				}, "fast"); 
			}
		
		};

	},

	setSlide: function ( id, opts ) {

		if ( $(id).prop("tagName") == "UL" ) { // 前のヴァージョンに対応させるため
			this.$slide = $(id);
		} else {
			this.$slide = $("<ul></ul>").appendTo($(id));
		}

		var ulCss = {
    	top: "0",
      left: "0",
      position: "absolute",
      display: "table"
		};
		this.$slide.css(ulCss);
		var liCss = {
    	margin: "0",
      padding: "0",
      display: "table-cell",
      border: "1px",
      textAlign: "center",
      verticalAlign: "middle",
      backgroundColor: "black",
      backgroundImage: "url('http://s10-4bn.sunnyday.jp/_img/img-loading.gif')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center",
//			cursor: "pointer"
		};

		var scrollSpeed  = 300;

		this.slideImage = new ImageLoader();
		var list = this.photosData.photoset.photo;
		this.slideSrc = [];
		this.originalSrc = []; // 2018-03-10 追加
		var slideWidth = window.innerWidth;  // $(id).width() ??
		var slideHeight = window.innerHeight;
		var leftMax = - (slideWidth * (list.length-1));
		var listWidth = slideWidth;
		var self = this;

		$(window).on("resize orientationchange", function(){
			var slideWidth = window.innerWidth;  
			var slideHeight = window.innerHeight;
			self.$slide.width(slideWidth * list.length);
			self.$slide.height(slideHeight);
			leftMax = - (slideWidth * (list.length-1));
			listWidth = slideWidth;
			$(id + " li").css({ // 2020-04-30 変更
				width: slideWidth,
				height: slideHeight
			});
			self.$slide.css({left:(-self.currentSlide*slideWidth)});
		});

		self.$slide.width(slideWidth * list.length);
		self.$slide.height(slideHeight);
		var longSide = Math.max( screen.width, screen.height)
	  for( var i=0; i<list.length; i++ ) {
			var photo = list[i];
			var $li = $('<li></li>').css(liCss).css({
				width: slideWidth,
				height: slideHeight,
			});

			self.slideSrc[i] = photo.localUrl; 
			self.originalSrc[i] = photo.localUrl; 
			self.$slide.append($li);
	  }
//console.log(self.$slide);
    self.$slide.bind({
			'touchstart mousedown': function(e){ // 2019-09-15 修正
				this.touched = false;
				if ( self.$slide.is(':not(:animated)') ) { // 2018-02-04 追加
            	if ( e.type == "mousedown" ) { 
						e.preventDefault();
						this.touched = true;
					}
					this.pageX = (e.type == 'touchstart' ? e.originalEvent.changedTouches[0].pageX : e.pageX);
              this.leftBegin = parseInt($(this).css('left'));
              this.left = parseInt($(this).css('left'));
							if ( e.originalEvent.targetTouches ) { // 2020-04-29 追加
              	if ( e.originalEvent.targetTouches.length == 1 ) this.touched = true;  // 2019-09-15 追加
							}
				} else { // 2018-02-04 追加
					e.preventDefault();
				}
      },
			'touchmove mousemove': function(e){
      	if(!this.touched){
        	return;
        }
      	e.preventDefault();
        this.left = this.left - (this.pageX - (e.type == 'touchmove' ? event.changedTouches[0].pageX : e.pageX) );
        this.pageX = (e.type == 'touchmove' ? e.originalEvent.changedTouches[0].pageX : e.pageX); 
        if(this.left < 0 && this.left > leftMax){
        	$(this).css({left:this.left});
        } else if(this.left >= 0) {
        	$(this).css({left:'0'});
        } else if(this.left <= leftMax) {
        	$(this).css({left:(leftMax)});
        }
      },
			'touchend mouseup mouseout': function(e){
      	if (!this.touched) {
        	return;
        }
        this.touched = false;
        if(this.leftBegin > this.left && (!((this.leftBegin) === (leftMax)))) {
        	$(this).stop().animate({left:((this.leftBegin)-(listWidth))},scrollSpeed);
					self.currentSlide = parseInt( -((this.leftBegin)-(listWidth)) / listWidth );
        } else if(this.leftBegin < this.left && (!((this.leftBegin) === 0))) {
        	$(this).stop().animate({left:((this.leftBegin)+(listWidth))},scrollSpeed);
					self.currentSlide = parseInt( -((this.leftBegin)+(listWidth)) / listWidth );
        }
			}
    });

	},

	showSlide: function () {

		var self = this;
		self.slideImage.delete();
		var list = this.photosData.photoset.photo;
		var imgIndex = [];
		var imgIndexMax = 0;
		var imgIndexMin = list.length-1;
		var loadIndex = self.currentSlide;

		for( var i=0; i<list.length; i++ ) { // i=0はすでに読み込み中のimageに対応するため
			if ( imgIndexMin == 0 ) {
				imgIndexMax++;
				imgIndex[i] = imgIndexMax;
				var photo = list[imgIndex[i]];
			} else if ( imgIndexMax == list.length-1 ) {
				imgIndexMin--;
				imgIndex[i] = imgIndexMin;
				var photo = list[imgIndex[i]];
			} else {
				loadIndex +=  i * Math.pow(-1,i+1);
				if ( loadIndex < 0 ) {
					imgIndex[i] = loadIndex+list.length;
					var photo = list[imgIndex[i]];
				} else if ( loadIndex >= list.length ) {
					imgIndex[i] = loadIndex-list.length;
					var photo = list[imgIndex[i]];
				} else {
					imgIndex[i] = loadIndex;
					var photo = list[imgIndex[i]];
					if ( imgIndex[i] > imgIndexMax ) imgIndexMax = imgIndex[i];
					if ( imgIndex[i] < imgIndexMin ) imgIndexMin = imgIndex[i];
				}	
			}	 
			if (loadIndex >= 0 ) {
				self.slideImage.add(self.slideSrc[imgIndex[i]]);
			}
		}
	
		self.slideImage.start();
	
		const ua = navigator.userAgent;
		if(navigator.userAgent.indexOf('Trident') !== -1) { // 2020-04-21 追加
			var imgDisplay = "inline"; // IE11のとき
		} else {
			var imgDisplay = "block"; // iPhone対応、"block"だとIE11で不具合
		}

		var slideIndex = 0;
		self.slideImage.onPprogress = function(event) {
			var img = event.data;
			for( var i=0; i<list.length; i++ ) { 
				if ( img.src == self.slideSrc[i] ) {
					$(img).hide();
					self.$slide.find("li").eq(i).html(img);
					$(img).css({
						"max-width": "100%",
					  	"max-height": "100%",
					  	"width": "auto",
					  	"height": "auto",
						"margin": "0 auto", // 2018-02-04 追加
						"display": imgDisplay // 2020-04-21 修正 ⇒ "block"だとIE11で不具合
					}).fadeIn(1000);
				}
			}
			slideIndex++;
		}

	},

	downloadPhoto: function ( id, index ) { // 2018-03-11 追加
		
		var list = this.photosData.photoset.photo;
	    var photo = list[index];
		var src = photo.localUrl;
	    $("#" + id).attr("href", src);
//	    $("#" + id).attr("download", "");
	    $("#" + id).attr("target", "_blank");

	}

});

// private

var o2s = function( obj ) {
		var ret = []
		for (var s in obj) {
			ret.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
		}
		return ret.join('&');
}

function modalResize($element){ // モーダルコンテンツの表示位置を設定する関数

	var w = $(window).width(); // ウィンドウの横幅を取得
	var h = $(window).height(); // ウィンドウの高さを取得
	var x = (w - $element.outerWidth(true)) / 2; // モーダルコンテンツの表示位置を取得
	var y = (h - $element.outerHeight(true)) / 2; // モーダルコンテンツの表示位置を取得
//	$element.css({'left': x + 'px','top': y + 'px'}); // モーダルコンテンツの表示位置を設定
	$element.css({
		'position': 'fixed',
		'left': x + 'px',
		'top': y + 'px'
	}); // モーダルコンテンツの表示位置を設定
}

var GmLayout = function ( id, list ) {

	var default_zoom = 16;

	var latitude = [];
	var longitude = [];

    for( var i=0; i<list.length; i++ ) {
		if ( parseFloat(list[i].latitude) != 0 ) {
	        latitude.push(parseFloat( list[i].latitude ));
			longitude.push(parseFloat( list[i].longitude ));
		}
	}

	if ( ! latitude.length ) return;  // 2018-02-17

	var maxLat = Math.max.apply(null, latitude);
	var minLat = Math.min.apply(null, latitude);
	var maxLng = Math.max.apply(null, longitude);
	var minLng = Math.min.apply(null, longitude);

	var ctrLat = (maxLat+minLat)/2;
	var ctrLng = (maxLng+minLng)/2;

	var rangeLat = maxLat-minLat;
	var rangeLng = maxLng-minLng;

/* 2026-10-02 変更
	var var_zoomLat = Math.floor( Math.log(340/rangeLat/256*$(id).height()) / Math.log(2) );
	var var_zoomLng = Math.floor( Math.log(340/rangeLng/256*$(id).width()) / Math.log(2) );
*/
	var var_zoomLat = Math.floor( Math.log(340/rangeLat/256*$(window).height()) / Math.log(2) );
	var var_zoomLng = Math.floor( Math.log(340/rangeLng/256*$(window).width()) / Math.log(2) );



	this.zoom = Math.min ( var_zoomLat, var_zoomLng, default_zoom );
	this.ctr = new google.maps.LatLng(ctrLat,ctrLng);

}

var PhotoGroup = function ( map, list, iconImage ) {

		var pLatLng = [];
		this.group = [];

		for (var i = 0; i < list.length; i++) {

	    	var photo = list[i];
	
			var myLat = photo.latitude;
			var myLng = photo.longitude;
			pLatLng[i] = myLat + ',' + myLng;
	
			var marker = null;
			if (!this.group[pLatLng[i]]) {
				this.group[pLatLng[i]] = [];
				var marker = new google.maps.Marker({
		    	position: new google.maps.LatLng(Number(myLat),Number(myLng)),
		      map: map,
					animation: null,
					icon: iconImage,
					zIndex: 99
		    });
			}
			var jpg_suffix = "";
			if(navigator.userAgent.match(/(iPhone|iPod|Android)/i)){ // iPhone等の場合のみ処理 2019-09-20
				jpg_suffix = "_n";
			}
			this.group[pLatLng[i]].push({
				src: photo.localUrl,
				thum: photo.localUrl,
				marker: marker,
				title: photo.title
			});

		}

}


function getImageSize(url) {

    return new Promise(function(resolve, reject) {

        var img = new Image();

        img.onload = function() {

            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight
            });

        };

        img.onerror = function() {
            reject();
        };

        img.src = url;
    });
}

        function convertDMSToDD(dms, ref) {
            const degrees = dms[0];
            const minutes = dms[1];
            const seconds = dms[2];
            let dd = degrees + (minutes / 60) + (seconds / 3600);
            if (ref === "S" || ref === "W") {
                dd = dd * -1;
            }
            return dd;
        }


async function createThumbnail(file, maxWidth) {

    return new Promise(function(resolve, reject) {

        var url = URL.createObjectURL(file);

        var img = new Image();

        img.onload = function() {

            // ---------------------------------
            // 縮小率
            // ---------------------------------

            var scale = 1;

            if (img.width > maxWidth) {

                scale = maxWidth / img.width;
            }


            // ---------------------------------
            // Canvasサイズ
            // ---------------------------------

            var width = Math.round(img.width * scale);
            var height = Math.round(img.height * scale);

            var canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;


            // ---------------------------------
            // 画像を縮小
            // ---------------------------------

            var ctx = canvas.getContext("2d");

            ctx.drawImage(
                img,
                0,
                0,
                width,
                height
            );


            // ---------------------------------
            // JPEGとしてBlob化
            // ---------------------------------

            canvas.toBlob(
                function(blob) {

                    URL.revokeObjectURL(url);

                    if (!blob) {

                        reject(
                            new Error("サムネイル作成失敗")
                        );

                        return;
                    }


                    // ---------------------------------
                    // サムネイルURL
                    // ---------------------------------

                    var thumbnailUrl =
                        URL.createObjectURL(blob);

                    resolve(thumbnailUrl);

                },
                "image/jpeg",
                0.8
            );
        };


        img.onerror = function() {

            URL.revokeObjectURL(url);

            reject(
                new Error("画像読み込み失敗")
            );
        };


        img.src = url;
    });
}



async function readXPMetadata(file) {
    if (!window.piexif) return { title: "", description: "" };

    var bytes = new Uint8Array(await file.arrayBuffer());
    var binary = "";
    var chunkSize = 0x8000;
    for (var offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(offset, offset + chunkSize));
    }

    var exif = piexif.load(binary);
    var zeroth = exif["0th"] || {};
    return {
        title: decodeXPText(zeroth[0x9c9b]),
        description: decodeXPText(zeroth[0x9c9c])
    };
}

function decodeXPText(value) {
    if (!value) return "";
    if (typeof value === "string") return value.replace(/\u0000+$/g, "");

    var bytes = Array.from(value);
    while (bytes.length >= 2 && bytes[bytes.length - 1] === 0 && bytes[bytes.length - 2] === 0) {
        bytes.splice(bytes.length - 2, 2);
    }
    try {
        return new TextDecoder("utf-16le").decode(new Uint8Array(bytes));
    } catch (e) {
        var result = "";
        for (var i = 0; i + 1 < bytes.length; i += 2) {
            result += String.fromCharCode(bytes[i] | (bytes[i + 1] << 8));
        }
        return result;
    }
}

function decodeIPTCText(str) {

    // 文字列中の \xNN を元のバイト値に戻す
    var bytes = [];

    for (var i = 0; i < str.length; i++) {

        var c = str.charCodeAt(i);

        if (c >= 0x80) {
            bytes.push(c & 0xff);
        } else {
            bytes.push(c);
        }
    }

    var decoder = new TextDecoder("shift_jis");

    return decoder.decode(new Uint8Array(bytes));
}
