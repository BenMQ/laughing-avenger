//--- This js includes all functionalities needed by socketBoard.html ---------
//--- @boyang
var idOfCollapse = 0;

//---- First off, $(document).ready() must be singleton. More than one of it ---
//----- brings unexpected behaviour. ----------------
// And things that don't need the document to be ready, should not be inside document.ready
$(document).ready(function() {
	// Our obj, horray!
	// Nothing much stored there, though
	window.fragen = {};
	window.fragen.submitStatus = {
		// use a global object to remember the current submission status
		// type:		{'qn', 'ans', 'com' }
		// parent_id:	{ null, qnid,  postid}
		type: "qn",
		parent_id: null,
		anon: false,
	};
	// get master arr from server, and display
	$.get("/masterArr", function(data) {
		// The problem with class is, there are some stuff that should be singleton
		// Here .eq(0) is just a failsafe. We should be careful
		init(data);
//		relocateMessageBoard();
//		addCustomScrollBar();
		$(".messageBoard .masterPostDiv").tsort({order: 'desc', attr: 'data-timestamp'});

		$(".messageBoard .masterPostDiv .answersDiv").each(function(i, e) {
			$(".answerDiv", e).tsort('.ansVoteDiv span.votes', {order: 'desc'}, {order: 'desc', attr: 'data-timestamp'});
		});
	});


	$("#qnSubmit.newPostBtn").click(masterSubmit);
	$("#anonymousSwitch").click(switchAnon);

	$("button.sortByTime").click(evtSortByTime);
	$("button.sortByVotes").click(evtSortByVotes);

	window.setTimeout(updateTimeFromNow, 60 * 1000);
}); // End of document.ready

function switchAnon() {
	if ($(this).hasClass('active')) {
		window.fragen.submitStatus.anon = false;
		$(this).addClass('icon-eye-open');
		$(this).removeClass('icon-eye-close');
		$(this).attr('title', 'Not Anonymous');
	}
	else {
		window.fragen.submitStatus.anon = true;
		$(this).removeClass('icon-eye-open');
		$(this).addClass('icon-eye-close');
		$(this).attr('title', 'I am Anonymous');
	}
	$(this).toggleClass("active");
	return false;
}

function evtSortByVotes(e) {
	if (window.fragen && window.fragen.sortByTime) {
		clearInterval(window.fragen.sortByTime);
	}
	if (window.fragen && window.fragen.sortByVotes) {
		clearInterval(window.fragen.sortByVotes);
	}
	$(this).toggleClass('active');
	if ($(this).hasClass("active")) {
		$(".sortByTime").removeClass("active");
		$(".messageBoard .masterPostDiv").tsort('.voteDiv span.votes', {order: 'desc'}, {order: 'desc', attr: 'data-timestamp'});
		sortAns();
		window.fragen.sortByVotes = setInterval(function() {
			console.log("auto by votes hahaha");
			$(".messageBoard .masterPostDiv").tsort('.voteDiv span.votes', {order: 'desc'}, {order: 'desc', attr: 'data-timestamp'});
			sortAns();
		}, 5000);
	}
	return false;
}

function evtSortByTime(e) {
	if (window.fragen && window.fragen.sortByTime) {
		clearInterval(window.fragen.sortByTime);
	}
	if (window.fragen && window.fragen.sortByVotes) {
		clearInterval(window.fragen.sortByVotes);
	}
	$(this).toggleClass("active");
	if ($(this).hasClass("active")) {
		$(".sortByVotes").removeClass("active");
		$(".messageBoard .masterPostDiv").tsort({order: 'desc', attr: 'data-timestamp'});
		sortAns();
		window.fragen.sortByTime = setInterval(function() {
			console.log("auto by time hahaha");
			$(".messageBoard .masterPostDiv").tsort({order: 'desc', attr: 'data-timestamp'});
			sortAns();
		}, 5000);
	}
	return false;
}

