var express = require("express");
var app = express();

app.use(express.bodyParser());

app.get("/", function (req, res) {
	res.sendfile("messageBoard.html");
});

var messages = [];

app.get("/messages", function (req, res) {
	console.log("Got request for all messages");
	res.json(messages);
});

app.post("/message", function (req, res) {
	var text = req.body.msgText;
	console.log("Received message " + text);
	messages.push(text);
	res.end();
});

app.listen(8000);
console.log("Express is listening on port 8000");
