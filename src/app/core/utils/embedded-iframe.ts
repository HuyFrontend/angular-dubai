/* tslint:disable */
export const NG_EMBED_REGEXP_PATTERNS = {
	// url
	protocol: /^[a-z]+:\/\//i,
	url: /\b(?:(https?|ftp|file):\/\/|www\.)[-A-Z0-9+()&@$#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]/gi,
	// files
	basicVideo: /((?:https?|ftp|file):\/\/\S*\.(?:ogv|webm|mp4)(\?([\w=&_%\-]*))?)/gi,
	basicAudio: /((?:https?|ftp|file):\/\/\S*\.(?:wav|mp3|ogg)(\?([\w=&_%\-]*))?)/gi,
	basicImage: /((?:https?|ftp|file):\/\/\S*\.(?:gif|jpg|jpeg|tiff|png|svg|webp)(\?([\w=&_%\-]*))?)/gi,
	pdf: /((?:https?|ftp|file):\/\/\S*\.(?:pdf)(\?([\w=&_%\-]*))?)/gi,
	// audio
	soundCloud: /soundcloud.com\/[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+/gi,
	spotify: /spotify.com\/track\/[a-zA-Z0-9_]+/gi,
	// code
	highlightCode: /(`{3})(\s|[a-z]+)\s*([\s\S]*?[^`])\s*\1(?!`)/gm,
	codepen: /http:\/\/codepen.io\/([A-Za-z0-9_]+)\/pen\/([A-Za-z0-9_]+)/gi,
	gist: /gist.github.com\/[a-zA-Z0-9_-]+\/([a-zA-Z0-9]+)/gi,
	ideone: /ideone.com\/[a-zA-Z0-9]{6}/gi,
	jsbin: /jsbin.com\/[a-zA-Z0-9_]+\/[0-9_]+/gi,
	jsfiddle: /jsfiddle.net\/[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+/gi,
	plunker: /plnkr.co\/edit\/[a-zA-Z0-9?=]+/gi,
	// video
	dotsub: /dotsub.com\/view\/[a-zA-Z0-9-]+/gi,
	dailymotion: /^.+dailymotion.com\/((video|hub)\/([^_]+))?[^#]*(#video=([^_&]+))?/gi,
	liveleak: /liveleak.com\/view\?i=[a-zA-Z0-9_]+/gi,
	ted: /ted.com\/talks\/[a-zA-Z0-9_]+/gi,
	vimeo: /vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)*/gi,
	youtube: /(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/ytscreeningroom\?v=|\/feeds\/api\/videos\/|\/user\S*[^\w\-\s]|\S*[^\w\-\s]))([\w\-]{11})[?=&+%\w-]*/gi,
	twitchtv: /twitch.tv\/[a-zA_Z0-9_]+/gi,
	ustream: /ustream.tv\/[a-z\/0-9]*/gi,
	// social media
	twitter: /https:\/\/twitter\.com\/\w+\/\w+\/\d+/gi
};
/* tslint:enable */

export const NG_EMBED_DEFAULT_OPTIONS = {
	watchEmbedData: false,
	sanitizeHtml: true,
	fontSmiley: true,
	emoji: true,
	link: true,
	linkTarget: '_self',
	pdf: {
		embed: true
	},
	image: {
		embed: false
	},
	audio: {
		embed: true
	},
	code: {
		highlight: true,
		lineNumbers: false
	},
	basicVideo: false,
	gdevAuth: null,
	video: {
		embed: true,
		width: 560,
		height: 315,
		ytTheme: 'dark',
		details: false,
		thumbnailQuality: 'medium'
	},
	tweetEmbed: false,
	tweetOptions: {
		//The maximum width of a rendered Tweet in whole pixels. Must be between 220 and 550 inclusive.
		maxWidth: 550,
		//When set to true or 1 links in a Tweet are not expanded to photo, video, or link previews.
		hideMedia: false,
		//When set to true or 1 a collapsed version of the previous Tweet in a conversation thread
		//will not be displayed when the requested Tweet is in reply to another Tweet.
		hideThread: false,
		//Specifies whether the embedded Tweet should be floated left, right, or center in
		//the page relative to the parent element.Valid values are left, right, center, and none.
		//Defaults to none, meaning no alignment styles are specified for the Tweet.
		align: 'none',
		//Request returned HTML and a rendered Tweet in the specified.
		//Supported Languages listed here (https://dev.twitter.com/web/overview/languages)
		lang: 'en'
	},
	twitchtvEmbed: false,
	vimeoEmbed: false,
	dailymotionEmbed: false,
	tedEmbed: false,
	dotsubEmbed: false,
	liveleakEmbed: false,
	ustreamEmbed: false,
	soundCloudEmbed: false,
	soundCloudOptions: {
		height: 160,
		themeColor: 'f50000',   //Hex Code of the player theme color
		autoPlay: false,
		hideRelated: false,
		showComments: true,
		showUser: true,
		showReposts: false,
		visual: false,         //Show/hide the big preview image
		download: false          //Show/Hide download buttons
	},
	spotifyEmbed: false,
	codepenEmbed: false,
	codepenHeight: 300,
	jsfiddleEmbed: false,
	jsfiddleHeight: 300,
	jsbinEmbed: false,
	jsbinHeight: 300,
	plunkerEmbed: false,
	githubgistEmbed: false,
	ideoneEmbed: false,
	ideoneHeight: 300
};


function getUniqueArray(list) {
	//*
	// fast way using hashmap
	// inspired by http://jszen.com/best-way-to-get-unique-values-of-an-array-in-javascript.7.html
	var n = {}, r = [];
	for (var i = 0; i < list.length; i++) {
		if (!n[list[i]]) {
			n[list[i]] = true;
			r.push(list[i]);
		}
	}
	return r;
	//*/
	/*
	// IE9+, a bit slower
	return list.filter(function (x, i, a) {
		return a.indexOf(x) === i;
	});
	//*/
}

/**
 * Function trunc
 *
 * @description
 * truncates string to specified length
 *
 * @param {string} str
 * @param {number} n
 * @param {boolean} useWordBoundary
 * @returns string
 */

export function trunc(str, n, useWordBoundary) {
	var toLong = str.length > n,
		txt = toLong ? str.substr(0, n - 1) : str;
	txt = useWordBoundary && toLong ? txt.substr(0, txt.lastIndexOf(' ')) : txt;
	return toLong ? txt + '...' : txt;
}

/**
 * Function extendDeep
 *
 * @description
 * Extends an object to another object using deep analyzing
 *
 * @param dst
 * @returns extended object
 */

export function extendDeep(dst) {
	// 
	return dst;
}

/**
 * FUNCTION insertfontSmiley
 * @description
 * Coverts the text into font emoticons
 *
 * @param  {string} str
 * @param  {Object} icons
 *
 * @return {string}
 */

export function insertfontSmiley(str, icons) {
	var words = str.split(' ');
	// 
	return words.join(' ');
}

/**
 * FUNCTION insertEmoji
 *
 * @description
 * Converts text into emojis
 *
 * @param  {string} str
 * @param  {RegExp} emojiPattern
 *
 * @return {string}
 */

export function insertEmoji(str, emojiPattern) {
	return str.replace(emojiPattern, function (match, text) {
		return "<i class='emoticon emoticon-" + text + "' title=':" + text + ":'></i>";
	});
}

/**
 * FUNCTION UrlEmbed
 * @description
 * Converts normal links written in the text into html anchor tags.
 *
 * @param  {string} str
 * @param  {string} linkTarget
 * @param  {RegExp} urlPattern
 * @param  {RegExp} protocolPattern
 *
 * @return {string}
 */

export function urlEmbed(str, linkTarget, urlPattern, protocolPattern) {
	return str.replace(urlPattern, function (text) {
		var url = text;
		if (!protocolPattern.test(text)) {
			url = getHttpProtocol() + '//' + text;
		}

		if (linkTarget == 'cordova') {
			return '<a href="#" onclick="window.open(\'' + url + '\', \'_system\', \'location=yes\')" >' + text + '</a>';
		}
		else {
			return '<a href="' + url + '" target="' + linkTarget + '">' + text + '</a>';
		}
	}
	);
}

/**
 * FUNCTION sanitizeHtml
 *
 * @description
 * Converts <, >, & to html entities
 *
 * @param  {string} str
 *
 * @return {string}
 */
export function sanitizeHtml(str) {
	var map = { '&': '&amp;', '>': '&gt;', '<': '&lt;' };
	return str.replace(/[&<>]/g, function (m) {
		return map[m];
	});
}

/**
 * FUNCTION htmlEncode
 *
 * @description
 * Converts html entities for <, >, & to characters
 *
 * @param  {string} str
 *
 * @return {string}
 */
export function htmlEncode(str) {
	var map = { '&amp;': '&', '&gt;': '>', '&lt;': '<' };
	return str.replace(/&(amp|gt|lt);/g, function (m) {
		return map[m];
	});
}

/**
 * FUNCTION trimSpace
 *
 * removes whitespace characters
 * @param  {string} str The string from which the whitespace has to be removed
 * @return {string}
 */
export function trimSpace(str) {
	var trimmed = str.replace(/^([ \t]*)/g, ''); // leading whitespace
	trimmed = trimmed.replace(/[ \t]*$/g, ''); // trailing whitespace
	return trimmed;
}

/**
 * FUNCTION getHttpProtocol
 *
 * Get https: if host is running https or http: otherwise
 * @returns string
 */
export function getHttpProtocol() {
	return window.location.protocol.match(/https/) ? 'https:' : 'http:';
}

export function processEmbed(input, options = NG_EMBED_DEFAULT_OPTIONS) {

	// clear scope
	let scope = {
		video: {
			basic: '',
			embedSrc: '',
			url: '',
			host: '',
			id: ''
		},
		videoServices: []

	};
	// make sure that input is string
	if (!(typeof input === 'string') || input.length === 0) {
		input = ' ';
	}
	let x = input;
	var httpProtocol = getHttpProtocol();

	const videoProcess = {
		calcDimensions: function (options) {
			var dimensions = {
				'width': null,
				'height': null
			};
			dimensions.width = options.video.width;
			dimensions.height = options.video.height;

			if (options.video.height && options.video.width) {
				return dimensions;
			}
			else if (options.video.height) {
				dimensions.width = ((options.video.height) / 390) * 640;
				return dimensions;
			}
			else if (options.video.width) {
				dimensions.height = ((dimensions.width) / 640) * 390;
				return dimensions;
			}
			else {
				dimensions.width = 640;
				dimensions.height = 390;
				return dimensions;
			}
		},
		getRequestConfig: function () {
			// clear existing headers if present for this http request
			return {
				headers: {
					'Authorization': undefined
				}
			};
		},

		youtubeEmbed: function (data, options) {
			var video;

			if (data.match(NG_EMBED_REGEXP_PATTERNS.youtube)) {
				var dimensions = videoProcess.calcDimensions(options);

				video = {
					id: RegExp.$1,
					host: 'youtube',
					width: dimensions.width,
					height: dimensions.height
				};

				video.url = `https://www.youtube.com/watch?v=${video.id}`;
				video.embedSrc = `https://www.youtube.com/embed/${video.id}`;
			}

			return video;
		},

		vimeoEmbed: function (data, options) {
			let video;
			if (data.match(NG_EMBED_REGEXP_PATTERNS.vimeo)) {
				let dimensions = videoProcess.calcDimensions(options);

				video = {
					id: RegExp.$3,
					host: 'vimeo',
					width: dimensions.width,
					height: dimensions.height
				};

				video.embedSrc = '//player.vimeo.com/video/' + video.id + '?title=0&byline=0&portrait=0';

			}

			return video;
		},

		dailymotionEmbed: function (str, opts) {

			// http://dai.ly/x4xeuef
			const matches = str.match(NG_EMBED_REGEXP_PATTERNS.dailymotion);
			if (matches) {
				const uniqueMatches = getUniqueArray(matches);
				const videoDimensions = videoProcess.calcDimensions(opts);
				uniqueMatches.forEach(function (match) {
					if (match.split('/')[2]) {
						const src = `${httpProtocol}//www.dailymotion.com/embed/video/${match.split('/')[2]}`;
						scope.video.embedSrc = src;
						const frame = `<iframe src="${src}"></iframe>`;
						scope.videoServices.push(frame);
					}

				});
			}
			return scope;
		},

		embed: function (data, options) {
			// show only youtube video if both vimeo and youtube videos are present.
			return videoProcess.youtubeEmbed(data, options)
		},

		embedBasic: function (data) {
			if (data.match(NG_EMBED_REGEXP_PATTERNS.basicVideo)) {
				scope.video.basic = RegExp.$1;
			}

			return data;
		}
	};

	scope.video = videoProcess.embed(x, options);

	// scope.video = options.vimeoEmbed ? videoProcess.vimeoEmbed(x, options) : scope.video;

	return scope;
}
