const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const cors = require('cors');
const app = express();

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server);

/**
 * nodemon index.js
 */

players = {};
gamestate = {

};

io.on("startgame", () => {

})
io.on('connection', (client) => {
    client.emit('bla', "Message!");
    client.on("providename", (name) => {
        players[name] = {
            client: client
        };

    });
    setTimeout(()=>{
        client.emit('needname');
    }, 5000);
});
  
server.listen(4000, function(){
    console.log('listening on *:3000');
});
