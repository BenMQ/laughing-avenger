var express = require("express");
var connect = require('connect')
var graph = require('fbgraph');
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var routes = require('./routes');
var db = require('./database.api.js');
var config = require("./config/config.js");
var cookie = require('cookie');
var store = new express.session.MemoryStore();
var passport = require('passport')
		, FacebookStrategy = require('passport-facebook').Strategy;

var magicModuleId = 1; // cs1231

app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(parseCookie = express.cookieParser(config.SECRET_KEY));
app.use(express.session({
	secret: config.SECRET_KEY,
	key: config.AUTH_COOKIE_NAME, //session key for user auth cookie
	store: store,
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
    	console.log(profile);
    	var usr = {id:profile.id, username:profile.username, displayName:profile.displayName}

        graph.setAccessToken(accessToken);
    	// console.log(user);
    	return done(null, usr);
    });
  }
));

// Wrapper auth function
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect("/");
    }
}

app.get("/", routes.index);
app.get("/main", ensureAuthenticated, routes.main);
app.get('/masterArr', function(req, res) {
	res.json(masterArr);
});
app.get('/auth/facebook',
		passport.authenticate('facebook'),
		routes.postAuthenticate);
app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {failureRedirect: '/loginError'}),
function(req, res) {
	// Successful authentication, redirect home.
	console.log("Auth success!");
	//access sessionID and user after login success
	// console.log(req.sessionID);
	// console.log(req.session.passport); //retrieve passport's user ID
	res.redirect('/dashboard');
});
app.get('/loginError', routes.loginError);
app.get('/logout', routes.logout);

app.get('/dashboard', ensureAuthenticated,
    function(req,res){
	    db.getUserInfo(req.user.id,
		    function(db_user){
			    res.render('dashboard', { user: req.user, fbpic:db_user[0].fbpic_url });
		}
	)}
);

app.get('/friends', ensureAuthenticated, function(req, res) {
	var query = "SELECT uid, username, name, pic_square FROM user WHERE uid in(SELECT uid2 FROM friend WHERE uid1 = me() LIMIT 0,150)"
	graph.fql(query, function(err, fdata) {
        var app_friends = [];
        db.getAllUsers(function(db_users){
            db.compute_intersection(db_users, fdata.data, function(err, app_friends){
                if (err) {
                    console.log(err);
                } else {
                    console.log(app_friends);
                }
                res.render("invite", {app_friends: app_friends, to_invite_friends: fdata.data});
            })
        });
	});
});

// Test Open Graph Story
app.get('/question/:questionId', function(req, res) {
	db.getQuestion(req.params.questionId, function(result) {
		if (result.length) {
			res.render('post', {content: result[0]});
		} else {
			res.redirect('/main');
		}
	})
});


// need to pass in :moduleCode as magic
app.get('/modules/:moduleTitle', ensureAuthenticated,function(req,res){
	// 1. render the page, providing mod basic info
	db.getModuleByTitle(req.params.moduleTitle,function(result){
		console.log("MODULE: " +result);
		if (result.length && result[0]) {
			res.render('socketBoard', {user: req.user, module:result[0]});
		} else {
			res.redirect('/main');
		}
	});
});


// master of the masters, array of arrays.
// Introducing masterArrMod, for the sake of modules

var masterArrMod = [];
db.init(config.db);
console.log('db module init!');

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


var db_limit = 10; // How many qns do you want in one page?
var db_offset = 0; // TODO: multipage thingy

db.getQuestions(magicModuleId,db_limit, db_offset, function(results) {
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
console.log("!!!!!!!!!!!!!!!!master");
console.log(masterArr);

// For server side, emit sender and handler almost always together
// The flow is: 1. Received emit from client 2. Push to masterArr
//				3. Store to db 4. emit a signal to all client

io.sockets.on("connection", function(socket) { //general handler for all socket connection events
	console.log('socket connected!')
	var cookies = cookie.parse(socket.handshake.headers.cookie);

	//console.log(cookies['express.sid']);
	var session_id = connect.utils.parseSignedCookie(
	                    cookies[config.AUTH_COOKIE_NAME], config.SECRET_KEY)

	console.log("parsed session_id:" + session_id);

	store.get(session_id, function(err, session) {
		console.log('Retrieving user info from session store using auth cookie');
		//console.log(session);

		if (session) {
			var user_cookie = session.passport.user;
			//console.log(user_cookie);

			// Example:
			// user_cookie = { id: '100003334235610',
			// 				username: 'yos.riady',
			// 				displayName: 'Yos Riady' }

			user_cookie.id = parseInt(user_cookie.id);

			// side track a little. Here we retrieve all the votes from this
			// specific user. It needs to be here because we need id
			db.getVotes(user_cookie.id, function(data) {
				socket.emit('userVotes', data);
			});

			user_cookie.picurl = '';

			// retrieve user fbpic url
			var query="SELECT pic_big FROM user WHERE uid=me()";
			graph.fql(query, function(err, fdata) {
				console.log(fdata.data[0].pic_big);
				user_cookie.picurl = fdata.data[0].pic_big; // { picture: 'http://profile.ak.fbcdn.net/'... }

				//here need to check and create user
				db.updateUserInfo(user_cookie.id, user_cookie.username, user_cookie.picurl, user_cookie.displayName, function() {
				});
			});

			socket.user_cookie = user_cookie; //attach cookie to socket object
		}
	});

	socket.on("comment", function(data) {
		db.addComment(socket.user_cookie.id, data.post_id, data.content, false, function(id) {
			db.getComment(id, function(results) {
				if (results[0]) {
					var cur_post = masterArr.findPost(results[0].post_id);
					if (cur_post) {
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
		db.addAnswer(socket.user_cookie.id, data.parent_id, data.content, false, function(id) {
			db.getAnswer(id, function(results) {
				if (results[0]) {
					for (var i = 0; i < masterArr.length; i++) {
						// Find the question which this answer belongs to
						if (masterArr[i].id == results[0].parent_id) {
							masterArr[i].answers.push(results[0]);
							masterArr[i].answers[masterArr[i].answers.length - 1].comments = [];
							io.sockets.emit('ans', results[0]);
							break;
						}
					}
				}
			});
		});
	});

	socket.on("post", function(data) {
		db.addQuestion(socket.user_cookie.id, data.title, data.content, magicModuleId, false, function(id) {
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

	socket.on('rmVote', function(clientVote) {

		db.voteCancel(socket.user_cookie.id, clientVote.post_id, function(results) {
			console.log("cancel vote");
			db.getPost(clientVote.post_id, function(results) {
				if (results[0]) {
					var curPost = masterArr.findPost(results[0].id);
					if (curPost) {
						curPost.votecount = results[0].votecount;
					}
					io.sockets.emit('vote', results[0]);
				}
			});
		});
	});

});

server.listen(config.port);//"dev.fragen.cmq.me"
console.log("Express is listening on port " + config.port);
