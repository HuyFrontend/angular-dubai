import { getRandomInt } from './number.utils';

export const EMBED_REGEXP_PATTERNS = {
  dailymotion: /dailymotion.com\/embed\/video+\/([0-9A-Za-z-_]+)|dailymotion.com\/video\/([0-9A-Za-z-_]+)/gi,
  vimeo: /vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)*/gi,
  youtube: /(?:[0-9A-Za-z-_]+\.)?(youtu\.be\/|youtube\.com)(\/(embed)\/|\/(watch)\?v=|\/(channel)\/)([0-9A-Za-z-_]+)+(\&list=([0-9A-Za-z-_]+))?/gi,
  twitter: /class="twitter-(tweet|video|timeline)+(.)+href="https:\/\/twitter.com\/[0-9A-Za-z-_]+/gi,
  facebook: /https%3A%2F%2Fwww.facebook.com%2F([0-9A-Za-z-_\.]+)%2F(posts|videos)%2F([0-9A-Za-z-_]+)((%2F|%3F)+comment_id%3D([0-9A-Za-z-_]+)+)?/gi,
  instagram: /<blockquote(.)+href=\"https:\/\/www.instagram.com\/p\/([0-9A-Za-z-_]+)\/\"(.)+<\/blockquote>/gi
};

export const EMBED_TYPE = {
  dailymotion: 'dailymotion',
  vimeo: 'vimeo',
  youtube: 'youtube',
  twitter: 'twitter',
  facebook: 'facebook',
  instagram: 'instagram',
};

/**
 *
 * Call to check if the embed code is from the 6 known sources or not
 *
 * @export
 * @param {string} embedCode embed code can be either iframe, blockquote or video link (youtube, vimeo, dailymotion)
 * @returns {{isValidatedSource: boolean, source: string}} isValidatedSource: true if the embed code is from the 6 known sources (dailymotion, vimeo, youtube, twitter, facebook, instagram), sourceName: the source name of embed code
 */
export function isKnownEmbedCode(embedCode: string): {isValidatedSource: boolean, sourceName: string} {
  let socialPlatform: string = '',
      code = {
        isValidatedSource: false,
        sourceName: ''
      };

  Object.keys(EMBED_TYPE).map(key => {
    socialPlatform = EMBED_TYPE[key];
    if (isEmbedCodeFrom(socialPlatform, embedCode)) {
      code.isValidatedSource = true;
      code.sourceName = socialPlatform;
      return;
    }
  });

  return code;
}

/**
 * Call to check if embed code is from the correct social platform
 *
 * @param {string} socialPlatform name of social platform, can be either dailymotion, vimeo, youtube, twitter, facebook, instagram
 * @param {string} embedCode embed code, can be either link to video, iframe or blockquote
 * @returns {Boolean} true if the embed code is from the correct social platform
 * @memberof EmbeddedParagraphComponent
 */
export function isEmbedCodeFrom(socialPlatform: string, embedCode: string): Boolean {
  if (EMBED_REGEXP_PATTERNS[socialPlatform]) {
    //console.log(embedCode, embedCode.match(EMBED_REGEXP_PATTERNS[socialPlatform]))
    if (embedCode.match(EMBED_REGEXP_PATTERNS[socialPlatform])) {
      return true;
    }
  }

  return false;
}

export function processEmbedCodeFrom(embedCode: string, socialPlatform: string): any {
  let iframeObject: any = {};

  switch (socialPlatform) {
    case EMBED_TYPE.dailymotion:
      iframeObject = processDailyMotionEmbed(embedCode);
      break;

    case EMBED_TYPE.facebook:
      iframeObject = processFacebookEmbed(embedCode);
      break;

    case EMBED_TYPE.instagram:
      iframeObject = processInstagramEmbed(embedCode);
      break;

    case EMBED_TYPE.twitter:
      iframeObject = processTwitterEmbed(embedCode);
      break;

    case EMBED_TYPE.vimeo:
      iframeObject = processVimeoEmbed(embedCode);
      break;

    case EMBED_TYPE.youtube:
      iframeObject = processYoutubeEmbed(embedCode);
      break;
  }

  return iframeObject;
}

