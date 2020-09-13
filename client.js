var socket = io();

const FPS = 30;

function other_player(player) {
    if (player == 1) return 2
    else return 1
};

// dict to send to server
/* send_dict = {'event': 'none',
             'take': undefined,
            'time_since_update': 0
        };
*/

// Parameters
var gameSpeed = 500;

// get the initial game state

var guess = '';
var status = '';
var last_update = 0;
var last_type = 0;
var taker = undefined;
var graphics_to_update = [];
var last = undefined
var take_start_time = new Date().getTime()
var game_over = false
var player_id = -1;
var update_number = 0; 
var initialized = false;
var down = false;
var game_transmitted = false;
var pending_take = false;

// KEY handler
document.addEventListener("keydown", keyhandler);

function keyhandler(e){
    if (down){
        down = false;
        return;
    }
    down = true;

    var keyCode = e.keyCode;
    var keyPressed = String.fromCharCode(keyCode).toUpperCase();

    // any letter key
    if ((keyCode >= 65) && (keyCode <= 90)){
        console.log(`Entered key ${keyPressed}`);
        guess = guess + keyPressed;
        graphics_to_update = graphics_to_update.concat(['guess'])
        last_type = new Date().getTime()
    }
    
    // delete key
    else if (keyCode == 8){
        if (guess != ''){
            guess = guess.substring(0, guess.length - 1);
            graphics_to_update = graphics_to_update.concat(['guess'])
            last_type = new Date().getTime()

            // last = event.key
        }
    } 

    // enter key
    else if (keyCode == 13){
        if (guess == ''){
            if (!game.game_over){ // TODO
                // send_dict['event'] = 'flip_request';
                console.log('Requesting flip');
                socket.emit('flip_request', 0);
                game.flip_status = 'Ready...'
                graphics_to_update = graphics_to_update.concat('flip_status');
            } 
        }
        else{
            console.log('Checking take');

            take_start_time = new Date().getTime();

            var guess_upper = guess.toUpperCase();

            var output = game.take(guess_upper, player_id, last_update);
            var result = output.event_type;
            var take_obj = output.take_obj;

            guess = '';
            graphics_to_update = graphics_to_update.concat(['guess', 'status']);

            if (result == 'steal' || result == 'middle'){
                console.log("Take successful! Sending take object to server");
                // send_dict['event'] = 'steal';
                // send_dict['take'] = take_obj;
                socket.emit('take', take_obj);
            }
            else{
                // send_dict['event'] = 'none'

                if (result == 'tiles'){
                    status = `Tiles aren't there! (${guess_upper})`
                } else if (result == 'trivial'){
                    status = `Same root! (${game.same_root_word} and ${guess_upper} share root ${game.root})`
                } else if (result == 'prefix_suffix'){
                    status = `Prefix or suffix not allowed! ({guess_upper})`
                } else if (result == 'not_word'){
                    status = `Not a word! (${guess_upper})`
                } else if (result == 'short'){
                    status = `Too short! (${guess_upper})`
                }

                console.log(`Take failed! ${result}. ${status}`);
            }
        }
    }
}

// MAIN

window.onload = init;
window.addEventListener("keydown", function(e){keyhandler(e)}, false)

function init() {
    /*
    initialized = true;
    console.log("Initializing Game")
    game = new Game();
    console.log("Initializing Graphics")
    graphics = new Graphics();
    console.log("Displaying initial elements")
    graphics.display_init();
    
    // Request next frame and call gameLoop
    window.requestAnimationFrame(gameLoop); */
}

// GAME LOOP

function gameLoop() {
    // Send the server time since last update in case there's a pending take
    if (pending_take){
        socket.emit('check take', new Date().getTime() - last_update)
    }

    graphics.update_display(game, player_id, graphics_to_update, guess, status);
    graphics_to_update = [];

    window.requestAnimationFrame(gameLoop);
}

let gameTimer = window.setInterval(function(){
    if (initialized){
        gameLoop();
    }
}, gameSpeed);

// SOCKET


socket.on('game transmission', function (recv_game){
    if (!initialized){
        console.log("Game transmission");
        initialized = true;
        game = new Game();
        graphics = new Graphics();
        graphics.display_init();
        
        game.current = recv_game.current;
        game.player1words_dict = recv_game.player1words_dict;
        game.player1words_list = recv_game.player1words_list;
        game.player2words_dict = recv_game.player2words_dict;
        game.player2words_list = recv_game.player2words_list;
        game.twl_dict = recv_game.twl_dict

        graphics_to_update = graphics_to_update.concat(['flip', 'tiles', 'self_words', 'opp_words'])
        last_update = new Date().getTime();

        // Request next frame and call gameLoop
        window.requestAnimationFrame(gameLoop);
    }
});

socket.on('game id', function (recv_player_id){
    if (player_id == -1){
        console.log("Receiving id");
        player_id = recv_player_id;
    }
});

socket.on('flip_request', function (){
    console.log('Received flip request');
    game.flip_status = 'Ready...';
    graphics_to_update = graphics_to_update.concat(['flip']);
});

socket.on('flip', function (current){
    console.log('Flipped');
    game.current = current;
    game.flip_status = 'Flipped!';
    graphics_to_update = graphics_to_update.concat(['flip', 'tiles']);
    last_update = new Date().getTime();
});

socket.on('pending take', function(){
    pending_take = true; 
});

socket.on('take update', function (game_state){
    pending_take = false;
    console.log("Take update");

    game.current = game_state.current;
    game.player1words_dict = game_state.player1words_dict;
    game.player1words_list = game_state.player1words_list;
    game.player2words_dict = game_state.player2words_dict;
    game.player2words_list = game_state.player2words_list;
    game.last_take = game_state.last_take;

    graphics_to_update = graphics_to_update.concat(['tiles', 'self_words', 'opp_words', 'status']);

    if (game.last_take.taker == player_id){
        var taker = 'self';
        var taker_text = 'You';
        if (game.last_take.victim == player_id){
            var victim = 'yourself';
        }
        else if (game.last_take.victim == other_player(player_id)){
            var victim = 'opponent';
        }
        else{
            var victim = 'the middle';
        }
    }
    else{
        var taker = 'opp';
        var taker_text = 'Opponent';
        if (game.last_take.victim == player_id){
            var victim = "you";
        }
        else if (game.last_take.victim == other_player(player_id)){
            var victim = "themselves";
        }
        else{
            var victim = "the middle";
        }
    }

    if (victim == "the middle"){
        status = `${taker_text} took ${game.last_take.candidate} from ${victim}!`
    }
    else{
        status = `${taker_text} took ${game.last_take.candidate} from ${victim}! (${game.last_take.taken_word} -> ${game.last_take.candidate})` 
    }
    last_update = new Date().getTime();
});

