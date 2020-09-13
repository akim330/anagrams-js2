const letter_freq = {'A': 13, 'B': 3, 'C': 3, 'D': 6, 'E': 18, 'F': 3, 'G': 4, 'H':3, 'I':12, 'J':2, 'K':2, 'L':5, 'M':3, 'N':8, 'O':11, 'P':3, 'Q':2, 'R':9, 'S':6, 'T':9, 'U': 6, 'V':3, 'W':3, 'X':2, 'Y':3, 'Z':2};

const not_allowed_prefixes = ['UN', 'RE'];
const not_allowed_suffixes = ['S', 'ED', 'D', 'ES', 'ER', 'R', 'OR', 'ING', 'EST', 'IEST', 'LY', 'TION', 'SION'];

const word_add_twl = ['ACAI', 'ROO', 'TIX', 'UNI', 'VIN', 'AFRO'];
var flip_status = ''

const no_prefix_suffix = true
const time_check = false

const twl_file = 'TWL06.txt'

/*
twl_check = function(word){
    $.get('TWL06.txt', {cache:false}, function(data){
        if (data.indexOf(word) > -1){
            return true;
        }
        else{
            return false;
        }
    
    });
} */
/*
twl_check = function(word){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", 'TWL06.txt', true);
    rawFile.onreadystatechange = function(){
        if (rawFile.readyState === 4){
            if (rawFile.status === 200 || rawFile.status == 0){
                var allText = rawFile.responseText;
                return (data.indexOf(word) > -1)
            }
        }
    }
} */

