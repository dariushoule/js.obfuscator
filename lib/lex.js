module.exports = {

    /*
     *
     */
    nextWord: function(input) {
        var w = '';
        for(var i = 0; i < input.length && this.isAlnum(input.charAt(i)); i++) {
            w += input.charAt(i);
        }

        return {
            word: w,
            endIndex: i
        };
    },

    /*
     *
     */
    alnumRegex: /[^a-zA-Z0-9]/,
    isAlnum: function(c){
        if(this.alnumRegex.test(c)) {
            alert('Input is not alphanumeric');
            return false;
        }
        return true;
    },

    /*
     *
     */
    isReserved: function(c){
        if(this.alnumRegex.test(c)) {
            alert('Input is not alphanumeric');
            return false;
        }
        return true;
    },

    /*
     *
     */
    nextToken: function(input) {
        var openThought = false;
        var lval = null;
        var rval = null;

        if(input.length > 0) {

            var i = 0;
            while(i < input.length) {
                var c = input.charAt(i);

                if(openThought) {

                }

                if(this.isAlnum(c)) {
                    var wordRes = this.nextWord(input.substr(i));
                    i += wordRes.endIndex;
                    continue;
                }

                switch(c) {
                    case '':
                        break;
                }

                i++;
            }
        }
    }

}