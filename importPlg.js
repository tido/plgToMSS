#!/usr/bin/env node
'use strict';

function main(pluginFileNames) {
  var fs = require('fs-extra');
  var path = require('path');

  var configFile = path.join(process.cwd(), 'plgconfig');
  var config = require(configFile);

  var pluginDirectory = path.join(config.plgPath, config.plgCategory);
  var pluginFiles = pluginFileNames && pluginFileNames.length
    ? pluginFileNames
    : config.pluginFilename
      ? [config.pluginFilename]
      : fs.readdirSync(pluginDirectory)
        .filter(function(filename) {return filename.match(/\.plg$/);});

  var importDirectory = config.importDir;

  console.log('Importing plugins to ' + pluginDirectory + '...' );
  pluginFiles.forEach(function(filename) {
    console.log(filename);

    fs.copySync(path.join(pluginDirectory, filename), path.join(importDirectory, filename));
  });
  console.log('done');
}

main(process.argv.slice(2));




