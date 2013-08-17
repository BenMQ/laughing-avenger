var express = require("express");
var app = express(); //built on top of normal HTTP server
var server = require("http").createServer(app); //convert from express server to normal HTTP server
var io = require("socket.io").listen(server); //socket expects to listen to a normal HTTP server not an express server

//app.use(express.bodyParser()); //middleware for attaching body to HTTP request when not using socket

app.get("/", function(req, res) {
    res.sendfile('socketBoard.html');
});

var messages = [];
// Retrieve msg from mysql db
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'laughing_avenger',
});
connection.connect();
connection.query('SELECT * from msg', function(err, rows, fields) {
    if (err)
        throw err;
    for (var i=0; i< rows.length; i++) {
        messages.push(rows[i].content);
        console.log(rows[i].content);
    }
    console.log("You should see 'init' since it's the first row.");
});

connection.end();

app.get('/messages', function(req, res) {
    res.json(messages);
});

// Create a new event listener that response to a socket connection
// here io refers to the socket server
io.sockets.on("connection", function(socket) { //general handler for all socket connection events
    //event handler for events happening on that socket connection, in this case, 'on message'
    socket.on("msgEntry", function(data) {
        console.log("Received: " + data);

        messages.push(data);
        connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'laughing_avenger',
        });
        connection.connect();
        connection.query('INSERT INTO msg (content) VALUES ("'+data+'");', function(err, rows, fields) {
            if (err)
                throw err;
            console.log(data);
        });
        connection.end();
        //socket.send(data) //this will send data to only current socket
        io.sockets.emit("msgEntry", data); // send message to all clients
    });

});

server.listen(4321);
console.log("Express is listening on port 4321");
