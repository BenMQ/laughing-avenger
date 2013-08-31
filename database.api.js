var mysql = require('mysql');

var pool = false;

var self = this;

var __QUESTION = 0;
var __ANSWER = 1;
var __UP = 1;
var __DOWN = -1;
var __NO = 0;
var __YES = 1;

/**
 * Initialise the db connection with a config object
 * @param  {Object} config configuration object that contains at least host, user and pass
 */
self.init = function(config) {
	console.log('init');
	pool = mysql.createPool(config);
}

/**
 * Internal function that process a query
 * @param  {string}   query query string
 * @param  {Function} next  callback that will be applied to result
 */
__query = function(query, next) {
	pool.getConnection(function(err, connection) {
		connection.query(query, function(err, result) {
			connection.end();
			if (err) throw err;
			next(result);
		});
	})
}

__insertQuery = function(query, values, next) {
	pool.getConnection(function(err, connection){
		connection.query(query, values, function(err, result) {
			connection.end();
			if (err) throw err;
			next(result.insertId);
		});

	})
}

__getTime = function() {
	return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
}
/**
 * Get a list of questions in a module, sorted in reverse chronological order
 * @param  {integer}   moduleId Module ID to query
 * @param  {integer}   limit    Number of results to return
 * @param  {integer}   offset   Offset from the first item
 * @param  {Function}  next     Callback in the form of function(result), where
 *                              result is an array of objects. Each row is returned
 *                              as an object with column name as field name
 */
self.getQuestions = function(moduleId, limit, offset, next) {
	var query = "SELECT * FROM post WHERE type = " + __QUESTION + " AND module_id = " + mysql.escape(moduleId)
				+ " ORDER BY timestamp DESC"
				+ " LIMIT " + mysql.escape(offset) + ', ' + mysql.escape(limit);
	__query(query, next);
}

/**
 * Get a specific question given its ID
 * @param  {integer}   questionId ID of the question to be retrieved
 * @param  {Function}  next       Callback in the form of function(result), where
 *                                result is an array of objects. Empty if ID doesn't
 *                                exist.
 */
self.getQuestion = function(questionId, next) {
	var query = "SELECT * FROM post WHERE type = " + __QUESTION
				+ " AND id = " + mysql.escape(questionId);
	__query(query, next);
}

self.getAnswers = function(questionId, limit, offset, next) {
	var query = "SELECT * FROM post WHERE type = " + __ANSWER
				+ " AND parent_id = " + mysql.escape(questionId);
	__query(query, next);
}

self.getAnswer = function(answerId, next) {
	var query = "SELECT * FROM post WHERE type = "  + __ANSWER
				+ " AND id = " + mysql.escape(answerId);
	__query(query, next);
}

self.getPost = function(postId, next) {
	var query = "SELECT * FROM post WHERE id = " + mysql.escape(postId);
	__query(query, next);
}


self.getComments = function(postId, limit, offset, next) {
	var query = "SELECT * FROM comment WHERE post_id = " + mysql.escape(postId)
				+ " LIMIT " + mysql.escape(offset) + ", " + mysql.escape(limit);
	__query(query, next);
}

self.getComment = function(id, next) {
	var query = "SELECT * FROM comment WHERE id = " + mysql.escape(id);
	__query(query, next);
}

/**
 * Creates a new question.
 * @param {integer}  user       ID of the user who created the question
 * @param {string}   title      Title of the question
 * @param {string}   content    Content of the question
 * @param {integer}  moduleId   The module this question belongs to
 * @param {boolean}  anonymous  Indicates if the post is anonymous
 * @param {Function} next       Callback. ID of the created question is provided.
 */
self.addQuestion = function(user, title, content, moduleId, anonymous, next) {
	var query = 'INSERT INTO post SET ?';
	anonymous = (anonymous ? __YES : __NO);
	var question = {owner_id: user, title: title, content: content, module_id: moduleId, anonymous: anonymous, type: __QUESTION};
	__insertQuery(query, question, next);
}

self.addAnswer = function(user, questionId, content, anonymous, next) {
	var query = 'INSERT INTO post SET ?';
	anonymous = (anonymous ? __YES : __NO);
	var answer = {owner_id: user, content: content, anonymous: anonymous, type: __ANSWER, parent_id: questionId};
	__insertQuery(query, answer, next);
}

self.addComment = function(user, postId, content, anonymous, next) {
	var query = 'INSERT INTO comment SET ?';
	anonymous = (anonymous ? __YES : __NO);
	var answer = {user_id: user, post_id: postId, content: content, anonymous: anonymous};
	__insertQuery(query, answer, next);
}

/**
 * Votes up a question
 * @param  {integer}  user   The user who voted
 * @param  {integer}  postId ID of the post the user voted for
 * @param  {Function} next   Callback. Boolean value will be provided
 */
self.voteUp = function(user, postId, next) {
	var query = 'INSERT INTO vote (user_id, post_id, type) VALUES('+mysql.escape([user, postId, __UP])+')'
				+ ' ON DUPLICATE KEY UPDATE type=VALUES(type)';
	__query(query, next);
}

self.voteDown = function(user, postId, next) {
	var query = 'INSERT INTO vote (user_id, post_id, type) VALUES('+mysql.escape([user, postId, __DOWN])+')'
				+ ' ON DUPLICATE KEY UPDATE type=VALUES(type)';
	__query(query, next);
}

