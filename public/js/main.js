//--- This js includes all functionalities needed by socketBoard.html ---------
//--- @boyang


//---- First off, $(document).ready() must be singleton. More than one of it ---
//----- brings unexpected behaviour. ----------------
// And things that don't need the document to be ready, should not be inside document.ready
$(document).ready(function() {
	
	// get master arr from server, and display
	$.get("/masterArr", function(data) {
		// The problem with class is, there are some stuff that should be singleton
		// Here .eq(0) is just a failsafe. We should be careful
		var container = $('.messageBoard').eq(0);
		for (var i = 0; i < data.length; i++) {
			// TODO: differentiate post, answer, comment. Display accordingly
			displayPost(data[data.length - 1 - i], container);
		}
		console.log(data);
	});

	$(".newPostBtn").click(newPost);
}); // End of document.ready

// init socket
//like a persistent tube between client and server on directory '/'
window.socket = io.connect(":4321/");

function displayComment(data, container) {
	container.append($('<p class="comment">'+data.content+'</p>'));
}

// Displaying a post item on page using a post obj
// Container is a jquery obj
// Not sorted yet (but the db query result is sorted)!
function displayPost(data, container) {
	if (!data.content) {
		// The post must have content, else display what!
		return;
	}
	var masterPostDiv = $('<div class="masterPostDiv" data-msgid="' + data.id + '">');

	var textDiv = $('<div class="textDiv" data-msgid="' + data.id + '">');
	var txt = $("<p>" + "<span class='title'>" + data.title + "</span>" + data.content + "</p>");
	textDiv.append(txt);
	
	var commentsDiv = $('<div class="commentsDiv" data-msgid="' + data.id + '">');
	if (data.comments && data.comments.length > 0) {
		console.log('In displayPost');
		console.log('TODO display the comments');
		for (var i = 0; i < data.comments.length; i++) {
			displayComment(data.comments[i], commentsDiv);
		}
	}
	
	var voteDiv = $('<div class="voteDiv" data-msgid="' + data.id + '">');
	var upVoteBtn = $('<button class="upVoteBtn" >&#8743;</button>');
	var downVoteBtn = $('<button class="downVoteBtn" >&#8744;</button>');
	var votesDisplay = $('<span class="votes">0</span>');
	if (data.votecount) {
		votesDisplay.text(data.votecount);
	}
	upVoteBtn.click(upVote);
	downVoteBtn.click(downVote);
	voteDiv.append(upVoteBtn).append(downVoteBtn).append(votesDisplay);

	var commentDiv = $('<div class="commentDiv" data-msgid="' + data.id + '">');
	var commentInput = $('<input class="commentInput" type="text" placeholder="Comment this post"/>');
	var commentBtn = $('<button class="commentBtn">Add Comment</button>');
	commentBtn.click(newComment);
	commentDiv.append(commentInput).append(commentBtn);

	var ansDiv = $('<div class="ansDiv" data-msgid="' + data.id + '">');
	var ansInput = $('<input class="ansInput" type="text" placeholder="Answer this Question"/>');
	var ansBtn = $('<button class="ansBtn">Add Answer</button>');
	ansBtn.click(newAns);
	ansDiv.append(ansInput).append(ansBtn);

	var answersDiv = $('<div class="answersDiv" data-msgid="' + data.id + '">');
	if (data.answers && data.answers.length > 0) {
		console.log('In displayAns');
		for (var i = 0; i < data.answers.length; i++) {
			console.log('forloop');
			var answerDiv = $('<div class="answerDiv" data-msgid="' + data.answers[i].id + '">');
			var answer = $('<p class="answer" data-msgid="' + data.answers[i].id + '">' +
					data.answers[i].content + '</p>');

			var ansCommentDiv = $('<div class="ansCommentDiv" data-msgid="' + data.id + '">');
			var commentInput = $('<input class="commentInput" type="text" placeholder="Comment this post"/>');
			var commentBtn = $('<button class="commentBtn">Add Comment</button>');
			commentBtn.click(newComment);
			ansCommentDiv.append(commentInput).append(commentBtn);

			var ansVoteDiv = $('<div class="ansVoteDiv" data-msgid="' + data.answers[i].id + '">');
			var upVoteBtn = $('<button class="upVoteBtn" >&#8743;</button>');
			var downVoteBtn = $('<button class="downVoteBtn" >&#8744;</button>');
			var votesDisplay = $('<span class="votes">0</span>');
			if (data.answers[i].votecount) {
				votesDisplay.text(data.answers[i].votecount);
			}
			upVoteBtn.click(upVote);
			downVoteBtn.click(downVote);
			ansVoteDiv.append(upVoteBtn).append(downVoteBtn).append(votesDisplay);

			answerDiv
					.append(answer)
					.append(ansVoteDiv)
					.append(ansCommentDiv);
			answersDiv.prepend(answerDiv);
			console.log(answerDiv);
			console.log(ansVoteDiv);
		}
	}

	masterPostDiv
			.append(textDiv)
			.append(commentsDiv)
			.append(voteDiv)
			.append(commentDiv)
			.append(ansDiv)
			.append(answersDiv);
	container.prepend(masterPostDiv);
}

