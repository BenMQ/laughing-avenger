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

// Introducing master arr, where we store all data
var masterArr = [];

// Since I dont have insert id for a_i primary key now
// Have to do this stupid counter
var post_id_ai = 1;

// define post obj class
function Post(initObj) {
	if (!initObj.id || !initObj.owner_id) {
		return;
	}
	
	this.id = initObj.id;
	this.owner_id = initObj.owner_id;
	this.title = initObj.title || '';
	this.content = initObj.content || '';
	this.answers = [];
	this.comments = [];
	// Can't continue. I need the db to be working
}
var sample_post = new Post({
	id: 1,
	owner_id: 100001375167765,
	title: "Sleepy",
	content: "CS1231 Too Easy\\nAnd this is new line?",
});

masterArr.push(sample_post);

sample_post = new Post({
	id: 2,
	owner_id: 100001375167765,
	title: "Sleepy still",
	content: "new line not shown considered good thing. Just to make this longer"+
			"blablabla see what happens Friday need to submit 3230 homework i believe I have discovered a truly marvelous proof of this, which this margin is too narrow to contain.blablabla",
});
masterArr.push(sample_post);

app.get('/masterArr', function(req, res) {
	res.json(masterArr);
});

// Retrieve msg from mysql db
// Don't know how to do yet, comment out first

//var mysql = require('mysql');
//var connection = mysql.createConnection(config.db);
//connection.connect();
//connection.query('SELECT * from post', function(err, rows, fields) {
//	if (err)
//		throw err;
//	for (var i = 0; i < rows.length; i++) {
//		messages.push(rows[i]);
//		console.log("//---- printing table cols ---");
//		console.log(rows[i]);
//	}
//});
//connection.end();


// For server side, emit sender and handler almost always together
// The flow is: 1. Received emit from client 2. Push to masterArr
//				3. Store to db 4. emit a signal to all client
// Create a new event listener that response to a socket connection
// here io refers to the socket server
io.sockets.on("connection", function(socket) { //general handler for all socket connection events
	socket.on("comment", function(data) {
		
	});
	socket.on("ans", function(data) {
		
	});
	socket.on("post", function(data) {
		console.log("Received: " + data);

		// db part, comment out
//		connection = mysql.createConnection(config.db);
//		connection.connect();
//		connection.query('INSERT INTO post (content) VALUES ("' + data + '");', function(err, result) {
//			if (err)
//				throw err;
//
//			msgEntry = {ID: result.insertId, content: data, };
//			messages.push(msgEntry);
//			console.log("In msgEntry handler");
//			console.log(msgEntry);
//			io.sockets.emit("msgEntry", msgEntry); // send message to all clients
//		});
//		connection.end();
	});
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
