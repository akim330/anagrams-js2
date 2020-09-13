TWL = function (path){
    var TWL_Dictionary = {};

    fs = require('fs');
    fs.readFile('TWL06.txt', 'utf8', function(err,data){
        if (err) {return console.log(err)};

        var lines = data.split("\n");
        var start_line = 0;

        var n_words = lines.length;

        for (let i = start_line; i < n_words; i++){
            var word = lines[i];

            TWL_Dictionary[word.slice(0,-1)] = true;
        }
    });

    is_word = (word) => (TWL_Dictionary[word] !== undefined);

    // return is_word;
    return {dict: TWL_Dictionary, func: is_word};
}