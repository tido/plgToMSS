#!/usr/bin/env node
'use strict';

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
      fs.copySync(fileToCopy, path.join(destDirectory, filename));
    } else {
      console.log('library %s could not be copied', fileToCopy);
    }
  });
}

  console.log('done');
}

main(process.argv.slice(2));
