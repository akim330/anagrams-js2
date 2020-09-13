const app = angular.module('app', []);
var username;

window.onload = function() {
    console.log("Setting username");
    var url = document.location.href;
    username = (url.split('?')[1]).split('=')[1];
    console.log(`Username: ${username}`);
}

$('#form')

app.factory('socket', function ($rootScope) {
    const socket = io();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {  
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});

app.controller('appctrl', ($scope, socket) => {

    $scope.socketId = null;
    $scope.selected_players = [];
    $scope.lobby_players = [];
    $scope.challenge_show = false;
    $scope.initiator = null;
    $scope.challenged = null;

    var url = document.location.href;
    $scope.username = (url.split('?')[1]).split('=')[1];

    socket.emit('join lobby', $scope.username);

    $scope.selectPlayer = (selected_username) => {
        var selected_i = lobby_players.findIndex(player => player.username == selected_username)
        $scope.lobby_players[selected_i].checked = !$scope.lobby_players[selected_i].checked
    }

    $scope.proposeGame = () => {
        console.log("Proposing game");
        var selected_players = $scope.lobby_players.filter(player => player.checked);
        socket.emit('propose game', (selected_players));
        //$scope.selected_players = [];
    };

    socket.on('lobby update', (lobby_players) =>{
        console.log(`Getting lobby update:`);
        for (let i=0; i < lobby_players.length; i++){
            console.log(`${i}: ${lobby_players[i].username} at ${lobby_players[i].id}`);
        }
        console.log(lobby_players)
        var own_index = lobby_players.findIndex(player => player.username == $scope.username);
        console.log(`Own index: ${own_index}`);
        lobby_players.splice(own_index, 1);
        $scope.lobby_players = lobby_players
    });

    socket.on('receive proposal', (obj) =>{
        console.log("Received a proposal")
        $scope.initiator = obj.initiator;
        $scope.challenged = obj.challenged[0].username; 

        $scope.challenge_show = true;
    });

    socket.on('initialize game', () => {

    });



});

/*
<div class="checkbox" ng-repeat="player in lobby_players">
                <input type="checkbox" name="player" id="{{player.username}}">
                <label for="{{player.username}}">{{player.username}}</label>
            </div>
            <input type="submit" value="Propose Game">*/