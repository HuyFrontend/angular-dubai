import { ENTITIES } from './constant';

/**
 * Return true if the string is solely composed of whitespace or is null/undefined.
 * E.g: ' '.isEmpty(); // => true
 */
String.prototype.isEmpty = function(): boolean {
  return this === null || this === undefined ? true : /^[\s\xa0]*$/.test(this);
};

/**
 * Remove all html tags from a string
 * E.g: '<a>Click here</a>'.stripHtmlTags(); // => 'Click here'
 */
String.prototype.stripHtmlTags = function(): string {
  return this.replace(/<[^>]*>/g, '');
};

/**
 * Truncates the string, accounting for word placement and character count.
 * E.g: 'this is some long text'.truncate(9) // => 'this is...'
 */
String.prototype.truncate = function(maxChars: number, keepFullWords: boolean = true, appendText: string = '...'): string {
  maxChars = keepFullWords ? maxChars + 1 : maxChars;

  let str: string = this.slice().trim();
  if (str.length <= maxChars ){
    return str;
  }
  str = str.substr(0, maxChars - appendText.length);
  //crop at last space or remove trailing whitespace
  str = keepFullWords ? str.substr(0, str.lastIndexOf(' ')) : str.trim();
  return str + appendText;
};

/**
 * Extracts a string between left and right strings.
 * '<a>foo</a>'.extractBetween('<a>', '</a>') // => 'foo'
 */
String.prototype.extractBetween = function(leftStr: string, rightStr: string): string {
  let str: string = this.slice(0),
      startPos = str.indexOf(leftStr),
      endPos = str.indexOf(rightStr, startPos + leftStr.length);

  if (endPos === -1 && rightStr !== null) {
    return '';
  } else if (endPos === -1 && rightStr === null) {
    return str.substring(startPos + leftStr.length);
  } else {
    return str.slice(startPos + leftStr.length, endPos);
  }
};

/**
 * Removes prefix from start of string.
 * E.g: 'foobar'.chopLeft('foo'); // => 'bar'
 */
String.prototype.chopLeft = function(prefix: string): string {
  let str: string = this.slice(0);

  if (str.indexOf(prefix) === 0) {
    str = str.slice(prefix.length);
  }

  return str;
};

/**
 * Removes suffix from end of string.
 * E.g: 'foobar'.chopRight('bar'); // => 'foo'
 */
String.prototype.chopRight = function(suffix: string): string {
  let str: string = this.slice(0);

  if (str.endsWith(suffix)) {
    str = str.slice(0, str.length - suffix.length);
  }

  return str;
};

/**
 * Returns true if the string ends with suffix.
 * E.g: 'hello jon'.endsWith('jon'); // => true
 */
String.prototype.endsWith = function(suffix: string): boolean {
  let str: string = this.slice(0),
      index: number = str.lastIndexOf(suffix);

  if (index >= 0 && index === (str.length - suffix.length)) {
    return true;
  }

  return false;
};

/**
 * Returns the count of the number of occurrences of the substring.
 * E.g: 'JP likes to program. JP does not play in the NBA.'.countOccurrence('JP'); // => 2
 */
String.prototype.countOccurrence = function(searchPattern: string): number {
  let str: string = this.slice(0),
      occurrence: number = 0,
      pos: number = str.indexOf(searchPattern),
      searchPatternLength: number = searchPattern.length;

  while (pos >= 0) {
    occurrence += 1;
    pos = str.indexOf(searchPattern, pos + searchPatternLength)
  }

  return occurrence;
};

/**
 * Decodes HTML entities into their string representation.
 * E.g: 'Ken Thompson &amp; Dennis Ritchie'.decodeHTMLEntities(); // => 'Ken Thompson & Dennis Ritchie'
 */
String.prototype.decodeHtmlEntities = function(): string {
  let str = this.slice(0);

  str = str.replace(/&#(\d+);?/g, function (_, code) {
    return String.fromCharCode(code);
  })
  .replace(/&#[xX]([A-Fa-f0-9]+);?/g, function (_, hex) {
    return String.fromCharCode(parseInt(hex, 16));
  })
  .replace(/&([^;\W]+;?)/g, function (m, e) {
    let ee = e.replace(/;$/, ''),
        target = ENTITIES[e] || (e.match(/;$/) && ENTITIES[ee]);

    if (typeof target === 'number') {
      return String.fromCharCode(target);
    } else if (typeof target === 'string') {
      return target;
    } else {
      return m;
    }
  })

  return str;
};

/**
 * Return the new string with all occurrences of searchStr replaced with replaceStr.
 * E.g: ' does IT work? '.replaceAll(' ', '_'); // => '_does_IT_work?_'
 */
String.prototype.replaceAll = function(searchStr: string, replaceStr: string): string {
  return this.slice(0).split(searchStr).join(replaceStr);
};

/**
 * Returns a new string with all occurrences of [string1],[string2],... removed.
 * E.g: ' 1 2 3--__--4 5 6-7__8__9--0'.strip(' ', '_', '-'); // => '1234567890'
 */
String.prototype.strip = function(...args): string {
  let str: string = this.slice(0),
      i = 0,
      l = arguments.length;

      for (i= 0; i < l; i++) {
    str = str.split(arguments[i]).join('');
  }

  return str;
};

/**
 * Check if a string is in correct color code format. e.g: #fff or #ffffff
 */
String.prototype.isColorCode = function(): boolean {
  return /^[0-9A-F]{6}$/i.test(this);
};
