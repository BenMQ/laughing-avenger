var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

app.get("/", function (req, res) {
	res.sendfile("socketBoard.html");
});

var messages = [];

app.get("/messages", function (req, res) {
	console.log("Got request for all messages");
	res.json(messages);
});

io.set("log level", 1);

io.sockets.on("connection", function (socket) {
	socket.on("message", function (data) {
		console.log("Received: " + data);
		messages.push(data);
		io.sockets.send(data);
	});
});

server.listen(8000);
console.log("Listening at port 8000");
