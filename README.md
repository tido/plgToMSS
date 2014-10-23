# plgToMSS

A pair of node scripts to roundtrip Sibelius plugin development
between a sensible world (small text files, which can be edited
in a world with nice syntax highlighting and source-controlled
separately) and the monolithic Sibelius .plg file format.

## Install
```
$ npm install
```

## parsePlg.js
```
node parsePlg.js <PLG path/file> <targetDirectory> <encoding>
```

Encoding is optional (defaults to utf8, for a plugin built and edited in Sibelius you'll likely need utf16le)

Writes a .mss file for each function into targetDirectory, and a .msd file for each dialog into a dialog subdirectory.

Writes GLOBAL.mss, which contains all global data definitions

Changes the function declaration to Javascript style
```javascript
function Initialize () {
//$module('Initialize.mss')
    ...
}  //$end
```

Adds module and end tags for roundtripping

## buildPlg
```
node buildPlg.js <directory> <output file>
```

Inverse of parsePjg, which combines all the .mss/.msd files in the generated structure pointed to by
<directory> and writes an output file which can then be copied into the Sibelius plugins location