export function processYoutubeEmbed(embedCode: string = '', defaultWidth: string | number = '100%', defaultHeight: string | number = '100%') {
  let contentId = RegExp.$6,
      contentType = RegExp.$2,
      playlistId = RegExp.$8,
      video: any = {
        host: 'youtube',
      };

  if (embedCode.match(/width="([0-9]+)"/gi)) {
    video.width = RegExp.$1;
  } else {
    video.width = defaultWidth;
  }

  if (embedCode.match(/height="([0-9]+)"/gi)) {
    video.height = RegExp.$1;
  } else {
    video.height = defaultHeight;
  }

  if (contentType.indexOf('embed') > 0) {
    // video
    video.id = contentId;
    video.url = `https://www.youtube.com/watch?v=${contentId}`;
    video.embedSrc = `https://www.youtube.com/embed/${contentId}`;
    video.codeSnippet = `<iframe width="${video.width}" height="${video.height}" src="${video.embedSrc}" frameborder="0"></iframe>`;
  } else if (contentType.indexOf('watch') > 0) {
    if (playlistId) {
      // playlist
      video.id = contentId;
      video.playslistId = playlistId;
      video.url = `https://www.youtube.com/watch?v=${video.id}&list=${video.playslistId}`;
      video.embedSrc = `https://www.youtube.com/embed?listType=playlist&v=${video.id}&list=${video.playslistId}`;
      video.codeSnippet = `<iframe width="${video.width}" height="${video.height}" src="${video.embedSrc}" frameborder="0"></iframe>`;
    } else {
      // video
      video.id = contentId;
      video.url = `https://www.youtube.com/watch?v=${contentId}`;
      video.embedSrc = `https://www.youtube.com/embed/${contentId}`;
      video.codeSnippet = `<iframe width="${video.width}" height="${video.height}" src="${video.embedSrc}" frameborder="0"></iframe>`;
    }
  }

  return video;
}

export function processFacebookEmbed(embedCode: string = '') {
  let commentId = RegExp.$6,
      facebook: any = {
        host: 'facebook',
        authorUniqueName: RegExp.$1,
        contentType: RegExp.$2,
        contentUuid: RegExp.$3
      };

  if (embedCode.match(/width="([0-9]+)"/gi)) {
    facebook.width = RegExp.$1;
  } else {
    facebook.width = 493;
  }

  if (embedCode.match(/height="([0-9]+)"/gi)) {
    facebook.height = RegExp.$1;
  } else {
    facebook.height = 278;
  }

  facebook.embedSrc = facebook.codeSnippet = '';
  if (facebook.contentType === 'posts') {
    if (!commentId) {
      facebook.codeSnippet = `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2F${facebook.authorUniqueName}%2Fposts%2F${facebook.contentUuid}&width=${facebook.width}"
                              width="${facebook.width}" height="${facebook.height}"
                              style="border:none; overflow:hidden;" data-width="${facebook.width}"
                              scrolling="no" frameborder="0" allowTransparency="true"></iframe>`;
      facebook.embedSrc = `https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2F${facebook.authorUniqueName}%2Fposts%2F${facebook.contentUuid}&width=${facebook.width}`;
    }
  } else if (facebook.contentType === 'videos') {
    if (!commentId) {
      facebook.codeSnippet = `<iframe src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F${facebook.authorUniqueName}%2Fvideos%2F${facebook.contentUuid}%2F&show_text=0&width=${facebook.width}"
                              width="${facebook.width}" height="${facebook.height}"
                              style="border:none; overflow:hidden;"
                              scrolling="no" frameborder="0" allowTransparency="true" allowFullScreen="true"></iframe>`;
      facebook.embedSrc = `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F${facebook.authorUniqueName}%2Fvideos%2F${facebook.contentUuid}%2F&show_text=0&width=${facebook.width}`;
    }
  }

  return facebook;
}

export function processVimeoEmbed(embedCode: string = '') {
  let vimeo: any = {
    id: RegExp.$3,
    host: 'vimeo',
  };

  if (embedCode.match(/width="([0-9]+)"/gi)) {
    vimeo.width = RegExp.$1;
  } else {
    vimeo.width = 493;
  }

  if (embedCode.match(/height="([0-9]+)"/gi)) {
    vimeo.height = RegExp.$1;
  } else {
    vimeo.height = 278;
  }

  vimeo.url = `https://vimeo.com/${vimeo.id}`;
  vimeo.embedSrc = `https://player.vimeo.com/video/${vimeo.id}`;
  vimeo.codeSnippet = `<iframe width="${vimeo.width}" height="${vimeo.height}" src="${vimeo.embedSrc}" frameborder="0"></iframe>`;

  return vimeo;
}

