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

self.getQuestions = function(limit, offset, next) {
	console.log("got a question");
}

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

self.addQuestion = function(user, title, content, next) {

}

self.addAnswer = function(user, questionId, content, next) {

}

self.addComment = function(user, postId, content, next) {

}

self.voteUp = function(user, postId, next) {

}

self.voteDown = function(user, postId, next) {

}

self.voteCancel = function(user, postId, next) {

}

self.acceptAnswer = function(answerId, next) {

}

self.close = function(postId, next) {

}

self.reopen = function(postId, next) {

}
