var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var routes = require('./routes');
var db = require('./database.api.js');
var config = require("./config/config.js");
var cookie = require('cookie');
var store  = new express.session.MemoryStore();
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + '/public'));
app.use(parseCookie = express.cookieParser(config.SECRET_KEY));
app.use(express.session({
	secret: config.SECRET_KEY,
    key: config.AUTH_COOKIE_NAME, //session key for user auth cookie
    store:store,
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: config.FACEBOOK_APP_ID,
    clientSecret: config.FACEBOOK_APP_SECRET,
    callbackURL: config.FBAUTH_CALLBACK_URL
  },

  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
    	// console.log(profile);
    	var usr = {id:profile.id, username:profile.username, displayName:profile.displayName}
    	// console.log(user);
    	return done(null, usr);
    });
  }
));

// Auth routes
app.get("/", routes.index);
app.get("/main", routes.main);

app.get('/masterArr', function(req, res) {
	res.json(masterArr);
});
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  routes.postAuthenticate);
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/loginError'}),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("Auth success!");
    //access sessionID and user after login success
    // console.log(req);
    // console.log(req.sessionID);
    // console.log(req.session.passport); //retrieve passport's user ID

    res.redirect('/main');
  });
app.get('/loginError', routes.loginError);
app.get('/logout', routes.logout);
// app.get('/classes/:moduleCode', routes.modulePage);
// app.get('/dashboard', routes.dashBoard);

// Introducing master arr, where we store all data
var masterArr = [];
masterArr.findPost = function(id) {
	for (var i = 0; i < masterArr.length; i++) {
		if (masterArr[i].id == id) {
			return masterArr[i];
		}
		for (var j = 0; j < masterArr[i].answers.length; j++) {
			if (masterArr[i].answers[j].id == id) {
				return masterArr[i].answers[j];
			}
		}
	}
}

// Init db
// Retrieve posts from mysql db and push to masterArr
db.init(config.db);
console.log('db module init!');

var db_limit = 10; // How many qns do you want in one page?
var db_offset = 0; // TODO: multipage thingy
db.getQuestions(10, 0, function(results) {
	for (var i = 0; i < results.length; i++) {
		// console.log(results[i]);
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
	console.log('socket connected!')

	var cookies = cookie.parse(socket.handshake.headers.cookie);
	// console.log(cookies);

	// console.log(cookies['express.sid']);
	var c = cookies[config.AUTH_COOKIE_NAME];
	var session_id = c.substring(c.indexOf(':')+1,c.indexOf('.'));

	console.log("parsed session_id:" + session_id);

	store.get(session_id, function(err, session) {
        console.log('Retrieving user info from session store using auth cookie');
        console.log(session);

        if(session){
        	var user_cookie = session.passport.user;
        	console.log(user_cookie);

        	// Example:
        	// user_cookie = { id: '100003334235610',
        	// 				username: 'yos.riady',
        	// 				displayName: 'Yos Riady' }

        	user_cookie.id = parseInt(user_cookie.id);

        	//here need to check and create user
        	db.updateUserInfo(user_cookie.id, user_cookie.username, "", user_cookie.displayName, function(){})



        	socket.user_cookie = user_cookie; //attach cookie to socket object
        }
    });


	socket.on("comment", function(data) {
		db.addComment(socket.user_cookie.id, data.post_id, data.content, function(id) {
			console.log('enter 1');
			db.getComment(id, function(results) {
				console.log('enter 2');
				if (results[0]) {
					console.log('enter 3');
					console.log(results);
					var cur_post = masterArr.findPost(results[0].post_id);
					if (cur_post) {
						console.log('enter 4');
						if (cur_post.comments) {
							cur_post.comments.push(results[0]);
						}
						else {
							cur_post.comments = [];
							cur_post.comments.push(results[0]);
						}
						io.sockets.emit('comment', results[0]);
					}
				}
			});
		});
	});

	socket.on("ans", function(data) {
		db.addAnswer(socket.user_cookie.id, data.parent_id, data.content, function(id) {
			db.getAnswer(id, function(results) {
				if (results[0]) {
					for (var i = 0; i < masterArr.length; i++) {
						// Find the question which this answer belongs to
						if (masterArr[i].id == results[0].parent_id) {
							masterArr[i].answers.push(results[0]);
							masterArr[i].answers[masterArr[i].answers.length-1].comments=[];
							io.sockets.emit('ans', results[0]);
							break;
						}
					}
				}
			});
		});
	});

	socket.on("post", function(data) {
		db.addQuestion(socket.user_cookie.id, data.title, data.content, function(id) {
			db.getQuestion(id, function(results) {
				if (results[0]) {
					masterArr.push(results[0]);
					masterArr[masterArr.length - 1].answers = [];
					masterArr[masterArr.length - 1].comments = [];
					io.sockets.emit('post', results[0]);
				}
			});
		});
	});

	socket.on('vote', function(clientVote) {
		console.log(clientVote);
		if (clientVote.type == 1) {
			db.voteUp(socket.user_cookie.id, clientVote.post_id, function(result) {
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
			db.voteDown(socket.user_cookie.id, clientVote.post_id, function(result) {
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