function sortAns() {
	$(".messageBoard .masterPostDiv .answersDiv .answerDiv").tsort('.ansVoteDiv span.votes', {order: 'desc'}, {order: 'desc', attr: 'data-msgid'});
}

function init(masterArr) {
	var container = $('.messageBoard').eq(0);
	for (var i = masterArr.length - 1; i >= 0; i--) {

		// TODO: differentiate post, answer, comment. Display accordingly
		if (masterArr[masterArr.length - 1 - i].module_id == window.moduleid) {
			displayPost(masterArr[masterArr.length - 1 - i], container, false);
		}
	}
	console.log((masterArr));
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
	console.log("anon comment");
	console.log(data.anonymous);
	if (data.anonymous == 0) {
		var com = $('<span class="comment">' + data.content + '<span class="comment-by">' + data.name + '</span></span>');
	}
	else {
		var com = $('<span class="comment">' + data.content + '<span class="comment-by">Anonymous</span></span>');
	}
	container.append(com);
	if (blink) {
		myBlink(com);
	}
}

function displayAns(data, container, blink) {
	var answerDiv = $('<div class="answerDiv" data-msgid="' + data.id + '" data-timestamp="' + data.timestamp + '">');
	var textDiv = $('<div class="testDiv chat-bubble-answer" data-msgid="' + data.id + '">');
	var answer = $('<span class="answer answer-body" data-msgid="' + data.id + '">' +
			data.content + '</span>');
	var ansby = $('<div class="answer-by"></div>');

	// The hack of the year
	// replace n with q to get square pic
	if (data.anonymous == 0) {
		var hacked_url = data.fbpic_url.substr(0, data.fbpic_url.lastIndexOf('.') - 1) + 'q' + data.fbpic_url.substr(data.fbpic_url.lastIndexOf('.'));
		var ansbyimg = $('<img src="' + hacked_url + '" alt="' + data.name + '" title="' + data.name + '">');
	}
	else {
		var ansbyimg = $('<img src="/public/img/cat' + lucky() + '.png"  alt="Anonymous" title="Anonymous">');
	}
	ansby.append(ansbyimg);

	var commentsDiv = $('<div class="commentsDiv" data-msgid="' + data.id + '">');
	if (data.comments && data.comments.length > 0) {
		for (var j = 0; j < data.comments.length; j++) {
			displayComment(data.comments[j], commentsDiv, false);
		}
	}


	var ansCommentDiv = $('<div class="ansCommentDiv" data-msgid="' + data.id + '">');
	var commentInput = $('<input class="commentInput" type="text" placeholder="Comment this post"/>');
//	var commentBtn = $('<button class="" data-msgid="' + data.id + '">comment</button>');
	var commentBtn = $('<a class="comment-btn commentBtn" data-msgid="' + data.id + '"><span>comment</span></a>');

	commentBtn.click(switchToCom);
	ansCommentDiv.append(commentBtn); //append(commentInput).

	var ansVoteDiv = $('<div class="ansVoteDiv" data-msgid="' + data.id + '">');
	var upVoteBtn = $('<a class="upvote upVoteBtn"><i class="icon-thumbs-up-alt"></i></a>');
	var downVoteBtn = $('<a class="downvote downVoteBtn"><i class="icon-thumbs-down-alt"></i></a>');
	var votesDisplay = $('<span class="votes net-vote">0</span>');
	if (data.votecount) {
		votesDisplay.text(data.votecount);
	}
	upVoteBtn.click(upVote);
	downVoteBtn.click(downVote);
	ansVoteDiv.append(votesDisplay).append(upVoteBtn).append(downVoteBtn);

	var miscBtnsWrapper = $('<div></div>').addClass('misc-btns');
	miscBtnsWrapper.append(ansVoteDiv).append(ansCommentDiv);
	textDiv.append(answer).append(commentsDiv).append(ansby).append(miscBtnsWrapper);
	answerDiv
			.append(textDiv);
//			.append(ansVoteDiv)
//			.append(ansCommentDiv);
	container.prepend(answerDiv);

	if (blink) {
		myBlink(answerDiv);
	}
}


