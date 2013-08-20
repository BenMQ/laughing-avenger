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
			displayPost(data[i], container);
		}
	});

	$(".sendNewPostBtn").click(newPost);
}); // End of document.ready

// init socket
//like a persistent tube between client and server on directory '/'
window.socket = io.connect("/");

// Displaying a post item on page using a post obj
// Container is a jquery obj
// Not sorted yet!
function displayPost(data, container) {
	if (!data.content) {
		// The post must have content, else display what!
		return;
	}
	var masterPostDiv = $('<div class="masterPostDiv" data-msgID="' + data.ID + '">');
	
	var textDiv = $('<div class="textDiv" data-msgID="' + data.ID + '">');
	var title = $("<p>" + data.title + "</p>");
	var txt = $("<p>" + data.content + "</p>");
	textDiv.append(title).append(txt);

	var voteDiv = $('<div class="voteDiv" data-msgID="' + data.ID + '">');
	var upVoteBtn = $('<button class="upVoteBtn" >&#8743;</button>');
	var downVoteBtn = $('<button class="downVoteBtn" >&#8744;</button>');
	var votesDisplay = $('<span class="votes">0</span>');
	if (data.votecount) {
		votesDisplay.text(data.votecount);
	}
	upVoteBtn.click(upVote);
	downVoteBtn.click(downVote);
	voteDiv.append(upVoteBtn).append(downVoteBtn).append(votesDisplay);

	var commentDiv = $('<div class="commentDiv" data-msgID="' + data.ID + '">');
	var commentInput = $('<input class="commentInput" type="text" placeholder="Comment this post"/>');
	var commentBtn = $('<button class="commentBtn">Add Comment</button>');
	commentBtn.click(newComment);
	commentDiv.append(commentInput).append(commentBtn);

	var ansDiv = $('<div class="ansDiv" data-msgID="' + data.ID + '">');
	var ansInput = $('<input class="ansInput" type="text" placeholder="Answer this Question"/>');
	var ansBtn = $('<button class="ansBtn">Add Answer</button>');
	ansBtn.click(newAns);
	ansDiv.append(ansInput).append(ansBtn);

	if (data.answers && data.answers.length > 0) {
		console.log('In displayPost');
		console.log('TODO display the answers');
	}
	if (data.comments && data.comments.length > 0) {
		console.log('In displayPost');
		console.log('TODO display the comments');
	}

	masterPostDiv
			.append(textDiv)
			.append(voteDiv)
			.append(commentDiv)
			.append(ansDiv);
	container.append(masterPostDiv);
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

});
socket.on("comment", function(data) {

});
socket.on('vote', function(postData) {
	// Individual vote is useless. Just send a standard post obj from server
	$('.masterPostDiv .voteDiv span.votes[data-msgID="' + postData.id + '"]').text(postData.votecount);
});

// Here are the emit senders. Through some trigger, the page will send signals
// To the server
function upVote() {
	socket.emit('vote', {user_id: window.user.id, post_id: $(this).parent().attr("data-msgID"), type: 1});
}
function downVote() {
	socket.emit('vote', {user_id: window.user.id, post_id: $(this).parent().attr("data-msgID"), type: -1});
}
function newPost() {
	// The problem with class is, there are some stuff that should be singleton
	// Here .eq(0) is just a failsafe. We should be careful
	var msgTitle = $(".postDiv .postTitle").eq(0);
	var msgText = $(".postDiv .postText").eq(0);
	var owner_id = window.user.id;

	socket.emit("post", {
		owner_id: owner_id,
		title: msgTitle.val(),
		content: msgText.val(),
		type: 0, //Hey I can't remember!
	});

	msgTitle.val("");
	msgText.val("");
}
function newComment() {

}
function newAns() {

}