self.voteCancel = function(user, postId, next) {
	var query = 'DELETE FROM vote WHERE user_id = ' + mysql.escape(user) + ' AND post_id = ' + mysql.escape(postId);
	__query(query, next);
}

/**
 * Gets the vote status of a user
 * @param  {integer}  user   The user to query
 * @param  {integer}  postId The post to query
 * @param  {Function} next   Callback. 1, -1 will be provided for up/down vote.
 *                           null if not voted
 */
self.getVote = function(user, postId, next) {
	var query = 'SELECT type FROM vote WHERE user_id = ' + mysql.escape(user) + ' AND post_id = ' + mysql.escape(postId);
	__query(query, function(result) {
		if (result) {
			next(result.type);
		} else {
			next(null);
		}
	})
}

self.getAllVotesByUser = function(user, next) {
	var query = 'SELECT * FROM vote WHERE user_id = ' + mysql.escape(user);
	__query(query, next);
}

/**
 * Select an answer as accepted.
 * @param  {integer}  answerId Answer to be accepted
 * @param  {Function} next     Callback, boolean to flag success/failure
 */
self.acceptAnswer = function(answerId, next) {
	var query = 'UPDATE post SET accepted_answer=' + mysql.escape(answerId)
				+ ' WHERE id=(SELECT parent_id FROM (SELECT * FROM post) p WHERE id=' + mysql.escape('answerId') + ')';
	__query(query, next);
}

self.cancelAnswer = function(answerId, next) {
	var query = 'UPDATE post SET accepted_answer=NULL'
				+ ' WHERE id=(SELECT parent_id FROM (SELECT * FROM post) p WHERE id=' + mysql.escape('answerId') + ')';
	__query(query, next);
}

self.close = function(postId, next) {
	var query = 'UPDATE post SET close_time=' + __getTime + ' WHERE id=' + mysql.escape(postId);
	__query(query, next);
}

self.reopen = function(postId, next) {
	var query = 'UPDATE post SET close_time=NULL WHERE id=' + mysql.escape(postId);
	__query(query, next);
}

self.updateUserInfo = function(fbid, fbUsername, picUrl, fbName, next) {
	var query = "INSERT INTO user (user_id , fb_username, fbpic_url, name) VALUES(" + mysql.escape([fbid, fbUsername, picUrl, fbName]) + ")"
				+ ' ON DUPLICATE KEY UPDATE fb_username=VALUES(fb_username), fbpic_url=VALUES(fbpic_url), name=VALUES(name)';
	__query(query, next);
}

self.getUserInfo = function(fbid, next) {
	var query = 'SELECT * FROM user WHERE user_id = ' + mysql.escape(fbid);
	__query(query, next);
}

/**
 * Get all votes casted by the user
 * @param  {integer}  user fbid of the user
 * @param  {Function} next callback, a list of objects with post_id and type property (+/- 1 for up/down vote) 
 */
self.getVotes = function(user, next) {
	var query = 'SELECT post_id, type FROM vote WHERE user_id = ' + mysql.escape(user);
	__query(query, next);
}

/**
 * Get the vote of user for a particular post
 * @param  {integer}  user  fbid of the user
 * @param  {integer}  post  post id to query
 * @param  {Function} next  callback, contains the type property if a vote is found. 
 */
self.getVoteByPost = function(user, post, next) {
	var query = 'SELECT type FROM vote WHERE user_id = ' + mysql.escape(user) + ' AND post_id = ' + mysql.escape(post);
	__query(query, next);
}

self.createModule = function(title, description, next) {
	var query = 'INSERT INTO module (title, description) VALUES("' + mysql.escape([title, description]) + '")';
	__insertQuery(query, next);
}

self.getAllModules = function(next) {
	var query = 'SELECT * FROM module';
	__query(query, next);
}

self.getModulesByUser = function(user, moduleId, next) {
	var query = 'SELECT * FROM module m WHERE EXISTS '
				+ '(SELECT * FROM enrollment WHERE user_id = ' + mysql.escape(user) + 'module_id = m.id)';
	__query(query, next);
}

self.enroll = function(user, moduleId, next) {
	var query = 'INSERT INTO enrollment (user_id, module_id) VALUES(' + mysql.escape([user, moduleId]) + ')';
	__query(query, next);
}

// opposite to enroll
self.withdraw = function(user, moduleId, next) {
	var query = 'DELETE FROM enrollment WHERE user_id = ' + mysql.escape(user) + ' AND module_id = ' mysql.escape(moduleId) + ')';
	__query(query, next); 
}


self.addManager = function(user, moduleId, next) {
	var query = 'INSERT INTO enrollment (user_id, module_id, is_manager) VALUES(' + mysql.escape([user, moduleId, __YES]) + ')'
				+ ' ON DUPLICATE KEY UPDATE is_manager=VALUES(is_manager)';
	__query(query, next);
}

self.removeManager = function(user, moduleId, next) {
	var query = 'UPDATE enrollment SET is_manager = ' + __NO + ' WHERE user_id = ' + mysql.escape(user)
			 	+ ' AND module_id = ' mysql.escape(moduleId);
	__query(query, next);
}