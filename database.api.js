var mysql = require('mysql');

var connection = false;

var self = this;

/**
 * Initialise the db connection with a config object
 * @param  {Object} config configuration object that contains at least host, user and pass
 */
self.init = function(config) {
	connection = mysql.createConnection(config);
}

/**
 * Internal function that process a query
 * @param  {string}   query query string
 * @param  {Function} next  callback that will be applied to result
 */
_query = function(query, next) {
	connection.query(query, function(err, result) {
		if (err) throw err;
		next(result);
	})
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
	var query = "SELECT * from post ORDER BY timestamp DESC LIMIT " + mysql.escape(offset + ', ' + limit);
	_query(query, next);
}

/**
 * Get a specific question given its ID
 * @param  {integer}   questionId ID of the question to be retrieved
 * @param  {Function}  next       Callback in the form of function(result), where
 *                                result is an array of objects. Empty if ID doesn't
 *                                exist.
 */
self.getQuestion = function(questionId, next) {

}

self.getAnswers = function(questionId, limit, offset, next) {

}

self.getAnswer = function(answerId, next) {

}

self.getComments = function(postId, limit, offset, next) {

}

self.getComment = function(id, next) {

}

/**
 * Creates a new question.
 * @param {integer}  user    ID of the user who created the question
 * @param {string}   title   Title of the question
 * @param {string}   content Content of the question
 * @param {Function} next    Callback. ID of the created question is provided.
 */
self.addQuestion = function(user, title, content, next) {

}

self.addAnswer = function(user, questionId, content, next) {

}

self.addComment = function(user, postId, content, next) {

}

/**
 * Votes up a question
 * @param  {integer}  user   The user who voted
 * @param  {integer}  postId ID of the post the user voted for
 * @param  {Function} next   Callback. Boolean value will be provided
 */
self.voteUp = function(user, postId, next) {

}

self.voteDown = function(user, postId, next) {

}

self.voteCancel = function(user, postId, next) {

}

/**
 * Gets the vote status of a user
 * @param  {integer}  user   The user to query
 * @param  {integer}  postId The post to query
 * @param  {Function} next   Callback. 1, 0 will be provided for up/down vote.
 *                           null if not voted
 */
self.getVote = function(user, postId, next) {

}

/**
 * Select an answer as accepted.
 * @param  {integer}  answerId Answer to be accepted
 * @param  {Function} next     Callback, boolean to flag success/failure
 */
self.acceptAnswer = function(answerId, next) {

}

self.close = function(postId, next) {

}

self.reopen = function(postId, next) {

}