// returns relative timestamp
// < 1 minute: just now
// > 1 day: on 1st July
// otherwise xxx ago
function timeFromNow(timestamp) {
	var dayInMilliseconds = 1000 * 60 * 60 * 24;
	var minuteInMilliseconds = 1000 * 60;
	var momentNow = moment();
	var momentThen = moment(timestamp);
	var msFromNow = momentNow.diff(momentThen);
	if (msFromNow < minuteInMilliseconds) {
		return 'just now';
	} else if (msFromNow > dayInMilliseconds) {
		return momentThen.format("on Do MMM");
	} else {
		return momentThen.fromNow();
	}
}

function updateTimeFromNow() {
	$('.time-post-moment').each(function() {
		var time = $(this).data('timestamp');
		$(this).text(timeFromNow(time));
	});

	window.setTimeout(updateTimeFromNow, 60 * 1000);
}


// Displaying a post item on page using a post obj
// Container is a jquery obj
// Not sorted yet (but the db query result is sorted)!
function displayPost(data, container, blink) {
	var masterPostDiv = $('<div class="masterPostDiv panel panel-default" data-timestamp="' + data.timestamp + '" data-msgid="' + data.id + '">'); //data-votes="'+data.votecount+'" '+'
	var qnPanelHeading = $('<div class="qn-Panel panel-heading">');
	var qntitle = $('<h3 class="qn-title panel-title"></h3>');
	var anchorTagForHeader = $('<a>' + data.title + '</a>').attr({
		class: 'accordion-toggle collapsed',
		'data-toggle': 'collapse',
		'data-parent': '#accordion',
		href: '#' + idOfCollapse
	});
	qntitle.append(anchorTagForHeader);
	// var tObj = data.timestamp.split(/[- : T .]/);
	// var date = new Date(tObj[0], tObj[1] - 1, tObj[2], tObj[3], tObj[4], tObj[5]);
	// date = date.toString().split(' ');

	var clearfix = $('<div class="stats clearfix">');
	var totalvote = $('<div class="total-votes"><span class="net-vote">' + data.votecount + '</span><span>votes</span></div>');
	var totalans = $('<div class="total-answers"><span class="answer-number">' + data.answers.length + '</span><span>answers</span></div>');

	//var timeOfPost = $('<span class="time-post" title = "' + date[0] + ' ' + date[1] + ' ' + date[2] + ' ' + date[3] + ' ' + date[4] + '">' + "Asked on " + date[1] + '\' ' + date[3].substring(2) + '</span>');
	var momentTimeText = $('<span class="time-post-moment">'
			+ timeFromNow(data.timestamp) + '</span>').data('timestamp', data.timestamp)


	var timeOfPost = $('<span class="time-post">Asked </span>');
	momentTimeText.appendTo(timeOfPost);
	clearfix.append(totalans).append(totalvote).append();
	qnPanelHeading.append(qntitle).append(clearfix).append(timeOfPost);

	var textDiv = $('<div class="chat-bubble-question textDiv" data-msgid="' + data.id + '">');
	var txt;
	if (data.content) {
		txt = $("<h4 class='title'>" + data.title + "</h4>" + "<span class='question-body'>" + data.content + "</span>");
	}
	else {
		txt = $("<h4 class='title'>" + data.title + "</h4><p></p>");
	}
	var qnby = $('<div class="question-by"></div>');
	if (data.anonymous == 0) {
		var hacked_url = data.fbpic_url.substr(0, data.fbpic_url.lastIndexOf('.') - 1) + 'q' + data.fbpic_url.substr(data.fbpic_url.lastIndexOf('.'));
		var qnbyimg = $('<img src="' + hacked_url + '"  alt="' + data.name + '" title="' + data.name + '">');
	}
	else {
		var qnbyimg = $('<img src="/public/img/cat' + lucky() + '.png" alt="Anonymous" title="Anonymous">');
	}
	qnby.append(qnbyimg);
	txt.append(qnby);
	textDiv.append(txt);

	var qnCommentsDiv = $('<div class="commentsDiv" data-msgid="' + data.id + '">');
	if (data.comments && data.comments.length > 0) {
		for (var i = 0; i < data.comments.length; i++) {
			displayComment(data.comments[i], qnCommentsDiv, false);
		}
	}

	textDiv.append(qnCommentsDiv);

	var voteDiv = $('<div class="voteDiv" data-msgid="' + data.id + '">');

	var upVoteBtn = $('<a class="upvote upVoteBtn"><i class="icon-thumbs-up-alt"></i></a>');
	var downVoteBtn = $('<a class="downvote downVoteBtn"><i class="icon-thumbs-down-alt"></i></a>');
	var votesDisplay = $('<span class="votes net-vote">0</span>');

	if (data.votecount) {
		votesDisplay.text(data.votecount);
	}
	upVoteBtn.click(upVote);
	downVoteBtn.click(downVote);
	voteDiv.append(votesDisplay).append(upVoteBtn).append(downVoteBtn);

	var commentDiv = $('<div class="commentDiv" data-msgid="' + data.id + '">');
//	var commentInput = $('<input class="commentInput" type="text" placeholder="Comment this post"/>');
//	var commentBtn = $('<button class="commentBtn" data-msgid="' + data.id + '">comment</button>');
	var commentBtn = $('<a class="comment-btn commentBtn" data-msgid="' + data.id + '"><span>comment</span></a>');
	commentBtn.click(switchToCom);
	commentDiv.append(commentBtn);//append(commentInput).

	var ansDiv = $('<div class="ansDiv" data-msgid="' + data.id + '">');
//	var ansInput = $('<input class="ansInput" type="text" placeholder="Answer this Question"/>');
//	var ansBtn = $('<button class="ansBtn" data-msgid="' + data.id + '">answer</button>');
	var ansBtn = $('<a class="answer-btn ansBtn" data-msgid="' + data.id + '"><span>answer</span></a>');
	ansBtn.click(switchToAns);
	ansDiv.append(ansBtn);//append(ansInput).

	var answersDiv = $('<div class="answersDiv clearfix" data-msgid="' + data.id + '">');

	if (data.answers && data.answers.length > 0) {
		for (var i = 0; i < data.answers.length; i++) {
			displayAns(data.answers[i], answersDiv, false);
		}
	}
	var miscBtnsWrapper = $('<div></div>').addClass('misc-btns');
	miscBtnsWrapper.append(voteDiv).append(commentDiv).append(ansDiv);
	textDiv.append(miscBtnsWrapper);
	var wrapperQA = $('<div></div>').attr({
		id: idOfCollapse++,
		class: 'panel-collapse collapse'
	}).append($('<div class="panel-body"></div>'));

	wrapperQA.find('.panel-body').append(textDiv).append(answersDiv);
	masterPostDiv
			.append(qnPanelHeading)
//			.append(textDiv)
//			.append(qnCommentsDiv)
//			.append(miscBtnsWrapper)
//			.append(answersDiv);
			.append(wrapperQA);
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
	if (data.module_id != window.moduleid) {
		return;
	}
	var container = $('.messageBoard').eq(0);
//	console.log(container);
//	console.log(data);
	displayPost(data, container, true);
});
socket.on("ans", function(data) {
	// Find the parent qn and prepend to it
	var parentQn = $('.masterPostDiv[data-msgid="' + data.parent_id + '"]');
	var container = $('.answersDiv', parentQn);
	var anscount = $('.answer-number', parentQn);
	anscount.text(parseInt(anscount.text()) + 1);
	displayAns(data, container, true);
});
socket.on("comment", function(data) {
	var parent = $('.answerDiv[data-msgid="' + data.post_id + '"] .commentsDiv' + ', .masterPostDiv[data-msgid="' + data.post_id + '"] .commentsDiv').eq(0);
	displayComment(data, parent, true);
});
socket.on('vote', function(postData) {
	console.log("!!!!!!!!!!!!!received vote");
	console.log(postData);
	// Individual vote is useless. Just send a standard post obj from server
	if (postData.type == 0) {
		var master = $('.masterPostDiv[data-msgid="' + postData.id + '"]');
		console.log(master);
		$('.masterPostDiv .voteDiv' + '[data-msgid="' + postData.id + '"]' + '> span.votes').text(postData.votecount);
		$('.total-votes > .net-vote', master).text(postData.votecount);
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
		$(this).siblings('.downVoteBtn').removeClass('selected-neg');
	}
	$(this).toggleClass("selected-pos");
	return false;
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
		$(this).siblings('.upVoteBtn').removeClass('selected-pos');
	}
	$(this).toggleClass("selected-neg");
	return false;
}

