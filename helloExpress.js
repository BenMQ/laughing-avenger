var express = require("express");
var app = express();


app.use(express.bodyParser());





app.get("/", function (req, res) {
	res.sendfile('messageboard.html');
});



app.post('/message', function(req,res){
	console.log(req.body)
	console.log('POST received!');
	res.end() //Can you clarify why you have to end the response?
})











app.listen(8000);
console.log("Express is listening on port 8000");
