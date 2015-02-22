'use strict';

var gumyen=require('gumyen');
var _ = require('lodash');

module.exports = {
  writeUTF16: writeUTF16
};

function writeUTF16(filename, data, opts) {
  var optDefaults = {encoding: 'utf16le', writeBOM: true};
  opts = opts ? _.merge({}, opts, optDefaults) : optDefaults;
  gumyen.writeFileSync(filename, data, opts);
}
