import pako from "pako";

let _nCode = -1;
const toString = {}.toString;

/**
 * Checks if the value exist in the array.
 * @param arr
 * @param v
 * @returns {boolean}
 */
function contains(arr, v) {
  let nIndex;
  const nLen = arr.length;
  for (nIndex = 0; nIndex < nLen; nIndex++) {
    if (arr[nIndex][1] === v) {
      return true;
    }
  }
  return false;
}

/**
 * Removes duplicated values in an array
 * @param oldArray
 * @returns {Array}
 */
function unique(oldArray) {
  let nIndex;
  const nLen = oldArray.length,
    aArr = [];
  for (nIndex = 0; nIndex < nLen; nIndex++) {
    if (!contains(aArr, oldArray[nIndex][1])) {
      aArr.push(oldArray[nIndex]);
    }
  }
  return aArr;
}

/**
 * Escapes a RegExp
 * @param text
 * @returns {*}
 */
function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Returns if the obj is an object or not.
 * @param obj
 * @returns {boolean}
 * @private
 */
function _isObject(obj) {
  return toString.call(obj) === "[object Object]";
}

/**
 * Returns if the obj is an array or not
 * @param obj
 * @returns {boolean}
 * @private
 */
function _isArray(obj) {
  return toString.call(obj) === "[object Array]";
}

/**
 * Converts a bidimensional array to object
 * @param aArr
 * @returns {{}}
 * @private
 */
function _biDimensionalArrayToObject(aArr) {
  const obj = {};
  let nIndex;
  const nLen = aArr.length;
  let oItem;
  for (nIndex = 0; nIndex < nLen; nIndex++) {
    oItem = aArr[nIndex];
    obj[oItem[0]] = oItem[1];
  }
  return obj;
}

/**
 * Convert a number to their ascii code/s.
 * @param index
 * @param totalChar
 * @param offset
 * @returns {Array}
 * @private
 */
function _numberToKey(index, totalChar, offset) {
  const sKeys =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=_!?()*",
    aArr = [];
  let currentChar = index;
  totalChar = totalChar || sKeys.length;
  offset = offset || 0;
  while (currentChar >= totalChar) {
    aArr.push(sKeys.charCodeAt((currentChar % totalChar) + offset));
    currentChar = Math.floor(currentChar / totalChar - 1);
  }
  aArr.push(sKeys.charCodeAt(currentChar + offset));
  return aArr.reverse();
}

/**
 * Returns the string using an array of ASCII values
 * @param aKeys
 * @returns {string}
 * @private
 */
function _getSpecialKey(aKeys) {
  return String.fromCharCode.apply(String, aKeys);
}

/**
 * Traverse all the objects looking for keys and set an array with the new keys
 * @param json
 * @param aKeys
 * @returns {*}
 * @private
 */
function _getKeys(json, aKeys) {
  let aKey, sKey, oItem;

  for (sKey in json) {
    if (json.hasOwnProperty(sKey)) {
      oItem = json[sKey];
      if (_isObject(oItem) || _isArray(oItem)) {
        aKeys = aKeys.concat(unique(_getKeys(oItem, aKeys)));
      }
      if (isNaN(Number(sKey))) {
        if (!contains(aKeys, sKey)) {
          _nCode += 1;
          aKey = [];
          aKey.push(_getSpecialKey(_numberToKey(_nCode)), sKey);
          aKeys.push(aKey);
        }
      }
    }
  }
  return aKeys;
}

/**
 * Method to compress array objects
 * @private
 * @param json
 * @param aKeys
 */
function _compressArray(json, aKeys) {
  const jsonArr = [];
  let nIndex, nLenKeys;

  for (nIndex = 0, nLenKeys = json.length; nIndex < nLenKeys; nIndex++) {
    jsonArr[nIndex] = compress(json[nIndex], aKeys);
  }

  return jsonArr;
}

/**
 * Method to compress anything but array
 * @private
 * @param json
 * @param aKeys
 * @returns {*}
 */
function _compressOther(json, aKeys) {
  let oKeys, aKey, str, nLenKeys, nIndex, obj;
  aKeys = _getKeys(json, aKeys);
  aKeys = unique(aKeys);
  oKeys = _biDimensionalArrayToObject(aKeys);

  str = JSON.stringify(json);
  nLenKeys = aKeys.length;

  for (nIndex = 0; nIndex < nLenKeys; nIndex++) {
    aKey = aKeys[nIndex];
    str = str.replace(
      new RegExp(escapeRegExp('"' + aKey[1] + '"'), "g"),
      '"' + aKey[0] + '"'
    );
  }
  obj = JSON.parse(str);
  obj._ = oKeys;
  return obj;
}

/**
 * Method to decompress array objects
 * @private
 * @param json
 */
function _decompressArray(json) {
  const jsonArr = [];
  let nIndex, nLenKeys;

  for (nIndex = 0, nLenKeys = json.length; nIndex < nLenKeys; nIndex++) {
    jsonArr[nIndex] = decompress(json[nIndex]);
  }

  return jsonArr;
}

/**
 * Method to decompress anything but array
 * @private
 * @param json
 * @returns {*}
 */
function _decompressOther(json) {
  let oKeys, str, sKey;

  oKeys = JSON.parse(JSON.stringify(json._));
  delete json._;
  str = JSON.stringify(json);
  for (sKey in oKeys) {
    if (oKeys.hasOwnProperty(sKey)) {
      str = str.replace(new RegExp('"' + sKey + '"', "g"), '"' + oKeys[sKey] + '"');
    }
  }
  return str;
}

/**
 * Compress a RAW JSON
 * @param json
 * @param optKeys
 * @returns {*}
 */
function compress(json, optKeys) {
  if (!optKeys) {
    _nCode = -1;
  }
  const aKeys = optKeys || [];
  let obj;

  if (_isArray(json)) {
    obj = _compressArray(json, aKeys);
  } else {
    obj = _compressOther(json, aKeys);
  }
  return obj;
}
/**
 * Use LZString to get the compressed string.
 * @param json
 * @param bCompress
 * @returns {String}
 */
function pack(json, bCompress) {
  const str = JSON.stringify(bCompress ? compress(json) : json);
  return pako.deflate(str, {to: "string"});
}
/**
 * Decompress a compressed JSON
 * @param json
 * @returns {*}
 */
function decompress(json) {
  const decompressed = _isArray(json)
    ? _decompressArray(json)
    : _decompressOther(json);
  return typeof decompressed === "string" ? JSON.parse(decompressed) : decompressed;
}

/**
 * Returns the JSON object from the LZW string
 * @param gzipped
 * @param bDecompress
 * @returns {Object}
 */
function unpack(gzipped, bDecompress) {
  const str = pako.inflate(gzipped, {to: "string"});
  const json = JSON.parse(str);
  return bDecompress ? decompress(json) : json;
}

export {compress, decompress, pack, unpack};
