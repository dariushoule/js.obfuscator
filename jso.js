var fs      = require('fs');
var obfsck  = require('./lib/ob.js');

var args   = process.argv.slice(2);
var contents = fs.readFileSync(args[0], {encoding: 'utf8'});
var flags = getFlags(args.slice(1));

out(processFile(contents));

// ---------------------------------------------------------------------------------------------------------------------

function processFile(contents) {

    // Variable names to protect
    var names = [
        "<variable names>"
    ];

    // Functions to redirect through obfuscated calls, optionally protecting the names
    var functions = {
        '<function names>': true
    };

    var contents = obfsck.chop(contents),
        contents = obfsck.translateVarNames(contents, names),
        contents = obfsck.mungeConstants(contents),
        contents = obfsck.mungeStrings(contents),
        contents = obfsck.buildFunctionTable(contents, functions);
        contents = obfsck.minify(contents),
        contents = obfsck.finalpass(contents);

    return contents;
}

function getFlags(opts) {
    var f = [];

    f['-o'] = 'STDOUT',
    f['-p'] = 1;

    if(opts.length > 0) {
        for(var index in opts) {
            switch(opts[index]) {
                case '-o':
                    f['-o'] = opts[parseInt(index, 10) + 1];
                    break;
                case '-p':
                    f['-p'] = opts[parseInt(index, 10) + 1];
                    break;
            }
        }
    }

    return f;
}

function out(fileContents) {
    if(flags['-o'] != "STDOUT") {
        fs.writeFileSync(flags['-o'], fileContents);
    } else {
        console.log(fileContents);
    }
}