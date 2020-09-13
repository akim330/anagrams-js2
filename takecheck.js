TakeCheck = function(){
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

    this.check_steal = function(game, candidate, etym_candidate, is_player2){
        var event_type = 'tiles';

        if (is_player2){
            console.log('is_player2')
            console.log(`player 2 words list: ${game.player2words_list}`)
            word_list = game.player2words_list;
            word_dict = game.player2words_dict;
        }
        else{
            console.log('is not player2')
            console.log(`player 1 words list: ${game.player1words_list}`)
            word_list = game.player1words_list;
            word_dict = game.player1words_dict;
        }
        console.log(`${word_list}`)
        console.log(`${word_list.length}`)

        for (i = 0; i < word_list.length; i++){
            // First, check if candidate is a superset of the current word 
            if (superset_word(candidate, word, strict=true)){

                // Then, check if the tiles needed to make candidate are in the middle
                if (!superset_word(this.current, subtract(candidate, word))){
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
                        same_root_word = word;
                        root = common_root_list[0];
                        event_type = 'trivial';
                    }
                    else{
                        event_type = 'steal';
                        return {is_taken: true, event_type: event_type, taken_word: word, taken_i:i};
                    }
                }
            }
        }

        console.log(`Gonna check middle. is_player2: ${is_player2}. Current: ${game.current}. Candidate: ${candidate}. Superset? ${superset_word(game.current, candidate, false)}`)

        if (!is_player2 && superset_word(game.current, candidate, false)){
            event_type = 'middle'
            return {is_taken: true, event_type: event_type, taken_word: undefined, taken_i: undefined};
        }
        else{
            return {is_taken: false, event_type: event_type, taken_word: undefined, taken_i: undefined};
        }
    }

    this.take = function(game, candidate, player, last_update){
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
            var is_word = this.is_word(candidate) || word_add_twl.includes(candidate_lower);
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

            if (prefix_suffix_obj.has_prefix_suffix && (not_allowed_prefixes.includes(prefix_suffix_obj.prefix) || (not_allowed_suffixes.includes(prefix_suffix_obj.suffix)))){
                return {event_type: 'prefix_suffix', take_obj: undefined}
            }
        }

        var error_trivial_extension = false;
        var error_tiles = false;
        var etym_candidate = api.get_etym(candidate);

        // Check if you can take the other player's words. Outputs check_steal_obj: {is_taken, event_type, taken_word, taken_i}
        check_steal_obj = this.check_steal(game, candidate, etym_candidate, other_player(player) == 2);
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
}
