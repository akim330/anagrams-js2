var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.urlencoded({
    extended: true
}))

require('./game.js');

app.use(express.static(__dirname));

var port = process.env.PORT || 3000;



// Game parameters
var flip_delay = 0;

// Initializing
var flip_waiting = false;
var flip_time = 0;
var pending_take = undefined;
var lobby_players = [];
var games_dict = {};

app.get('/', function(req, res){
    res.sendFile(__dirname + '/welcome.html');
});

app.post('/lobby', function(req, res){
    const username = req.body.username;
    res.sendFile(__dirname + '/lobby.html');
});

app.get('/game', function(req, res){
    res.sendFile(__dirname + '/game.html');
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});

game = new Game(is_server = true);

var ids_connected = {1: false, 2: false};

io.on('connect', function(socket){
    
    var client_ip = socket.handshake.headers['x-real-ip'];
    
    console.log('Connected to ' + client_ip + '. ID: ' + socket.id)

    var myUsername = '';

    // ##########
    // #  LOBBY #
    // ##########

    socket.on('fetch lobby', () => {
        socket.emit('players list', lobby_players_list);
    });

    socket.on('join lobby', (username) =>{
        myUsername = username;
        console.log(`${username} has joined the lobby at socket ID: ${socket.id}`)
        lobby_players.push({id: socket.id, username: username, checked: false})
        io.emit('lobby update', lobby_players);
    });

    socket.on('propose game', (opponents) => {
        console.log(`Received proposal from ${myUsername} to play with ${opponents[0].username}`);
        var id = lobby_players[lobby_players.findIndex(player => player.username == opponents[0].username)].id;
        // var ids = opponents.forEach(opponent => lobby_players[lobby_players.findIndex(player => player.username == opponent.username)].id);
        socket.broadcast.to(id).emit('receive proposal', {initiator: myUsername, challenged:opponents});
        socket.emit('receive proposal', {initiator: myUsername, challenged:opponents});
    });

    // ##########
    // #  GAME  #
    // ##########

    // Send the full game state
    socket.emit('game transmission', game); // {current: game.current, player1words_dict: game.player1words_dict, player2words_dict: game.player2words_dict, player1words_list: game.player1words_list, player2words_list: game.player2words_list, is_word: game.is_word});
    
    if (!ids_connected[1]){
        var player_id = 1;
        ids_connected[1] = true;
    }
    else if (!ids_connected[2]){
        var player_id = 2;
        ids_connected[2] = true;
    }
    else{
        var player_id = 0;
    }
    
    console.log(`Sending player id ${player_id}`);
    socket.emit('game id', player_id);

    check_flip_take = function(){
        if (flip_waiting){
            if (new Date().getTime() > flip_time){
                console.log("Flip!")
                game.flip();
                flip_waiting = false;
                io.emit('flip', game.current)
            }
        }
    }

    // Check for pending flips and takes
    setInterval(check_flip_take, 100);

    socket.on('disconnect', () => {
        // console.log(`Player ${player_id} disconnected!`);
        ids_connected[player_id] = false;

        disconnected_i = lobby_players.findIndex(player => player.id == socket.id);
        if (disconnected_i > -1){
            console.log(`${lobby_players[disconnected_i].username} at socket ${lobby_players[disconnected_i].id} disconnected.`);
            lobby_players.splice(disconnected_i, 1);
        }
    });

    socket.on('flip_request', function(){
        console.log("Received flip request")
        flip_waiting = true;
        flip_time = new Date().getTime() + flip_delay; 
        io.emit('flip_request');
    })

    socket.on('take', function(recv_take){
        console.log("---- Received take ----");
        console.log(`Type of pending_take: ${typeof(pending_take)}`);
        if (pending_take != undefined){
            console.log("Check pending take");
            if (pending_take.taker != player_id){
                console.log("Pending take was other player's, so now will update");
                if (game.both_can_take(pending_take, recv_take)){
                    game.update(pending_take, pending_take.taker);
                    game.update(recv_take, player_id)
                    game.last_take = recv_take;
                    pending_take = undefined;

                    io.emit('take update', {current: game.current, player1words_dict: game.player1words_dict, player2words_dict: game.player2words_dict, player1words_list: game.player1words_list, player2words_list: game.player2words_list});
                }
                else if (recv_take.take_time < pending_take.take_time){
                    game.update(recv_take, player_id);
                    game.last_take = recv_take;
                    pending_take = undefined;

                    io.emit('take update', {current: game.current, player1words_dict: game.player1words_dict, player2words_dict: game.player2words_dict, player1words_list: game.player1words_list, player2words_list: game.player2words_list});

                }
                else{
                    game.update(pending_take, pending_take.taker);
                    game.last_take = pending_take;
                    pending_take = undefined;

                    io.emit('take update', {current: game.current, player1words_dict: game.player1words_dict, player2words_dict: game.player2words_dict, player1words_list: game.player1words_list, player2words_list: game.player2words_list});
                }
            }
            else{
                console.log("Pending take was same player's so will not update");
                // Pending take is the same player's previous take
                if (game.superset(recv_take.candidate, pending_take.candidate, true)){
                    pending_take = recv_take;
                }
            }
        }
        else{
            console.log("No pending take, so make this one the pending take.");
            console.log(`Can I take it? ${game.can_take(recv_take)}`);
            // No pending take, so this received take becomes the pending take if you can still take it
            if (game.can_take(recv_take)){
                pending_take = recv_take;
                io.emit('pending take');
            }
        }

    })

    socket.on('check take', function(time_since_update){
        if (pending_take != undefined && pending_take.taker != player_id){
            console.log(`Checking take (player ${player_id}): pending_take: ${typeof(pending_take)}, pending_take id${pending_take.taker}, pending taketime: ${pending_take.take_time}, current time since update: ${time_since_update}`);
            if (time_since_update > pending_take.take_time){
                console.log("Too late! Updating!")
                game.update(pending_take, pending_take.taker);
                game.last_take = pending_take;
                pending_take = undefined;

                io.emit('take update', {current: game.current, player1words_dict: game.player1words_dict, player2words_dict: game.player2words_dict, player1words_list: game.player1words_list, player2words_list: game.player2words_list, last_take: game.last_take});
            }
        }
    })
})


