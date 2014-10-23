var fs = require('fs');
var path = require('path');
var readline = require('readline');
var mkdirp = require('mkdirp');

function main(args) {

  var data = '';
  var level = 0;
  var globals = [];

  var functionRegex = /^\s+(\w+)\s+"(\(.*\))\s+{/;
  var endFunctionRegex = /^(.*)}"$/;

  var dialogRegex = /^\s*(\w+)\s+"Dialog"\s*$/;
  var startDialogSegmentRegex = /^\s*{/;
  var endDialogSegmentRegex = /^\s*}/;

  var filename = args[0];
  var outputdir = args[1];
  var encoding = args[2] || 'utf8';

  mkdirp.sync(outputdir);
  mkdirp.sync(path.join(outputdir, 'dialog'));

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
    console.log('Finished: written to ' + outputdir);
  });

  function writeGlobals() {
    fs.writeFileSync(path.join(outputdir, 'GLOBALS.mss'), globals.join('\n'), {encoding: 'utf8'});
  }

  function processLine(line) {
    var func = functionRegex.exec(line);
    if (func) {
      console.log('function ' + func[1] + func[2]);
      data = 'function ' + func[1] + func[2] + ' ' + '{\n';
      data += '//$module(' + func[1] + '.mss)\n';
      var filename = path.join(outputdir, func[1] + '.mss');
      processFn = processFunctionLineFunc(filename);
      return;
    }

    var dialog = dialogRegex.exec(line);
    if (dialog) {
      console.log('dialog ' + dialog[1]);
      data = line;
      data += '\n';
      var filename = path.join(outputdir, 'dialog', dialog[1] + '.msd');
      processFn = processDialogLineFunc(filename);
      return;
    }

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
        fs.writeFileSync(filename, data, {encoding: 'utf8'});
        processFn = processLine;
      }
    }
  }

  function processFunctionLineFunc(filename) {
    return function (line) {
      var isEndFunc = endFunctionRegex.exec(line);
      if (isEndFunc) {
        data += isEndFunc[1] + '\n}  //$end\n';
        fs.writeFileSync(filename, data, {encoding: 'utf8'});
        processFn = processLine;
      } else {
        data += line;
        data += '\n';
      }
    }
  }
}

main(process.argv.slice(2));
