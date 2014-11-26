# plgToMSS

A pair of node scripts to roundtrip Sibelius plugin development
between a sensible world (small text files, which can be edited
in a world with nice syntax highlighting and source-controlled
separately) and the monolithic Sibelius .plg file format.

## Install

Install node! http://nodejs.org/

Clone/pull the repo, then cd to the repo directory, and

```
$ sudo npm install -g
```

## parsePlg.js
```
node parsePlg.js <PLG path/file> <targetDirectory> <encoding>
```

Encoding is optional (defaults to utf8, for a plugin initially built and edited in Sibelius you'll likely need utf16le. The
converter writes back to utf8, which works just fine for subsequent import into Sibelius)

Writes a .mss file for each function into targetDirectory, and a .msd file for each dialog into a dialog subdirectory.

Writes GLOBAL.mss, which contains all global data definitions

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
node buildPlg.js <directory> <output file>
```

Inverse of parsePjg, which combines all the .mss/.msd files in the generated structure pointed to by
<directory> and writes an output file which can then be copied into the Sibelius plugins location

If you have created the files outside of Sibelius, please ensure that functions close as in the example
above, with a close brace and a //$end directive.

NB default encoding for plgToMSS is utf8, which Sibelius handles just fine.