// These are emit handlers. When a signal sent received, 
// it will be piped into one of the handlers
//------ It's a good idea to avoid default "message" channel --------------
socket.on("post", function(data) { //event listener, when server sends message, do the below operation
	// The problem with class is, there are some stuff that should be singleton
	// Here .eq(0) is just a failsafe. We should be careful
	var container = $('.messageBoard').eq(0);
	displayPost(data, container);
});
socket.on("ans", function(data) {
	// Find the parent qn and prepend to it
	var parentQn = $('.masterPostDiv[data-msgid="' + data.parent_id + '"]');
	var answerDiv = $('<div class="answerDiv" data-msgid="' + data.id + '">');
	var answer = $('<p class="answer" data-msgid="' + data.id + '">' +
			data.content + '</p>');

	var ansCommentDiv = $('<div class="ansCommentDiv" data-msgid="' + data.id + '">');
	var commentInput = $('<input class="commentInput" type="text" placeholder="Comment this post"/>');
	var commentBtn = $('<button class="commentBtn">Add Comment</button>');
	commentBtn.click(newComment);
	ansCommentDiv.append(commentInput).append(commentBtn);

	var ansVoteDiv = $('<div class="ansVoteDiv" data-msgid="' + data.id + '">');
	var upVoteBtn = $('<button class="upVoteBtn" >&#8743;</button>');
	var downVoteBtn = $('<button class="downVoteBtn" >&#8744;</button>');
	var votesDisplay = $('<span class="votes">0</span>');
	if (data.votecount) {
		votesDisplay.text(data.votecount);
	}
	upVoteBtn.click(upVote);
	downVoteBtn.click(downVote);
	ansVoteDiv.append(upVoteBtn).append(downVoteBtn).append(votesDisplay);

	answerDiv
			.append(answer)
			.append(ansVoteDiv)
			.append(ansCommentDiv);
	$('.answersDiv', parentQn).prepend(answerDiv);
});
socket.on("comment", function(data) {
	console.log(data);
	var parent = $('.answerDiv[data-msgid="' + data.post_id + '"]' + ', .textDiv[data-msgid="' + data.post_id + '"]').eq(0);
	console.log(parent);
	parent.append();
});
socket.on('vote', function(postData) {
	console.log(postData);
	// Individual vote is useless. Just send a standard post obj from server
	if (postData.type == 0) {
		$('.masterPostDiv .voteDiv' + '[data-msgid="' + postData.id + '"]' + ' span.votes').text(postData.votecount);
	}
	else if (postData.type == 1) {
		console.log('received ans vote');
		$('.masterPostDiv[data-msgid="' + postData.parent_id + '"] .answersDiv .answerDiv[data-msgid="' + postData.id + '"] .ansVoteDiv span.votes').text(postData.votecount);
	}
});

// Here are the emit senders. Through some trigger, the page will send signals
// To the server
function upVote() {
	console.log('send out up vote');
	socket.emit('vote', {user_id: window.user.id, post_id: $(this).parent().attr("data-msgid"), type: 1});
}
function downVote() {
	socket.emit('vote', {user_id: window.user.id, post_id: $(this).parent().attr("data-msgid"), type: -1});
}
function newPost() {
	// The problem with class is, there are some stuff that should be singleton
	// Here .eq(0) is just a failsafe. We should be careful
	var msgTitle = $(".newPostDiv .newPostTitle").eq(0);
	var msgText = $(".newPostDiv .newPostText").eq(0);
	var owner_id = window.user.id;

	socket.emit("post", {
		owner_id: owner_id,
		title: msgTitle.val(),
		content: msgText.val(),
		type: 0, // Though not needed
	});

	msgTitle.val("");
	msgText.val("");
}
function newComment() {
	var input = $(this).siblings('.commentInput').eq(0);
	socket.emit('comment', {
		user_id: window.user.id,
		post_id: $(this).parent().attr('data-msgid'),
		content: input.val(),
	});
	input.val("");
}
function newAns() {
	var ansInput = $(this).siblings('.ansInput');
	socket.emit('ans', {
		parent_id: $(this).parent().attr('data-msgid'),
		content: ansInput.val(),
		owner_id: window.user.id,
	});
	ansInput.val("");
}