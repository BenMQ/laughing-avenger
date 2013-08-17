var http = require("http");

var requestHandler = function (request, response) {
	console.log("Received request!");
	response.writeHead(200);
	response.write("<h1>Hello world</h1>");
	response.end();
};

var server = http.createServer(requestHandler);
server.listen(8000);
console.log("Server listening on port 8000");
