var url_start = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/";
var url_end = "?key=1d218d21-dc07-4abc-8198-1cb5fadb100d";

api = {
    longestSubstringFinder: function(string1, string2){
        var answer = '';
        len1 = string1.length;
        len2 =  string2.length;
        for (let i = 0; i < len1; i ++){
            var match = '';
            let step = 0;
            // Checking for a match for ith character of string1
            for (let j = 0; j < len2; j++){
                // Checking for a match with jth character of string2
                
                if (i + step < len1 && string1.charAt(i + step) == string2.charAt(j)){
                    // Characters matched, so add it to the running match string
                    match += string2.charAt(j);
                    step++
                }
                else {
                    // Characters didn't match, so if the match string is the highest yet, make it the tentative answer
                    if (match.length > answer.length){
                        answer = match;
                    }
                    // If the current character might be the start of a new matching substring with the ith character of string1, start anew
                    if (string1.charAt(i) == string2.charAt(j)){
                        match =  string2.charAt(j);
                        step = 1
                    }
                    // Otherwise, start from nothing and move onto the next j
                    else{
                        match = '';
                        step = 0;
                    }
                }
                
            }
            // At the end of ith loop, see if our current match string is the highest so far
            if (match.length > answer.length){
                answer = match;
            }
        }
        return answer;
    },

    httpGet: async function(theUrl)
    {
        /* var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
        

        let jsondata;
        fetch(theUrl).then(
            function(u){ return u.json();}
        ).then (
            function(json){
                jsondata = json[0];
            }
        );
        return jsondata;*/

        const response = await fetch(theUrl, {});
        const json = await response.json();
        return json;
    },

    get_word_data: function(word){
        var url = url_start.concat(word, url_end);
        var response = this.httpGet(url); //JSON.parse(this.httpGet(url));
        return response
    },

    get_etym: function(word){
        var word_data = this.get_word_data(word);

        var et_string = '';
        for (let i = 0; i < word_data.length; i++){
            try{
                str = word_data[i].et[0][1]
                et_string = et_string.concat(str)
            }
            catch(e){
                if (e instanceof TypeError){}
            }

        }

        var pattern = /{it}.+?{\/it}/g;
        var etyms_list_tagged = Array.from(et_string.matchAll(pattern), m => m[0]);
        var etyms_list = etyms_list_tagged.map(str => str.split(/{it}|{\/it}/)[1]);
        return etyms_list;
    },

    get_prefix_suffix: function(word){
        try{
            var root = this.get_word_data(word).meta.id.split(':')[0].toUpperCase();
            var common_root = this.longestSubstringFinder(root, word);
            try{
                var prefix = word.split(common_root)[0];
                var suffix = word.split(common_root)[1];
                if (prefix.length > 0 || suffix.length > 0){
                    return {has_prefix_suffix: true, prefix: prefix, suffix: suffix}
                }
                else{
                    return {has_prefix_suffix: false}
                }
            }
            catch (e){
                if (e instanceof ValueError){
                    return {has_prefix_suffix: false}
                }
            }
        }
        catch (e){
            if (e instanceof TypeError){
                return {has_prefix_suffix: false}
            }
        }
    }
}