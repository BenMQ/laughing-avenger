var express = require("express");
var app = express();
app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + '/public'));
app.use(express.cookieParser());
app.use(express.session({ secret: 'fragen' }));

var FACEBOOK_APP_ID = "492242497533605";
var FACEBOOK_APP_SECRET = "c7fdfdb90ef722119f78eb0476e64de2";
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://dev.fragen.cmq.me:4321/auth/facebook/callback"
  },

  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
    	// console.log(profile);
    	var user = {id:profile.id, username:profile.username, displayName:profile.displayName}
    	// console.log(user);
    	return done(null, user);
    });
  }
));

var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var routes = require('./routes');
var config = require("./config/config.js");

// Routes, refactored to routes/index.js
app.get("/", routes.main);
app.get('/masterArr', function(req, res) {
    res.json(masterArr);
});
// app.get('/classes/:moduleCode', routes.modulePage);
// app.get('/dashboard', routes.dashBoard);


// Auth routes
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("Auth success!");
    res.redirect('/');
  });
app.get('/login', routes.login);
app.get('/logout', routes.logout);
// End of auth routes

// Introducing master arr, where we store all data
var masterArr = [];
masterArr.findPost = function(id) {
	for (var i=0; i<masterArr.length; i++) {
		if (masterArr[i].id == id) {
			return masterArr[i];
		}
		for (var j=0; j<masterArr[i].answers.length; j++) {
			if (masterArr[i].answers[j].id == id) {
				return masterArr[i].answers[j];
			}
		}
	}
}


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
			// load answers of cur qn
			db.getAnswers(cur_result.id, db_limit, db_offset, function(answers) {
				for (var j = 0; j < answers.length; j++) {
					masterArr[i].answers.push(answers[j]);
					// load comments of cur ans
					masterArr[i].answers[j].comments = [];
					(function(i, j, cur_ans) {
						db.getComments(cur_ans.id, db_limit, db_offset, function(comments) {
							for (var k = 0; k < comments.length; k++) {
								masterArr[i].answers[j].comments.push(comments[k]);
							}
						});
					})(i, j, answers[j]);
				}
			});
		})(i, results[i]);
		// load comments of cur qn
		masterArr[i].comments = [];
		(function(i, cur_result) {
			db.getComments(cur_result.id, db_limit, db_offset, function(comments) {
				for (var j = 0; j < comments.length; j++) {
					masterArr[i].comments.push(comments[j]);
				}
			});
		})(i, results[i]);
	}
});

// For server side, emit sender and handler almost always together
// The flow is: 1. Received emit from client 2. Push to masterArr
//				3. Store to db 4. emit a signal to all client

io.sockets.on("connection", function(socket) { //general handler for all socket connection events
	socket.on("comment", function(data) {
		db.addComment(data.user_id, data.post_id, data.content, function(id) {
			db.getComment(id, function(results) {
				if (results[0]) {
					for (var i = 0; i < masterArr.length; i++) {

						// Find the post which this comment belongs to
						if (masterArr[i].id == results[0].post_id) {
							masterArr[i].answers.push(results[0]);
							io.sockets.emit('ans', results[0]);
							break;
						}
					}
				}
			});
		});
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
					masterArr[masterArr.length - 1].answers = [];
					io.sockets.emit('post', results[0]);
				}
			});
		});
	});
	socket.on('vote', function(clientVote) {
		console.log(clientVote);
		if (clientVote.type == 1) {
			db.voteUp(clientVote.user_id, clientVote.post_id, function(result) {
				if (result) {
					db.getPost(clientVote.post_id, function(results) {
						if (results[0]) {
							var curPost = masterArr.findPost(results[0].id);
							if (curPost) {
								curPost.votecount = results[0].votecount;
							}
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
							var curPost = masterArr.findPost(results[0].id);
							
							if (curPost) {
								console.log('enter votecount update');
								curPost.votecount = results[0].votecount;
							}
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
