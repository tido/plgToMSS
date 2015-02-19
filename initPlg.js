#!/usr/bin/env node
'use strict';

function main() {
  var fs = require('fs-extra');
  var path = require('path');

  var cwd = process.cwd();

  var configFile = path.join(cwd, 'plgconfig.js');
  var configTemplate = path.join(__dirname, 'template/plgconfig.js');

  fs.copySync(configTemplate, configFile);
  var config = require(configFile);

  fs.ensureDirSync(config.importDir);
  fs.ensureDirSync(config.buildDir);
  fs.ensureDirSync(config.srcDir);
  fs.ensureDirSync(config.testDir);

  console.log('Initialised %s for plugin development!', cwd);
  console.log('Sources in %s', config.srcDir);
  console.log('Built plugins in %s', config.buildDir);

  if (!fs.existsSync(config.plgPath)) {
    console.log('Now edit plgconfig.js and change plgPath to the install location of Sibelius plugins')
  } else {
    console.log('Sibelius plugins will be installed to %s', config.plgPath);
  }

  console.log('Edit plgconfig.js to change paths, plugin and category name...');
  console.log('Tools available: ');
  console.log('  initPlg     Sets up directories and template for plugin development');
  console.log('  importPlg   Copies plugins from Sibelius to local import directory');
  console.log('  parsePlg    Splits plugin into separate function, globals and dialog .MSS files');
  console.log('  buildPlg    Combines separate .MSS files into single .plg for deployment');
  console.log('  deployPlg   Deploys plugin from build directory to Sibelius');
}


main();