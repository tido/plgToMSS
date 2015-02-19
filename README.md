# plgToMSS

A set of node scripts to roundtrip Sibelius plugin development
between a sensible world (small text files, which can be edited,
in a tool of your choice, with nice syntax highlighting, and which
can be source-controlled separately) and the monolithic Sibelius .plg
file format.

NB Currently set up and documented for Mac deployment. If anyone out there
would like to form and update for Windows, please be my guest!

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
is identified in the config file, this will import all plugins in the Sibelius plugin directory.

## parsePlg
```
parsePlg <PLG path/file> <targetDirectory>
```

Writes a .mss file for each function into targetDirectory, and a .msd file for each dialog into a dialog
subdirectory. Additionally writes GLOBAL.mss, which contains all global data definitions

Changes the function declaration to Javascript style
```javascript
function Initialize () {
    ...
}  //$end
```

Adds end tags for round-tripping

To move or write several functions in a single file, add a module directive

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

The parser will write both methods to the file 'util.mss', preserving the module directives.

## buildPlg
```
buildPlg <directory> <output file>
```

Inverse of parsePjg, which combines all the .mss/.msd files in the generated structure pointed to by
<directory> and writes an output file which can then be copied into the Sibelius plugins location

If you have created the files outside of Sibelius, please ensure that functions close as in the example
above, with a close brace and a //$end directive.

## deployPlg
```
deployPlg [plugin file names]
```
Deploys plugins from build directory (specified in config) to Sibelius. If file names are passed on the command
line, deploy those files, otherwise deploy the plugin identified in the config file. If none is identified in the
config file, this will deploy all plugins in the build directory.

## plgconfig.js
```javascript
var config = {
  plgPath: process.env.HOME + '/Library/Application Support/Avid/Sibelius 7.5/Plugins',
  plgCategory: 'User',
  pluginFilename: 'Template.plg',
  importDir: './import',
  buildDir: './build',
  srcDir: './src',
  testDir: './test'
};

```
Field names should be self-explanatory. pluginFilename can be deleted if wished. You will likely need to edit it
to refer to the plugins directory for your Sibelius installation.
