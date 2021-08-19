#!/usr/bin/env node
'use strict';

var BOM = '\ufeff';

/**
 * Distinguishes between utf8 and utf16le. Returns the encoding and the BOM, if
 * the latter is missing in the buffer and needs to be added.
 */
function guessEncoding(buffer) {
  // Check for BOM
  if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
    return ['utf16le', ''];
  }
  if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return ['utf8', ''];
  }

  // Check for null bytes that are typcial for utf16, assuming that PLG code
  // will not contain null bytes in utf8 encoding.
  if (buffer[1] === 0x00) {
    return ['utf16le', BOM];
  }

  return ['utf8', BOM];
}


function main(pluginFileNames) {
  var fs = require('fs-extra');
  var path = require('path');

  var configFile = path.join(process.cwd(), 'plgconfig');
  var config = require(configFile);

  var pluginFiles = pluginFileNames && pluginFileNames.length
    ? pluginFileNames
    : config.pluginFilename
      ? [config.pluginFilename, 'Test' + config.pluginFilename]
      : fs.readdirSync(config.buildDir)
          .filter(function(filename) {return filename.match(/\.plg$/);});

  var destDirectory = path.join(config.plgPath, config.plgCategory);
  fs.ensureDirSync(destDirectory);

  console.log('Deploying plugins to ' + destDirectory + '...' );
  pluginFiles.forEach(function(filename) {
    console.log(filename);

    var fileToCopy = path.join(config.buildDir, filename);
    if (fs.existsSync(fileToCopy)) {
      fs.copySync(fileToCopy, path.join(destDirectory, filename));
    } else {
      console.log('(%s not found)', fileToCopy);
    }
  });

  if (config.linkLibraries) {
    config.linkLibraries.forEach(function(filename) {
      console.log('copying linked library %s', filename);
      var fileToCopy = path.join(config.libDir, filename);
      if (fs.existsSync(fileToCopy)) {
        var destination = path.join(destDirectory, filename);
        if (fileToCopy.match(/\.plg$/)) {
          var buffer = fs.readFileSync(fileToCopy);
          var [encoding, bom] = guessEncoding(buffer);
          fs.writeFileSync(destination, bom + buffer.toString(encoding), 'utf16le');
        } else {
          fs.copySync(fileToCopy, destination);
        }
      } else {
        console.log('library %s could not be copied', fileToCopy);
      }
    });
  }

  console.log('done');
}

main(process.argv.slice(2));
