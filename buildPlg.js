#!/usr/bin/env node

'use strict';

var readline = require('readline');
var async = require('async');
var gumyen = require('gumyen');

var writeUTF16 = require('./util').writeUTF16;

function main(args) {
  var fs = require('fs-extra');
  var path = require('path');
  var config = require(path.join(process.cwd(), 'plgconfig'));

  var directory;
  var pluginFilename;

  if (args.length === 0) {
    directory = config.srcDir;
    pluginFilename = config.pluginFilename;
  } else if (args.length === 1 && args[0] === 'test') {
    directory = config.testDir;
    pluginFilename = 'Test' + config.pluginFilename;
  } else {
    directory = args[0];
    pluginFilename = args[1];
  }

  if (!directory || !pluginFilename) {
    console.log("Usage: buildPlg [directory plg-filename | test]" );
    console.log("No args - builds configured plugin" );
    console.log("Arg is 'test' - builds configured test plugin" );
    console.log("Plugin file is written to configured build directory");
    process.exit(1);
  }

  var dir = fs.readdirSync(directory);

  var output = '{\n';

  var globals = path.join(directory, 'GLOBALS.mss');
  var dialogDirectory = path.join(directory, 'dialog');
  var dialogsDir = [];

  try {
    dialogsDir = fs.readdirSync(dialogDirectory);
  } catch (e) {
    // NOP
  }

  var funcRegex = /function\s*([_a-zA-Z][_a-zA-Z0-9\$]*)\s*(\(.*\))\s*\{?/;
  var moduleLineRegex = /^\s*\/\/\$module\(([\w]+\.mss)\)/;

  try {
    addFileToOutput(globals);
  } catch (e) {
    // NOP
  }

  dialogsDir
    .filter(function(name) { return name.match(/.+\.msd$/)})
    .forEach(function(name) { addFileToOutput(path.join(dialogDirectory, name))});

  dir = dir.filter(function(name) { return name.match(/.+\.mss$/)});

  async.each(dir, function(name, cb) { addMethodFileToOutput(path.join(directory, name), cb)}, end);

  function end() {
    output += '}\n';
    writeUTF16(path.join(config.buildDir, pluginFilename), output);
    console.log('written plugin code to ' + pluginFilename);
  }

  function addFileToOutput(mssFilename) {
    console.log(mssFilename);
    var data = gumyen.readFileWithDetectedEncodingSync(mssFilename);

    if (data.length) {
      output += data;
      output += '\n';
    }
  }

  function addMethodFileToOutput(mssFilename, cb) {
    console.log(mssFilename);
    var encoding = gumyen.encodingSync(mssFilename);
    var proposedModuleName = path.basename(mssFilename, '.mss');

    var head = '';
    var moduleName = '';
    var module = '';
    var body = '';
    var rd = readline.createInterface({
      input: fs.createReadStream(mssFilename, {encoding: encoding}),
      output: process.stdout,
      terminal: false
    });

    rd.on('line', function(line) {
      var func = funcRegex.exec(line);
      if (func) {
        var mssFuncLine = '\t' + func[1] + ' "' + func[2] + ' {\n';
        console.log('function: ' + func[1]);
        head = mssFuncLine;
        if (func[1] !== proposedModuleName) {
          module = '//$module(' + proposedModuleName + '.mss)\n'
        }
      } else if(line.match(/^}\s*\/\/\$end$/)) {
        body = body + '}"\n';
        output += head;
        if (module.length) output += module;
        output += body;
        output += '\n';
        head = module = body = '';
      } else if (moduleName = moduleLineRegex.exec(line)) {
        module = '//$module(' + moduleName[1] + ')\n'
      } else {
        body += line;
        body += '\n';
      }
    });

    rd.on('close', function() {
      cb(false);
    });
  }
}

main(process.argv.slice(2));
