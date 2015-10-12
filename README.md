[sibeditor]: https://github.com/tido/plgToMSS/blob/master/images/sib-plugineditor.jpg "Sibelius"
[sublime]: https://github.com/tido/plgToMSS/blob/master/images/sib-sublime.jpg "Sublime"
# plgToMSS

A set of node scripts to roundtrip Sibelius plugin development
between a sensible world (small text files, which can be edited,
in a tool of your choice, with nice syntax highlighting, and which
can be source-controlled separately) and the monolithic Sibelius .plg
file format.

If you're tired of struggling with developing in this world:

![Sibelius plugin editor][sibeditor]

And would like to be able to work like this:

![Sublime - editing ManuScript!][sublime]

Then plgToMSS is your friend!

NB Currently set up and documented for Mac deployment. If anyone out there
would like to fork and update for Windows, please be my guest!

## Install

Install node! http://nodejs.org/

Clone/pull the repo, then cd to the repo directory, and

```
$ sudo npm install -g
```

## Script summary

## initPlg
Run in an empty directory. Initialises the directory for plugin development, with the following
structure
```
<directory>
  /import          -- importPlg pulls the plugin file from your Sibelius installation into this directory
  /build           -- deployPlg deploys the plugin from here
  /src             -- directory for plugin source .mss files
  /test            -- directory for test files and resources
  plgconfig.js     -- project configuration file (see below)
```

## importPlg
```
importPlg [plugin file names]
```
Imports plugins from Sibelius plugin directory (specified in config) to the import directory. If file names are
passed on the command line, import those files, otherwise import the plugin identified in the config file. If none
is identified in the config file, this will import all plugins in the Sibelius plugin directory identified in 
the plgCategory field in your config file.

## parsePlg
```
parsePlg [<PLG path/file> <targetDirectory> | test | ]
```

Writes a .mss file for each function into targetDirectory, and a .msd file for each dialog into a dialog
subdirectory. Additionally writes GLOBAL.mss, which contains all global data definitions.

If no arguments are given, uses the configured importDir and pluginFilename from the config file as the source of the
import, and the configured srcDir for the output. If the single argument 'test' is given, uses the configured importDir
and the filename Test<pluginFilename> (concatenating 'Test' and the configured pluginFilename) as the source, and the
configured testDir for the output.

Changes the function declaration to Javascript style:
```javascript
function Initialize () {
    ...
}  //$end
```

Also adds end tags for round-tripping. If you're writing your plugin from scratch in your own editing environment,
don't forget to add these (and a newline after the final //$end, though your editor may automatically add that
for you).

To move or write several functions in a single file, add a module directive:

```javascript
function reverse (s) {
    //$module(util.mss)
    ...
}  //$end

function capitalize (s) {
    //$module(util.mss)
    ...
}  //$end
```

The parser will write both methods to the file 'util.mss', preserving the module directives. If this is absent, each
function is written to an individual file named after the function.

You can add subdirectories to the module paths, and correspondingly write code in subdirectories:

```javascript
function CreateProcessingContext () {
    //$module(context/Processing.mss)
    ...
}  //$end
```

## buildPlg
```
buildPlg [<directory> <output file> | test | ]
```

Inverse of parsePjg, which combines all the .mss/.msd files in the generated structure pointed to by
<directory> and writes an output file which can then be copied into the Sibelius plugins location. The
tool combines all .mss files in the named directory and all its subdirectories.

If no arguments are given, builds from the configured srcDir and writes to the configured plgFilename in the buildDir
directory. If the single argument 'test' is given, builds from the configured testDir and writes to
Test<plgFilename> in the buildDir.

If you have created the files outside of Sibelius, please ensure that functions close as in the example
above, with a close brace and a //$end directive, and if you want to round-trip development, add //$module() 
directives as described.

## deployPlg
```
deployPlg [plugin file names]
```
Deploys plugins from build directory (specified in config) to Sibelius. If file names are passed on the command
line, deploy those files, otherwise deploy the plugin identified in the config file, and additionally a plugin
named Test<pluginName> if one exists in the build directory . If none is identified in the config file, this will
deploy all plugins in the build directory.


## plgconfig.js
```javascript
var config = {
  plgPath: process.env.HOME + '/Library/Application Support/Avid/Sibelius 7.5/Plugins',
  plgCategory: 'User',
  pluginFilename: 'Template.plg',
  linkLibraries: ['Test.plg'],
  importDir: './import',
  buildDir: './build',
  srcDir: './src',
  testDir: './test',
  libDir:  './lib'
};

```
Field names should be self-explanatory. pluginFilename can be deleted if wished. You will likely need to edit it
to refer to the plugins directory for your Sibelius installation. linkLibraries is a list of plugins to copy from
a shared library directory (identified by libDir) when deployPlg is run.

## Unit testing
You'll find a unit testing framework for ManuScript at [sib-test](https://github.com/tido/sib-test)
