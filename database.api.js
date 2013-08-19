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

self.getQuestions = function(limit, offset) {
	console.log("got a question");
}

self.getQuestion = function(questionId) {

}

self.getAnswers = function(questionId, limit, offset) {

}

self.getAnswer = function(answerId) {

}

self.getComments = function(postId, limit, offset) {

}

self.getComment = function(id) {

}

self.addQuestion = function(user, title, content) {

}

self.addAnswer = function(user, questionId, content) {

}

self.addComment = function(user, postId, content) {

}

self.voteUp = function(user, postId) {

}

self.voteDown = function(user, postId) {

}

self.voteCancel = function(user, postId) {

}

self.acceptAnswer = function(answerId) {

}

self.close = function(postId) {

}

self.reopen = function(postId) {

}
