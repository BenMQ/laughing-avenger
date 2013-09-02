//--- This js includes all functionalities needed by socketBoard.html ---------
//--- @boyang


//---- First off, $(document).ready() must be singleton. More than one of it ---
//----- brings unexpected behaviour. ----------------
// And things that don't need the document to be ready, should not be inside document.ready
$(document).ready(function() {
	// Our obj, horray!
	// Nothing much stored there, though
	window.fragen = {};
	
	// get master arr from server, and display
	$.get("/masterArr", function(data) {
		// The problem with class is, there are some stuff that should be singleton
		// Here .eq(0) is just a failsafe. We should be careful
		init(data);
//		relocateMessageBoard();
//		addCustomScrollBar();
	});


	$(".newPostBtn").click(newPost);
	$(".messageBoard .masterPostDiv").tsort({order: 'desc', attr: 'data-timestamp'});

	$(".sortByTime").click(function() {
		if (window.fragen && window.fragen.sortByTime) {
			clearInterval(window.fragen.sortByTime);
		}
		if (window.fragen && window.fragen.sortByVotes) {
			clearInterval(window.fragen.sortByVotes);
		}
		$(this).toggleClass("acting");
		if ($(this).hasClass("acting")) {
			$(".sortByVotes").removeClass("acting");
			$(".messageBoard .masterPostDiv").tsort({order: 'desc', attr: 'data-timestamp'});
			sortAns();
			window.fragen.sortByTime = setInterval(function() {
				console.log("auto by time hahaha");
				$(".messageBoard .masterPostDiv").tsort({order: 'desc', attr: 'data-timestamp'});
				sortAns();
			}, 5000);
		}
	});
	$("button.sortByVotes").click(function() {
		if (window.fragen && window.fragen.sortByTime) {
			clearInterval(window.fragen.sortByTime);
		}
		if (window.fragen && window.fragen.sortByVotes) {
			clearInterval(window.fragen.sortByVotes);
		}
		$(this).toggleClass('acting');
		if ($(this).hasClass("acting")) {
			$(".sortByTime").removeClass("acting");
			$(".messageBoard .masterPostDiv").tsort('.voteDiv span.votes', {order: 'desc'}, {order: 'desc', attr: 'data-timestamp'});
			sortAns();
			window.fragen.sortByVotes = setInterval(function() {
				console.log("auto by votes hahaha");
				$(".messageBoard .masterPostDiv").tsort('.voteDiv span.votes', {order: 'desc'}, {order: 'desc', attr: 'data-timestamp'});
				sortAns();
			}, 5000);
		}
		return false;
	});
}); // End of document.ready

function relocateMessageBoard() {
	var newboard = $("#qn-view > .mCustomScrollBox"); //> .mCSB_container
	console.log(newboard);
	$(".messageBoard").removeClass("messageBoard");
	newboard.addClass("messageBoard");
}

function sortAns() {
	$(".messageBoard .masterPostDiv .answersDiv .answerDiv").tsort('.ansVoteDiv span.votes', {order: 'desc'}, {order: 'desc', attr: 'data-msgid'});
}

function init(masterArr) {
	var container = $('.messageBoard').eq(0);
	for (var i = masterArr.length - 1; i >= 0; i--) {
		// TODO: differentiate post, answer, comment. Display accordingly
		displayPost(masterArr[masterArr.length - 1 - i], container, false);
	}
	console.log(JSON.stringify(masterArr));
}

function initVotes(data) {
	for (var i = 0; i < data.length; i++) {
		var vote = data[i];
		var votediv = $('.masterPostDiv[data-msgid="' + vote.post_id + '"] .voteDiv, ' + '.answerDiv[data-msgid="' + vote.post_id + '"] .ansVoteDiv');
		console.log(votediv);
		if (vote.type == 1) {

			$('.upVoteBtn', votediv).addClass("selected-pos");
		}
		else {

			$('.downVoteBtn', votediv).addClass("selected-neg");
		}
	}
}

// init socket
//like a persistent tube between client and server on directory '/'
window.socket = io.connect(":4321/");

function displayComment(data, container, blink) {
	var com = $('<span class="comment">' + data.content + '</span>');
	container.append(com);
	if (blink) {
		myBlink(com);
	}
}