export function processDailyMotionEmbed(embedCode: string = '') {
  let dailymotion: any = {
    id: RegExp.$2,
    host: 'dailymotion'
  };

  if (embedCode.match(/width="([0-9]+)"/gi)) {
    dailymotion.width = RegExp.$1;
  } else {
    dailymotion.width = 493;
  }

  if (embedCode.match(/height="([0-9]+)"/gi)) {
    dailymotion.height = RegExp.$1;
  } else {
    dailymotion.height = 278;
  }

  dailymotion.url = `https://www.dailymotion.com/video/${dailymotion.id}`;
  dailymotion.embedSrc = `https://www.dailymotion.com/embed/video/${dailymotion.id}`;
  dailymotion.codeSnippet = `<iframe width="${dailymotion.width}" height="${dailymotion.height}" src="${dailymotion.embedSrc}" frameborder="0"></iframe>`;

  return dailymotion;
}

export function processInstagramEmbed(embedCode: string = '') {
  let instagram: any = {
    host: 'instagram',
    scriptId: RegExp.$2,
    codeSnippet: embedCode
  };

  const regExpStr = /(<script(.)*src="([0-9A-Za-z-_\/\:\.]+)"(.)*><\/script>)/gi;

  if (instagram.codeSnippet.match(regExpStr)) {
    instagram.scriptUrl = RegExp.$3;
    instagram.codeSnippet = instagram.codeSnippet.replace(RegExp.$1, '');
  }

  return instagram;
}

export function processTwitterEmbed(embedCode: string = '') {
  let twitter: any = {
    host: 'twitter',
    codeSnippet: embedCode,
    scriptId: 'twitter-wj'
  };

  const regrexForTweet = /<blockquote(.)+class="twitter-(tweet|video|timeline)+(.)+href="https:\/\/twitter.com\/([0-9A-Za-z-_]+)\/status\/([0-9A-Za-z-_]+)/gi,
        regrexForTimeline = /<a(.)+class="twitter-timeline+(.)+href="https:\/\/twitter.com\/([0-9A-Za-z-_]+)/gi,
        regrexForFollow = /<a(.)+href="https:\/\/twitter.com\/([0-9A-Za-z-_]+)(.)+class="twitter-follow-button+(.)+/gi,
        regrexForMention = /<a(.)+href="https:\/\/twitter.com\/intent\/tweet\?screen_name=([0-9A-Za-z-_]+)(.)+class="twitter-mention-button+(.)+/gi,
        regExpStr = /(<script(.)+src="([0-9A-Za-z-_\/\:\.]+)"(.)+><\/script>)/gi,
        randomNumber = getRandomInt();

  if (embedCode.match(regrexForTweet)) {
    twitter.tweetType = 'tweet';
    twitter.author = RegExp.$4;
    twitter.tweetId = RegExp.$5;
    twitter.embedContainerId = 'tweet-container-' + twitter.tweetId + '-' + randomNumber;
  } else if (embedCode.match(regrexForTimeline)) {
    twitter.tweetType = 'tweet-timeline';
    twitter.author = RegExp.$3;
    twitter.embedContainerId = 'tweet-container-' + twitter.author + '-' + randomNumber;
  } else if (embedCode.match(regrexForFollow)) {
    twitter.tweetType = 'tweet-follow';
    twitter.author = RegExp.$2;
    twitter.embedContainerId = 'tweet-container-' + twitter.author + '-' + randomNumber;
  } else if (embedCode.match(regrexForMention)) {
    twitter.tweetType = 'tweet-mention';
    twitter.author = RegExp.$2;
    twitter.embedContainerId = 'tweet-container-' + twitter.author + '-' + randomNumber;
  }

  if (embedCode.match(regExpStr)) {
    twitter.scriptUrl = RegExp.$3;
    twitter.codeSnippet = twitter.codeSnippet.replace(RegExp.$1, '');
  }

  return twitter;
}
