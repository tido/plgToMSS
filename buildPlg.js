#!/usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');
var readline = require('readline');
var async = require('async');
var iconv=require('iconv-lite');
var e = require('gumyen');

var OUTPUT_ENCODING = 'utf16le';
var UTF16LE_BOM = [0xff, 0xfe];

function main(args) {
  var directory = args[0];
  var outputFileName = args[1];

  if (!directory || !outputFileName) {
    console.log("Usage: buildPlg directory plg-filename" );
    process.exit(1);
  }

  var dir = fs.readdirSync(directory);

  var output = '{\n';

  var globals = path.join(directory, 'GLOBALS.mss');
  var dialogDirectory = path.join(directory, 'dialog');

  var dialogsDir = fs.readdirSync(dialogDirectory);

  var funcRegex = /^function\s*(\w+)(\(.*\))\s*\{/;
  var moduleLineRegex = /^\s*\/\/\$module\(([\w]+\.mss)\)/;

  try {
    addFileToOutput(globals);
  } catch (e) {
    // NOP
  }

  dialogsDir
    .filter(function(name) { return name.match(/.+\.msd$/)})
    .forEach(function(name) { addFileToOutput(path.join(dialogDirectory, name))});

  dir = dir.filter(function(name) { return name.match(/[a-z].+\.mss$/)});

  async.each(dir, function(name, cb) { addMethodFileToOutput(path.join(directory, name), cb)}, end);

  function end() {
    output += '}\n';
    writeUTF16(outputFileName, output);
    console.log('written plugin code to ' + outputFileName);
  }

  function addFileToOutput(filename) {
    console.log(filename);
    var encoding = e.encodingSync(filename);
    var data = fs.readFileSync(filename, {encoding: encoding});

    if (data.length) {
      output += data;
      output += '\n';
    }
  }

  function addMethodFileToOutput(filename, cb) {
    console.log(filename);
    var encoding = e.encodingSync(filename);
    var proposedModuleName = path.basename(filename, '.mss');

    var head = '';
    var moduleName = '';
    var module = '';
    var body = '';
    var rd = readline.createInterface({
      input: fs.createReadStream(filename, {encoding: encoding}),
      output: process.stdout,
      terminal: false
    });

    rd.on('line', function(line) {
      var func = funcRegex.exec(line);
      if (func) {
        var mssFuncLine = func[1] + ' "' + func[2] + ' {\n';
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

function writeUTF16(filename, data, opts) {
  var buffer = iconv.encode(data, OUTPUT_ENCODING);
  fs.writeFileSync(filename, Buffer.concat([new Buffer(UTF16LE_BOM), buffer]), opts);
}

main(process.argv.slice(2));