function displayAns(data, container, blink) {
	var answerDiv = $('<div class="answerDiv" data-msgid="' + data.id + '">');
	var textDiv = $('<div class="testDiv chat-bubble-answer" data-msgid="' + data.id + '">');
	var answer = $('<p class="answer answer-body" data-msgid="' + data.id + '">' +
			data.content + '</p>');

	var commentsDiv = $('<div class="commentsDiv" data-msgid="' + data.id + '">');
	if (data.comments && data.comments.length > 0) {
		for (var j = 0; j < data.comments.length; j++) {
			displayComment(data.comments[j], commentsDiv, false);
		}
	}

	
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

	textDiv.append(answer).append(commentsDiv);

	answerDiv
			.append(textDiv)
			.append(ansVoteDiv)
			.append(ansCommentDiv);
	container.prepend(answerDiv);
	
	if (blink) {
		myBlink(answerDiv);
	}
}

// Displaying a post item on page using a post obj
// Container is a jquery obj
// Not sorted yet (but the db query result is sorted)!
function displayPost(data, container, blink) {
	var masterPostDiv = $('<div class="masterPostDiv panel panel-default" data-timestamp="' + data.timestamp + '" data-msgid="' + data.id + '">'); //data-votes="'+data.votecount+'" '+'
	var qnPanelHeading = $('<div class="qn-Panel panel-heading">');
	var qntitle = $('<h3 class="qn-title panel-title"><a>'+data.title+'</a></h3>');
	var clearfix = $('<div class="stats clearfix">');
	
	qnPanelHeading.append(qntitle).append(clearfix);
	var textDiv = $('<div class="chat-bubble-question textDiv" data-msgid="' + data.id + '">');
	var txt;
	if (data.content) {
		txt = $("<h4 class='title'>" + data.title + "</h4>" + "<p>"+data.content + "</p>");
	}
	else {
		txt = $("<h4 class='title'>" + data.title + "</h4><p></p>");
	}
	textDiv.append(txt);

	var qnCommentsDiv = $('<div class="commentsDiv" data-msgid="' + data.id + '">');
	if (data.comments && data.comments.length > 0) {
		for (var i = 0; i < data.comments.length; i++) {
			displayComment(data.comments[i], qnCommentsDiv, false);
		}
	}

	textDiv.append(qnCommentsDiv);

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
		for (var i = 0; i < data.answers.length; i++) {
			displayAns(data.answers[i], answersDiv, false);
		}
	}

	masterPostDiv
			.append(qnPanelHeading)
			.append(textDiv)
//			.append(qnCommentsDiv)
			.append(voteDiv)
			.append(commentDiv)
			.append(ansDiv)
			.append(answersDiv);
	container.prepend(masterPostDiv);
	if (blink) {
		myBlink(masterPostDiv);
	}
}

// These are emit handlers. When a signal sent received,
// it will be piped into one of the handlers
//------ It's a good idea to avoid default "message" channel --------------
socket.on("post", function(data) { //event listener, when server sends message, do the below operation
	// The problem with class is, there are some stuff that should be singleton
	// Here .eq(0) is just a failsafe. We should be careful
	var container = $('.messageBoard').eq(0);
//	console.log(container);
//	console.log(data);
	displayPost(data, container, true);
});
socket.on("ans", function(data) {
	// Find the parent qn and prepend to it
	var parentQn = $('.masterPostDiv[data-msgid="' + data.parent_id + '"]');
	var container = $('.answersDiv', parentQn);
	
	displayAns(data, container, true);
	
//	var answerDiv = $('<div class="answerDiv" data-msgid="' + data.id + '">');
//	var answer = $('<p class="answer" data-msgid="' + data.id + '">' +
//			data.content + '</p>');
//
//	var commentsDiv = $('<div class="commentsDiv" data-msgid="' + data.id + '">');
//	if (data.comments && data.comments.length > 0) {
//		for (var j = 0; j < data.comments.length; j++) {
//			displayComment(data.comments[j], commentsDiv, false);
//		}
//	}
//
//	var ansCommentDiv = $('<div class="ansCommentDiv" data-msgid="' + data.id + '">');
//	var commentInput = $('<input class="commentInput" type="text" placeholder="Comment this post"/>');
//	var commentBtn = $('<button class="commentBtn">Add Comment</button>');
//	commentBtn.click(newComment);
//	ansCommentDiv.append(commentInput).append(commentBtn);
//
//	var ansVoteDiv = $('<div class="ansVoteDiv" data-msgid="' + data.id + '">');
//	var upVoteBtn = $('<button class="upVoteBtn" >&#8743;</button>');
//	var downVoteBtn = $('<button class="downVoteBtn" >&#8744;</button>');
//	var votesDisplay = $('<span class="votes">0</span>');
//	if (data.votecount) {
//		votesDisplay.text(data.votecount);
//	}
//	upVoteBtn.click(upVote);
//	downVoteBtn.click(downVote);
//	ansVoteDiv.append(upVoteBtn).append(downVoteBtn).append(votesDisplay);
//
//	answerDiv
//			.append(answer)
//			.append(ansVoteDiv)
//			.append(commentsDiv)
//			.append(ansCommentDiv);
//	$('.answersDiv', parentQn).prepend(answerDiv);
//	myBlink(answerDiv);
});
socket.on("comment", function(data) {
	var parent = $('.answerDiv[data-msgid="' + data.post_id + '"] .commentsDiv' + ', .masterPostDiv[data-msgid="' + data.post_id + '"] .commentsDiv').eq(0);
	displayComment(data, parent, true);
});
socket.on('vote', function(postData) {
	// Individual vote is useless. Just send a standard post obj from server
	if (postData.type == 0) {
		$('.masterPostDiv .voteDiv' + '[data-msgid="' + postData.id + '"]' + ' span.votes').text(postData.votecount);

	}
	else if (postData.type == 1) {
		$('.masterPostDiv[data-msgid="' + postData.parent_id + '"] .answersDiv .answerDiv[data-msgid="' + postData.id + '"] .ansVoteDiv span.votes').text(postData.votecount);
	}
});
socket.on("userVotes", function(data) {
	console.log("!!got emit!");
	console.log(data);
	initVotes(data);
});

