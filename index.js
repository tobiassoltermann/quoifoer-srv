const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const cors = require('cors');
const app = express();

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server);
const startTimestamp = Date.now();

const RoomList = require('./RoomList');
const Room = require('./Room');

const AvailableGamemodes = require('./AvailableGamemodes');

/**
 * nodemon index.js
 */

players = {};
rooms = [];

gamestate = {

};


class GameServer {
    constructor() {
        this.debugInfo = {};
        this.roomList = new RoomList(this);

        io.on("startgame", () => {
        });
        io.on('connection', this.handleNewConnection.bind(this));
    }

    handleNewConnection(client) {
        this.sendRoomListAll();
        this.sendOfferedGameRules(client);

        var playerName;
        client.on("providename", (name) => {
            playerName = name;
            
        });
        client.on("createRoom", (roomDetails, confirmation) => {
            var roomAddResult = this.roomList.addRoom(roomDetails);
            confirmation(roomAddResult);
            if (roomAddResult.status) {
                this.sendRoomListAll();
            };
        });
        client.on("joinRoom", (roomJoinDetails, response) => {
            var roomName = roomJoinDetails.name;
            var password = roomJoinDetails.password;


            var couldJoin = this.roomList.joinRoom(roomName, client, playerName, password);
            var result = {
                status: couldJoin.status,
                message: couldJoin.message,
            };
            var room = this.roomList.getRoom(roomName);

            response(result, {
                gameMode: room.gameMode,
            });
            if (couldJoin.status) {
                this.sendRoomListAll();
            }
        });
        client.on("leaveRoom", (roomName, response) => {
            var couldLeave = this.roomList.leaveRoom(roomName, playerName);
            response({
                status: couldLeave.status,
                message: couldLeave.message,
            });
            if (couldLeave.status) {
                this.sendRoomListAll();
            }
        });
    }


    sendOfferedGameRules(client) {
        var gameModesSendable = {};
        Object.keys(AvailableGamemodes).forEach( (keyName) => {
            gameModesSendable[keyName] = {
                label: AvailableGamemodes[keyName].label
            }
        });
        client.emit('offered-gamemodes', gameModesSendable);
    }
    sendRoomListAll() {
        io.emit('rooms', this.roomList.getList());
    }
}

let gameServer = new GameServer()
// makes dev's life easier

server.listen(4000, function(){
    console.log('listening on *:3000');
    debugger;
    gameServer.roomList.addRoom({
        name: "room",
        protection: "none",
        password: '',
        gameMode: 'coiffeur',
    });
});
