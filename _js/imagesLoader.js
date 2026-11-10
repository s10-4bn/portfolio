/**
 * imagesLoader.js
 *
 * Copyright (c) 2012 Toshihiko Nii(mellowdown.net)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 */

function ImageLoader() { 
	this.imageList = []; // 2020-04-22
	this.loadedList = []; // 2020-04-22
};

ImageLoader.prototype = {
/* 2020-04-22
	imageList: [],
	loadedList: [],
*/
	onPprogress: null,
	onLoaded: null,

	add: function(value) {
		if (value instanceof Array) {
			this.imageList = this.imageList.concat(value);
		} else {
			this.imageList.push(value);
		}
	},

	start: function() {
		this.loadImage();
	},

	loadImage: function() {
		var self = this;
		var img = new Image();
		img.src = this.imageList[this.loadedList.length];
		img.url = this.imageList[this.loadedList.length];
//console.log(this.imageList[this.loadedList.length] + " : " + this.loadedList.length);
		this.imageList[this.loadedList.length].img = img;



		img.onload = function() {
			self.loadedList.push(this);

			if (typeof(self.onPprogress) == "function") {
				var event = new Object();
				event.data = this;
				event.loadedNum = self.loadedList.length;
				self.onPprogress(event);
			}

			if (self.loadedList.length == self.imageList.length) {
//console.log(self.loadedList.length + " : " +  self.imageList.length);
				self.loadComp();
				return;
			}

			if ( self.imageList[self.loadedList.length] ) { // ’Ç‰Á
//console.log("PASSED");
				self.loadImage();
			}
		}

	},

	loadComp: function() {
		if (typeof(this.onLoaded) == "function") {
			this.onLoaded();
		}
	},

	get: function(url) {
		for (var i = 0; i < this.loadedList.length; i++) {
			if (this.loadedList[i].url == url) {
				return this.loadedList[i];
			}
		}
		return null;
	},

	delete: function() {
		this.imageList = [];
		this.loadedList = [];
	}

}