// Here are the emit senders. Through some trigger, the page will send signals
// To the server
function upVote() {
	if ($(this).hasClass("selected-pos")) {
		socket.emit('rmVote', {
			post_id: $(this).parent().attr("data-msgid"),
		});
	}
	else {
		socket.emit('vote', {
			// user_id: window.user.id,
			post_id: $(this).parent().attr("data-msgid"),
			type: 1
		});
	}
	$(this).toggleClass("selected-pos");
}
function downVote() {
	if ($(this).hasClass("selected-neg")) {
		socket.emit('rmVote', {
			post_id: $(this).parent().attr("data-msgid"),
		});
	}
	else {
		socket.emit('vote', {
			// user_id: window.user.id,
			post_id: $(this).parent().attr("data-msgid"),
			type: -1
		});
	}
	$(this).toggleClass("selected-neg");
}
function newPost() {
	// The problem with class is, there are some stuff that should be singleton
	// Here .eq(0) is just a failsafe. We should be careful
	var msgTitle = $(".newPostDiv .newPostTitle").eq(0);
	var msgText = $(".newPostDiv .newPostText").eq(0);
	// var owner_id = window.user.id;
	if (msgTitle.val() === "") {
		alert("Please input question title!");
		return;
	}
	socket.emit("post", {
		// owner_id: owner_id,
		title: msgTitle.val(),
		content: msgText.val(),
		type: 0, // Though not needed
	});

	msgTitle.val("");
	msgText.val("");
}
function newComment() {
	var input = $(this).siblings('.commentInput').eq(0);
	if (input.val() === "") {
		alert("Please input comment content!");
		return;
	}
	var obj = {
		// user_id: window.user.id,
		post_id: $(this).parent().attr('data-msgid'),
		content: input.val(),
	};
	socket.emit('comment', obj);
	input.val("");
}
function newAns() {
	var ansInput = $(this).siblings('.ansInput');
	console.log(ansInput);
	console.log(ansInput.val());
	if (ansInput.val() === "") {
		alert("Please input answer content!");
		return;
	}
	socket.emit('ans', {
		parent_id: $(this).parent().attr('data-msgid'),
		content: ansInput.val(),
		// owner_id: window.user.id,
	});
	ansInput.val("");
}

function myBlink($obj) {
	var i = 0;
	$obj.css("opacity", i);
	var exe = setInterval(function() {
		i += 0.01;
		if (i > 1) {
			i = 1;
		}
		$obj.css("opacity", i);
	}, 5);
	setTimeout(function() {
		clearInterval(exe);
		exe = setInterval(function() {
			i -= 0.01;
			if (i < 0) {
				i = 0;
			}
			$obj.css("opacity", i);
		}, 5);
		setTimeout(function() {
			clearInterval(exe);
			exe = setInterval(function() {
				i += 0.01;
				if (i > 1) {
					i = 1;
				}
				$obj.css("opacity", i);
			}, 5);
			setTimeout(function() {
				clearInterval(exe);

			}, 1200);
		}, 500);
	}, 500);

}