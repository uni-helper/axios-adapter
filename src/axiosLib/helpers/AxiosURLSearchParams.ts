"use strict";

import toFormData from "./toFormData";

/**
 * It encodes a string by replacing all characters that are not in the unreserved set with
 * their percent-encoded equivalents
 *
 * @param {string} str - The string to encode.
 *
 * @returns {string} The encoded string.
 */
function encode(str: string) {
  const charMap: any = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\x00",
  };
  return encodeURIComponent(str).replace(
    /[!'()~]|%20|%00/g,
    function replacer(match) {
      return charMap[match];
    }
  );
}

/**
 * It takes a params object and converts it to a FormData object
 *
 * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
 * @param {Object<string, any>} options - The options object passed to the Axios constructor.
 *
 * @returns {void}
 */
function AxiosURLSearchParams(this: any, params: any, options: any) {
  this._pairs = [];

  params && toFormData(params, this, options);
}

const prototype = AxiosURLSearchParams.prototype;

prototype.append = function append(value: any) {
  this._pairs.push([name, value]);
};

prototype.toString = function toString(encoder: any) {
  const _encode = encoder
    ? (value: any) => {
        return encoder.call(this, value, encode);
      }
    : encode;

  return this._pairs
    .map(function each(pair: string[]) {
      return _encode(pair[0]) + "=" + _encode(pair[1]);
    }, "")
    .join("&");
};

export default AxiosURLSearchParams;
