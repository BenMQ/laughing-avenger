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
app.get('/masterArr', function(req, res) {
	res.json(masterArr);
});

// Introducing master arr, where we store all data
var masterArr = [];

// Init db
// Retrieve posts from mysql db and push to masterArr
var db = require('./database.api.js');
db.init(config.db);
console.log('db module init!');

var db_limit = 10; // How many qns do you want in one page?
var db_offset = 0; // TODO: multipage thingy
db.getQuestions(10, 0, function(results) {
	for (var i = 0; i < results.length; i++) {
		console.log(results[i]);
		masterArr.push(results[i]);
		masterArr[i].answers = [];
		// A closure just for the callback
		(function(i, cur_result) {
			db.getAnswers(cur_result.id, db_limit, db_offset, function(answers) {
				for (var j = 0; j < answers.length; j++) {
					masterArr[i].answers.push(answers[j]);
				}
			});
		})(i, results[i]);
		masterArr[masterArr.length - 1].comments = [];
	}
});

// For server side, emit sender and handler almost always together
// The flow is: 1. Received emit from client 2. Push to masterArr
//				3. Store to db 4. emit a signal to all client

io.sockets.on("connection", function(socket) { //general handler for all socket connection events
	socket.on("comment", function(data) {

	});
	socket.on("ans", function(data) {
		db.addAnswer(data.owner_id, data.parent_id, data.content, function(id) {
			db.getAnswer(id, function(results) {
				if (results[0]) {
					for (var i = 0; i < masterArr.length; i++) {
						// Find the question which this answer belongs to
						if (masterArr[i].id == results[0].parent_id) {
							masterArr[i].answers.push(results[0]);
							io.sockets.emit('ans', results[0]);
							break;
						}
					}
				}
			});
		});
	});
	socket.on("post", function(data) {
		db.addQuestion(data.owner_id, data.title, data.content, function(id) {
			db.getQuestion(id, function(results) {
				if (results[0]) {
					masterArr.push(results[0]);
					masterArr[masterArr.length-1].answers = [];
					io.sockets.emit('post', results[0]);
				}
			});
		});
	});
	socket.on('vote', function(clientVote) {
		console.log("server received vote");
		console.log(clientVote);
		if (clientVote.type == 1) {
			console.log("enter up/down if");
			db.voteUp(clientVote.user_id, clientVote.post_id, function(result) {
				if (result) {
					db.getPost(clientVote.post_id, function(results) {
						if (results[0]) {
							io.sockets.emit('vote', results[0]);
						}
					});
				}
			});
		}
		else if (clientVote.type == -1) {
			db.voteDown(clientVote.user_id, clientVote.post_id, function(result) {
				if (result) {
					db.getPost(clientVote.post_id, function(results) {
						if (results[0]) {
							io.sockets.emit('vote', results[0]);
						}
					});
				}
			});
		}
	});
});

server.listen(config.port);
console.log("Express is listening on port " + config.port);
