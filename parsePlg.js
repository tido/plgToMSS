#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var readline = require('readline');
var mkdirp = require('mkdirp');
var gumyen = require('gumyen');

var writeUTF16 = require('./util').writeUTF16;

function main(args) {
  var fs = require('fs-extra');
  var path = require('path');
  var config = require(path.join(process.cwd(), 'plgconfig'));

  var directory;
  var filename;

  if (args.length === 0) {
    directory = config.srcDir;
    filename = config.pluginFilename;
  } else if (args.length === 1 && args[0] === 'test') {
    directory = config.testDir;
    filename = 'Test' + config.pluginFilename;
  } else {
    directory = args[0];
    filename = args[1];
  }


  if (!directory || !filename) {
    console.log("Usage: parsePlg [plugin-filename output-directory| test]" );
    console.log("No args - parses configured plugin" );
    console.log("Arg is 'test' - parses configured test plugin" );
    console.log("Plugin file must be in configured import directory");
    process.exit(1);
  }

  var data = '';
  var currentModule = '';
  var filesWritten = {};
  var level = 0;
  var globals = [];

  var functionRegex = /^\s*(\w+)\s+"(\(.*\))\s+\{/;
  var endFunctionRegex = /^(.*)}"$/;
  var moduleLineRegex = /^\s*\/\/\$module\(([\w.]+)\)/;

  var dialogRegex = /^\s*(\w+)\s+"Dialog"\s*$/;
  var startDialogSegmentRegex = /^\s*\{/;
  var endDialogSegmentRegex = /^\s*}/;

  filename = path.join(config.importDir, filename);

  mkdirp.sync(directory);
  mkdirp.sync(path.join(directory, 'dialog'));

  var encoding = gumyen.encodingSync(filename);
  console.log('Processing: %s (%s)', filename, encoding);

  var rd = readline.createInterface({
    input: fs.createReadStream(filename, {encoding: encoding}),
    output: process.stdout,
    terminal: false
  });

  var processFn = processLine;

  var n = 0;
  rd.on('line', function(line) {
    processFn(line);
  });

  rd.on('close', function() {
    writeGlobals();
    console.log('Finished: written to ' + directory);
  });

  function writeGlobals() {
    writeUTF16(path.join(directory, 'GLOBALS.mss'), globals.join('\n'));
  }

  function processLine(line) {
    var func = functionRegex.exec(line);
    if (func) {
      console.log('function ' + func[1] + func[2]);
      data = 'function ' + func[1] + func[2] + ' ' + '{\n';
      var filename = path.join(directory, func[1] + '.mss');
      processFn = processFunctionLineFunc(filename);
      return;
    }

    var dialog = dialogRegex.exec(line);
    if (dialog) {
      console.log('dialog ' + dialog[1]);
      data = line;
      data += '\n';
      processFn = processDialogLineFunc(path.join(directory, 'dialog', dialog[1] + '.msd'));
      return;
    }

    if (line[0] === '\uffef' || line[0] === '\uffef') {
      line = line.substring(1);
    }
    line == line.trim();

    if (line !== '}' && line !== '{' && line !== '\ufeff' && line !== '\uffef' && line.length > 0) {
      globals.push(line);
    }
  }

  function processDialogLineFunc(filename) {
    return function (line) {
      if (startDialogSegmentRegex.exec(line)) level++;
      if (endDialogSegmentRegex.exec(line)) level--;

      data += line;
      data += '\n';
      if (level === 0) {
        writeUTF16(filename, data);
        processFn = processLine;
      }
    }
  }

  function processFunctionLineFunc(filename) {
    return function (line) {
      var isModuleLine = moduleLineRegex.exec(line);
      if (isModuleLine) {
        currentModule = path.join(directory, isModuleLine[1]);
        data += line;
        data += '\n';
        return;
      }

      var isEndFunc = endFunctionRegex.exec(line);
      if (isEndFunc) {
        var ending = isEndFunc[1];
        if (ending.length) {
          ending += '\n';
        }
        data += ending + '} //$end\n\n';
        if (currentModule) {
          var opts = {encoding: encoding};
          if (filesWritten[currentModule]) {
            opts.flag = 'a';
          }
          writeUTF16(currentModule, data, opts);
          filesWritten[currentModule] = true;
          currentModule = '';
        } else {
          console.log(filename);
          writeUTF16(filename, data);
          filesWritten[filename] = true;
        }
        processFn = processLine;
        return;
      }

      data += line;
      data += '\n';
    }
  }
}

main(process.argv.slice(2));
