var mysql = require('mysql');

var pool = false;

var self = this;

var __QUESTION = 0;
var __ANSWER = 1;
var __UP = 1;
var __DOWN = -1;

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
 * Get a list of questions, sorted in reverse chronological order
 * @param  {integer}   limit  Number of results to return
 * @param  {integer}   offset Offset from the first item
 * @param  {Function}  next   Callback in the form of function(result), where
 *                            result is an array of objects. Each row is returned
 *                            as an object with column name as field name
 */
self.getQuestions = function(limit, offset, next) {
	var query = "SELECT * FROM post WHERE type = " + __QUESTION
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
 * @param {integer}  user    ID of the user who created the question
 * @param {string}   title   Title of the question
 * @param {string}   content Content of the question
 * @param {Function} next    Callback. ID of the created question is provided.
 */
self.addQuestion = function(user, title, content, next) {
	var query = 'INSERT INTO post SET ?';
	var question = {owner_id: user, title: title, content: content, type: __QUESTION};
	__insertQuery(query, question, next);
}

self.addAnswer = function(user, questionId, content, next) {
	var query = 'INSERT INTO post SET ?';
	var answer = {owner_id: user, content: content, type: __ANSWER, parent_id: questionId};
	__insertQuery(query, answer, next);
}

self.addComment = function(user, postId, content, next) {
	var query = 'INSERT INTO comment SET ?';
	var answer = {user_id: user, post_id: postId, content: content};
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