Game = function(){
    this.tiles = [];
    for(var i = 0; i < letters.length; i++){
        for(var j = 0; j < letter_freq[letters[i]]; j++){
            this.tiles.push(letters[i])
        }
    };

    this.tiles = ArrTools.shuffle(this.tiles);

    this.current = [];

    this.player1words_dict = {};
    this.player1words_list = [];
    this.player2words_dict = {};
    this.player2words_list = [];

    this.player1taketime = 0;
    this.player2taketime= 0;

    // maybe don't need
    this.last_update = 0;
    
    this.flip_status = '';
    this.flip_waiting = false;
    this.flip_time = 0;

    this.time_last_take = 0;
    this.p1_last_take = 0;
    this.p2_last_take = 0;
    this.last_take = undefined;

    this.same_root_word = '';
    this.root = '';

    this.update_event = '';
    this.update_number = 0;

    this.game_over = false;

    this.twl_dict = undefined;

    this.test = function(){
        console.log(`player 2 words list: ${this.player2words_list.length}`)
    }

    this.test2 = function(){
        console.log(`current: ${this.current}`)
    }

    this.flip = function(){
        if (this.tiles.length == 0){
            this.game_over = true;
        }
        else{
            this.current.push(this.tiles.pop());
        }
    }

    other_player = function(player){
        if (player == 1){
            return 2
        }
        else{
            return 1
        }
    }

    superset_word = function(word1, word2, strict){
        // Can word1 take word2?
        if (typeof(word1) === 'string'){
            word1 = word1.split('')
        }
        if (typeof(word2) === 'string'){
            word2 = word2.split('')
        }

        counter1 = new ArrTools.Counter(word1);
        counter2 = new ArrTools.Counter(word2);

        console.log(counter1);
        console.log(counter2);

        return counter1.superset(counter2, strict);
    }        

    subtract = function(word1, word2){
        // Subtract word2 from word1 (e.g. 'test' - 'tst' = 'e')
        list1 = word1.split('');
        list2 = word2.split('');
        for (var i = 0; i < word2.length; i++){
            list1.splice(list1.indexOf(list2[i]), 1);
        }
        
        return list1.join('');

    }

    this.both_can_take = function(take1, take2){
        // Checks if two simultaneous takes are compatible with the game state

        if (!(superset_word(this.current, take1.used_tiles.concat(take2.used_tiles)))){
            return false;
        }
        else if (take1.taken_word == take2.taken_word){
            return false;
        }
        else{
            return true;
        }   
    }

    this.can_take = function(take){
        if (take.victim == 1){
            if (this.player1words_list.includes(take.taken_word) && superset_word(this.current, take.used_tiles, strict=False)){
                return true;
            }
            else{
                return false;
            }
        }
        else if (take.victim == 2){
            if (this.player2words_list.includes(take.taken_word) && superset_word(this.current, take.used_tiles, strict=False)){
                return true;
            }
            else{
                return false;
            }
        }
        else if (take.victim == -1){
            if (superset_word(this.current, take.used_tiles, strict=False)){
                return true;
            }
            else{
                return false;
            }
        }
    }

    this.check_steal = function(candidate, etym_candidate, is_player2){
        var event_type = 'tiles';

        if (is_player2){
            word_list = this.player2words_list;
            word_dict = this.player2words_dict;
        }
        else{
            word_list = this.player1words_list;
            word_dict = this.player1words_dict;
        }
        console.log(`${word_list}`)
        console.log(`${word_list.length}`)

        for (i = 0; i < word_list.length; i++){
            var word = word_list[i];
            // First, check if candidate is a superset of the current word 
            console.log(`Gonna check if can take ${word}. Candidate: ${candidate}. Superset? ${superset_word(candidate, word, strict=true)}`)
            if (superset_word(candidate, word, strict=true)){

                console.log(`Gonna check if tiles are there. Current: ${this.current}. Candidate: ${candidate}. Needed tiles: ${subtract(candidate, word_list[i])}. Superset? ${superset_word(this.current, subtract(candidate, word_list[i]))}`)
                // Then, check if the tiles needed to make candidate are in the middle
                if (!superset_word(this.current, subtract(candidate, word_list[i]))){
                    event_type = 'tiles';
                }
                else{
                    try{
                        var common_root_list = etym_candidate.filter(item => word_dict[word].includes(item));
                        if (common_root_list > 0){
                            var root_overlap = true;
                        }
                    }
                    catch {
                        var root_overlap = false;
                    }

                    if (root_overlap){
                        this.same_root_word = word;
                        this.root = common_root_list[0];
                        event_type = 'trivial';
                    }
                    else{
                        event_type = 'steal';
                        return {is_taken: true, event_type: event_type, taken_word: word, taken_i:i};
                    }
                }
            }
        }

        console.log(`Gonna check middle. is_player2: ${is_player2}. Current: ${this.current}. Candidate: ${candidate}. Superset? ${superset_word(this.current, candidate, false)}`)

        if (!is_player2 && superset_word(this.current, candidate, false)){
            console.log("Middle take!");
            event_type = 'middle'
            return {is_taken: true, event_type: event_type, taken_word: undefined, taken_i: undefined};
        }
        else{
            console.log("No middle take!");
            return {is_taken: false, event_type: event_type, taken_word: undefined, taken_i: undefined};
        }
    }

    this.take = function(candidate, player, last_update){
        // TODO
        var used_tiles = [];

        var take_start_time = new Date().getTime();

        // First check if has 3 letters
        if (candidate.length < 3){
            return {event_type: 'short', take_obj :undefined};
        }

        // Then check if it's a word
        if (candidate.length < 10){
            var candidate_lower = candidate.toLowerCase();
            var is_word = this.twl_dict[candidate] || word_add_twl.includes(candidate_lower);
        }
        else{
            var is_word = api.get_word_data(candidate).length != 0;
        }
        if (!is_word){
            return {event_type: 'not_word', take_obj: undefined}
        }

        // If no prefixes and suffixes allowed, check that
        if (no_prefix_suffix){
            prefix_suffix_obj = api.get_prefix_suffix(candidate);

            if (prefix_suffix_obj != undefined && prefix_suffix_obj.has_prefix_suffix && (not_allowed_prefixes.includes(prefix_suffix_obj.prefix) || (not_allowed_suffixes.includes(prefix_suffix_obj.suffix)))){
                return {event_type: 'prefix_suffix', take_obj: undefined}
            }
        }

        var error_trivial_extension = false;
        var error_tiles = false;
        var etym_candidate = api.get_etym(candidate);

        // Check if you can take the other player's words. Outputs check_steal_obj: {is_taken, event_type, taken_word, taken_i}
        check_steal_obj = this.check_steal(candidate, etym_candidate, other_player(player) == 2);
        var opp_is_taken = check_steal_obj.is_taken
        var event_type = check_steal_obj.event_type
        var taken_word = check_steal_obj.taken_word
        var taken_i = check_steal_obj.taken_i

        if (opp_is_taken){
            if (event_type == 'steal'){
                // Make the candidate word into an array to remove individual letters
                var candidate_as_list = candidate.split('')

                // Figure out what tiles are used from the middle and remove them
                for (let i = 0; i < taken_word.length; i++){
                    candidate_as_list.splice(candidate_as_list.indexOf(taken_word[i]), 1)
                }

                return {event_type: 'steal', take_obj: new Take(player, other_player(player), candidate, etym_candidate, taken_word, taken_i, candidate_as_list, take_start_time - last_update)}
            }
            else if (event_type == 'middle'){
                var candidate_as_list = candidate.split('');

                return {event_type: 'middle', take_obj: new Take(player, -1, candidate, etym_candidate, '', -1, candidate_as_list, take_start_time - last_update)}
            }
        }
        else {
            // If no steal was triggered above, then one of the following errors occured
            // We will then see if you can take one of your own words
            if (event_type == 'trivial'){
                error_trivial_extension = true
            }
            else if (event_type == 'tiles'){
                error_tiles = true
            }
        }

        // If you couldn't take opponent's words, check if you can take your own
        if (!opp_is_taken){
            check_steal_obj = this.check_steal(candidate, etym_candidate, other_player(player) != 2);
            self_is_taken = check_steal_obj.is_taken;
            event_type = check_steal_obj.event_type;
            taken_word = check_steal_obj.taken_word;
            taken_i = check_steal_obj.taken_i;

            if (self_is_taken){
                if (event_type == 'steal'){
                    // Make the candidate word into an array to remove individual letters
                    var candidate_as_list = candidate.split('');

                    for (let i = 0; i < taken_word.length; i++){
                        candidate_as_list.splice(candidate_as_list.indexOf(taken_word[i]), 1)
                    };

                    return {event_type: 'steal', take_obj: new Take(player, player, candidate, etym_candidate, taken_word, taken_i, candidate_as_list, take_start_time - last_update)}

                }
                else if (event_type == 'middle'){
                    var candidate_as_list = candidate.split('');

                    return {event_type: 'middle', take_obj: new Take(player, -1, candidate, etym_candidate, '', -1, candidate_as_list, take_start_time - last_update)}
                }

            }
            // If you get here, you couldn't take any word from either player or the middle
            else if (error_trivial_extension || event_type == 'trivial'){
                return {event_type: 'trivial', take_obj: undefined}
            }
            else if (error_tiles){
                return {event_type: 'tiles', take_obj: undefined}
            }
            else{
                return {event_type: 'tiles', take_obj: undefined}
            }
        }
    }

    this.update = function(take){
        // Updates the game based on a given take

        // Update the middle letters: remove used_tiles from current
        for (let i = 0; i < take.used_tiles.length; i++){
            this.current.splice(this.current.indexOf(take.used_tiles[i]), 1);
        }

        // If taker was player 1
        if (take.taker == 1){
            if (take.victim == 1){
                this.player1words_list[take.taken_i] = take.candidate;
                // If after updating, you have no more copies of the taken word, delete it from the dictionary
                if (!this.player1words_list.includes(take.taken_word)){
                    delete this.player1words_dict[take.taken_word];
                }
                this.player1words_dict[take.candidate] ; take.etym_candidate;
                this.new_word_i = take.taken_i;
            }
            else if (take.victim == 2){
                this.player2words_list.splice(this.player2words_list.indexOf(take.taken_word), 1);
                this.player1words_list.push(take.candidate);
                if (!this.player2words_list.includes(take.taken_word)){
                    delete this.player2words_dict[take.taken_word];
                }
                this.player1words_dict[take.candidate] = take.etym_candidate;
                this.new_word_i = this.player1words_list - 1;
            }
            else if (take.victim == -1){
                this.player1words_dict[take.candidate] = take.etym_candidate;
                this.player1words_list.push(take.candidate);
                this.new_word_i = this.player1words_list - 1;
            }
        }
        // If taker was player 2
        else{
            if (take.victim == 2){
                this.player2words_list[take.taken_i] = take.candidate;
                // If after updating, you have no more copies of the taken word, delete it from the dictionary
                if (!this.player2words_list.includes(take.taken_word)){
                    delete this.player2words_dict[take.taken_word];
                }
                this.player2words_dict[take.candidate] ; take.etym_candidate;
                this.new_word_i = take.taken_i;
            }
            else if (take.victim == 1){
                this.player1words_list.splice(this.player2words_list.indexOf(take.taken_word), 1);
                this.player2words_list.push(take.candidate);
                if (!this.player1words_list.includes(take.taken_word)){
                    delete this.player1words_dict[take.taken_word];
                }
                this.player2words_dict[take.candidate] = take.etym_candidate;
                this.new_word_i = this.player2words_list - 1;
            }
            else if (take.victim == -1){
                this.player2words_dict[take.candidate] = take.etym_candidate;
                this.player2words_list.push(take.candidate);
                this.new_word_i = this.player2words_list - 1;
            }
        }
    }
}
