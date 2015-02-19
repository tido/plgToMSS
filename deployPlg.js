#!/usr/bin/env node
'use strict';

function main() {
  var fs = require('fs-extra');
  var path = require('path');

  var configFile = path.join(process.cwd(), 'plgconfig');
  var config = require(configFile);

  var pluginFiles = pluginFileNames && pluginFileNames.length
    ? pluginFileNames
    : config.pluginFilename
      ? [config.pluginFilename]
      : fs.readdirSync(config.buildDir)
          .filter(function(filename) {return filename.match(/\.plg$/);});

  var destDirectory = path.join(config.plgPath, config.plgCategory);
  fs.ensureDirSync(destDirectory);

  console.log('Deploying plugins to ' + destDirectory + '...' );
  pluginFiles.forEach(function(filename) {
    console.log(filename);

    fs.copySync(path.join(config.buildDir, filename), path.join(destDirectory, filename));
  });
  console.log('done');
}


main();
