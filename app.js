var express = require("express");
var app = express();

// Static file directories
app.use("/public", express.static(__dirname + '/public'));

var server = require("http").createServer(app);
var io = require("socket.io").listen(server);


var config = require("./config/config.js");

app.get("/", function(req, res) {
	res.sendfile('socketBoard.html');
});

var messages = [];
// Retrieve msg from mysql db
var mysql = require('mysql');
var connection = mysql.createConnection(config.db);
connection.connect();
connection.query('SELECT * from msg', function(err, rows, fields) {
	if (err)
		throw err;
	for (var i = 0; i < rows.length; i++) {
		messages.push(rows[i]);
		console.log("//---- printing table cols ---");
		console.log(rows[i]);
	}
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
		var msgEntry;
		connection = mysql.createConnection(config.db);
		connection.connect();
		connection.query('INSERT INTO msg (content) VALUES ("' + data + '");', function(err, result) {
			if (err)
				throw err;

			msgEntry = {ID: result.insertId, content: data,};
			messages.push(msgEntry);
			console.log("In msgEntry handler");
			console.log(msgEntry);
			io.sockets.emit("msgEntry", msgEntry); // send message to all clients
		});
		//--------- This part was used to retrieve msg, but it was too slow ------
//		connection.query('SELECT * FROM msg WHERE content = "' + data + '";', function(err, rows, fields) {
//			if (err)
//				throw err;
//			if (rows[0]) {
//				messages.push(rows[0]);
//				msgEntry = rows[0];
//			}
//		});
		connection.end();
		//socket.send(data) //this will send data to only current socket

	});


	//--------- Server handles incoming votes ------------
	//--- @boyang
	socket.on('vote', function(clientVote) {
		console.log("server received vote");
		console.log(clientVote);
		console.log(messages);
		var len = messages.length;
		var msgToVote;
		for (var i = 0; i < len; i++) {

			if (parseInt(messages[i].ID) === parseInt(clientVote.ID)) {
				console.log("found msgToVote");
				msgToVote = messages[i];
				break;
			}
		}

		if (msgToVote) {
			if (msgToVote.vote) {
				msgToVote.vote += clientVote.value;
			}
			//---- If vote is not set, set it now -----
			else {
				msgToVote.vote = clientVote.value;
			}
			io.sockets.emit('vote', {ID: clientVote.ID, value: msgToVote.vote});
		}


	});
});

server.listen(config.port);
console.log("Express is listening on port " + config.port);