function switchToCom() {
	var status = window.fragen.submitStatus;
	status.type = "com";
	status.parent_id = $(this).attr('data-msgid');
	$('#title-view').hide();
	var textArea = $('#ans-view');
	textArea.attr('placeholder', 'What\'s your comment');
	textArea.animate({
		height: '20%'
	}, 500, function() {
		textArea.focus();
	});
}
function switchToAns() {
	var status = window.fragen.submitStatus;
	status.type = "ans";
	status.parent_id = $(this).attr('data-msgid');
	$('#title-view').hide();
	var textArea = $('#ans-view');
	textArea.attr('placeholder', 'What\'s your answer?');
	textArea.animate({
		height: '20%'
	}, 500, function() {
		textArea.focus();
	});
}

function masterSubmit() {
	// the handler for the masterSubmit btn
	var status = window.fragen.submitStatus;
	if (status.type == "qn") {
		newPost(this);
	}
	else if (status.type == "ans") {
		newAns(this);
	}
	else if (status.type == "com") {
		newComment(this);
	}
	var msgText = $("#ans-view").eq(0);
	msgText.focusout();
}

function newPost(e) {
	// The problem with class is, there are some stuff that should be singleton
	// Here .eq(0) is just a failsafe. We should be careful
	var msgTitle = $("#title-view").eq(0);
	var msgText = $("#ans-view").eq(0);

	// var owner_id = window.user.id;
	if (msgTitle.val() === "") {
		alert("Please input question title!");
		return;
	}
	var obj = {
		// owner_id: owner_id,
		title: msgTitle.val(),
		content: msgText.val(),
		module_id: window.moduleid,
	}
	if (window.fragen.submitStatus.anon) {
		obj.anon = true;
	}
	else {
		obj.anon = false;
	}

	socket.emit("post", obj);
	msgTitle.val("");
	msgText.val("");
}
function newComment(e) {
	var input = $("#ans-view").eq(0);
	if (input.val() === "") {
		alert("Please input comment content!");
		return;
	}
	var obj = {
		// user_id: window.user.id,
		post_id: window.fragen.submitStatus.parent_id,
		content: input.val(),
	};
	if (window.fragen.submitStatus.anon) {
		obj.anon = true;
	}
	else {
		obj.anon = false;
	}
	socket.emit('comment', obj);
	input.val("");
}
function newAns(e) {
	var ansInput = $("#ans-view").eq(0);
	if (ansInput.val() === "") {
		alert("Please input answer content!");
		return;
	}
	var obj = {
		parent_id: window.fragen.submitStatus.parent_id,
		content: ansInput.val(),
		// owner_id: window.user.id,
	};
	if (window.fragen.submitStatus.anon) {
		obj.anon = true;
	}
	else {
		obj.anon = false;
	}
	socket.emit('ans', obj);
	if (!window.fragen.submitStatus.anon) {
		publish(window.fragen.submitStatus.parent_id, "answer");
	}
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

function lucky() {
	var r = Math.floor(Math.random() * 8);

	return r;
}

function publish(qnid, type) {
	FB.api(
			'me/fragen-ask:' + type,
			'post',
			{
				question: "http://fragen.cmq.me/question/" + qnid,
				privacy: {'value': 'ALL_FRIENDS'}
			},
	function(response) {
//		console.log(response);
	}
	);
}