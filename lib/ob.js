module.exports = {

    nameChars: "ǅʥʣʫʤɮǆǄǲǱǳdDzZż".split(""),

    nameTranslate: function(name) {
        var translated = "";
        for(var i = 0; i < name.length; i++) {
            var c = name.charCodeAt(i);
            var hc = (c & 0xF0) >>> 4;
            var lc = (c & 0xF);
            translated += this.nameChars[hc] + this.nameChars[lc];
        }

        return translated;
    },

    chop: function(input) {
        var i = input.indexOf("//@cut");
        if(input.indexOf("") != -1) {
            return input.substr(0, i);
        }
        return input;
    },

    translateVarNames: function(input, vars){

        for(var index in vars) {
            var name = vars[index];
            var translation = this.nameTranslate(name);
            var re = new RegExp("^"+name);

            var i = 0;
            while(i < input.length) {
                if(re.test(input.substr(i))) {
                    if(!this.isAlnum(input.charAt(i-1)) && !this.isAlnum(input.charAt(i + name.length))) {
                        input = this.splice(input, i, name.length, translation);
                        i += translation.length - 1;
                    }
                }

                i++;
            }
        }

        return input;
    },

    mungeString: function(str) {
        var decrypt = "(function(){return ";
        var retStatement = "''";

        for(var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            var rnd = this.randRange(0, 0xFFFFFFFF) >>> 0;
            retStatement += "+String.fromCharCode(" + (c - rnd) + " + " + rnd + ")";
        }

        decrypt += retStatement + ";})()";
        return decrypt;
    },

    randRange: function(low, hi) {
        return Math.floor(Math.random() * (hi - low)) + low;
    },

    randStr: function(len) {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, len);
    },

    randRandParams: function(n) {
        var params = '';
        for(var i = n; i >=0; i--) {
            params += ',' + this.nameTranslate(this.randStr(this.randRange(2, 10)));
        }

        return params;
    },

    randAssignments: function(arr) {
        var res = '';
        for(var i = 0; i < arr.length; i++) {
            if(arr[i] == ""){
                continue;
            }
            res += 'var ' + arr[i] + " = " + this.mungeString(this.randStr(this.randRange(1, 8))) + ";";
        }

        return res;
    },

    minify: function(input) {
        return input.replace(/[\t\n]/g, '').replace(/\s+/g,' ');
    },

    buildFunctionTable: function(input, functions) {
        var fTable = [];

        for(var name in functions) {
            var applyTranslation = functions[name];
            var translation = applyTranslation ? this.nameTranslate(name) : name;
            var re = new RegExp("^"+name);
            var reArgs = new RegExp(name+"\\s*?\\((.*?)\\)", "m");
            var reDef = new RegExp("function\\W+?"+name+"\\W*?\\((.*?)\\)", "m");

            var i = 0;
            while(i < input.length) {
                if(re.test(input.substr(i))) {
                    var isDefinition = reDef.test(input.substr(i - 9));
                    var args = reArgs.exec(input.substr(i));

                    if(args == null || args.index != 0) {
                        i++;
                        continue;
                    }

                    args = args[1].split(",");

                    if(!isDefinition) {
                        var newName = translation;
                        var r = this.randRange(2, 10);
                        for(var n = 0; n < r; n++) {
                            var newargs = this.randRandParams(args.length).substr(1);
                            var junkargs = this.randRandParams(this.randRange(1, 5));

                            var argAssignments = this.randAssignments(junkargs.split(","));

                            var rendered = argAssignments + ";return " + newName + "(" + newargs + junkargs + ");";
                            newName = this.nameTranslate(this.randStr(this.randRange(6,14)));
                            var newFunc = "function " + newName + "(" + newargs + this.randRandParams(this.randRange(1, 5)) + "){" + rendered + "};";

                            fTable.push(newFunc);
                        }

                        input = this.splice(input, i, name.length, newName);
                        i += newName.length - 1;
                    } else {
                        if (applyTranslation) {
                            input = this.splice(input, i, name.length, translation);
                            i += translation.length - 1;
                        }
                    }
                }

                i++;
            }
        }

        return input + this.shuffle(fTable).join("");
    },

    shuffle: function(array) {
        var currentIndex = array.length, temporaryValue, randomIndex ;

        while (0 !== currentIndex) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    },

    mungeStrings: function(input) {
        var strRegex = /\W+('.+?')\W+/i;
        var res;
        var i = 0;

        while((res = strRegex.exec(input.substring(i))) != null) {

            var orig = res[1];
            var encStr = "";
            var iVar = this.nameTranslate(this.randStr(this.randRange(6,14))),
                sVar = this.nameTranslate(this.randStr(this.randRange(6,14))),
                nVar = this.nameTranslate(this.randStr(this.randRange(6,14)));
            for(var x = 1; x < orig.length - 1; x++) {
                encStr += "," + (orig.charCodeAt(x) ^ 0xDE);
            }
            encStr = "var " + sVar + " = ["+encStr.substr(1)+"]," + nVar + " = '';";

            var insertion = "(function(){" + encStr +
                "for(var " + iVar + "=0; "+iVar+" < " + (orig.length-2) + ";" + iVar + "++){" +
                nVar + " += String.fromCharCode("+sVar+"["+iVar+"] ^ 0xDE); };return "+nVar+";})()";

            var matchSubIndex = res[0].indexOf(orig);
            input = this.splice(input, i + res.index + matchSubIndex, orig.length, insertion);
            i += res.index + matchSubIndex +  insertion.length;
        }

        return input;
    },

    finalpass: function(input) {

        var newInput = "";
        var x = 0x3EE7BEE7;
        for(var i = 0; i < input.length; i++) {
            newInput += "|" + (input.charCodeAt(i)^ x);
        }

        newInput = "eval('" + newInput.substr(1) + "'.split('|').map(function(z){return String.fromCharCode(z^"+x+");}).join(''));";
        return newInput;
    },

    mungeConstants: function(input) {
        var numRegex = /\W+([0-9xf]+?)\W+/i;
        var res;
        var i = 0;

        while((res = numRegex.exec(input.substring(i))) != null) {
            var radix = res[1].toLocaleLowerCase().indexOf("x") == -1 ? 10 : 16;
            var orig = parseInt(res[1], radix);
            var x = this.randRange(0, 0xFFFFFFFF);
            var insertion = "(function(){return (" + (x ^ orig) + " ^ " + x + ") >>> 0;})()";
            var matchSubIndex = res[0].indexOf(res[1]);
            input = this.splice(input, i + res.index + matchSubIndex, res[1].length, insertion);
            i += res.index + matchSubIndex +  insertion.length;
        }

        return input;
    },

    alnumRegex: /[^a-zA-Z0-9]/,
    isAlnum: function(c){
        return !(this.alnumRegex.test(c));
    },

    splice: function(str, start, length, replacement) {
        return str.substr(0,start)+replacement+str.substr(start+length);
    }

}