var fs     = require('fs');
var path   = require('path');
var lexer  = require('lib/lex.js');

var args   = process.argv.slice(2);
var contents = fs.readFileSync(args[0]);
var flags = getFlags(args.slice(1));

out(processFile(contents));

/*
 *
 */
function processFile(contents) {
    var token  = null;
    var operations = [];
    var remaining = contents;

    while((token = lexer.nextToken(contents)) != null) {
        remaining = contents.substr(token.endIndex);
        operations.push(token);
    }
}

/*
 *
 */
function getFlags(opts) {
    //defaults
    flags['-o'] = 'STDOUT';
    flags['-p'] = 1;

    if(opts.length > 0) {
        for(var index in opts) {
            switch(opts[index]) {
                case '-o':
                    flags['-o'] = opts[index + 1];
                    break;
                case '-p':
                    flags['-p'] = opts[index + 1];
                    break;
            }
        }
    }
}


/*
 *
 */
function out(fileContents) {
    if(flags['-o'] != "STDOUT") {
        fs.writeFileSync(flags['-o'], fileContents);
    } else {
        console.log(fileContents);
    }
}