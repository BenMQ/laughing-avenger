$(document).ready(function() {
	var id = $("#question_id").attr("data-questionid");
	$.get("/question/data/" + id, function(data) {
		var container = $(".messageBoard");
		displayPostVer(data, container);
	});
	window.setTimeout(updateTimeFromNow, 60*1000);
});

// returns relative timestamp
// < 1 minute: just now
// > 1 day: on 1st July
// otherwise xxx ago
function timeFromNow(timestamp) {
	var dayInMilliseconds = 1000*60*60*24;
	var minuteInMilliseconds = 1000*60;
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
	$('.time-post-moment').each(function(){
		var time = $(this).data('timestamp');
		$(this).text(timeFromNow(time));
	});

	window.setTimeout(updateTimeFromNow, 60*1000);
}

function displayPostVer(data, container) {
	var masterPostDiv = $('<div class="masterPostDiv panel panel-default" data-timestamp="' + data.timestamp + '" data-msgid="' + data.id + '">'); //data-votes="'+data.votecount+'" '+'
	var qnPanelHeading = $('<div class="qn-Panel panel-heading">');
	var qntitle = $('<h3 class="qn-title panel-title"></h3>');
	var anchorTagForHeader = $('<a>' + data.title + '</a>').attr({
		class: 'accordion-toggle collapsed',
		'data-toggle': 'collapse',
		'data-parent': '#accordion',
		href: '#' + 1
	});
	qntitle.append(anchorTagForHeader);
	
	var momentTimeText = $('<span class="time-post-moment">' 
						+ timeFromNow(data.timestamp) + '</span>').data('timestamp', data.timestamp)
	var timeOfPost = $('<span class="time-post">Asked </span>');
	momentTimeText.appendTo(timeOfPost);

	var clearfix = $('<div class="stats clearfix">');
	var totalvote = $('<div class="total-votes"><span class="net-vote">' + data.votecount + '</span><span>votes</span></div>');
	var totalans = $('<div class="total-answers"><span class="answer-number">' + data.answers.length + '</span><span>answers</span></div>');

	clearfix.append(totalvote).append(totalans).append();
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

	var votesDisplay = $('<span class="votes net-vote">0</span>');

	if (data.votecount) {
		votesDisplay.text(data.votecount);
	}
	voteDiv.append(votesDisplay);

	var commentDiv = $('<div class="commentDiv" data-msgid="' + data.id + '">');
//	var commentInput = $('<input class="commentInput" type="text" placeholder="Comment this post"/>');
//	var commentBtn = $('<button class="commentBtn" data-msgid="' + data.id + '">comment</button>');

	var ansDiv = $('<div class="ansDiv" data-msgid="' + data.id + '">');
//	var ansInput = $('<input class="ansInput" type="text" placeholder="Answer this Question"/>');
//	var ansBtn = $('<button class="ansBtn" data-msgid="' + data.id + '">answer</button>');

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
		id: 1,
		class: 'panel-collapse in'
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
}

function displayComment(data, container, blink) {
	if (data.anonymous == 0) {
		var com = $('<span class="comment">' + data.content + '<span class="comment-by">' + data.name + '</span></span>');
	}
	else {
		var com = $('<span class="comment">' + data.content + '<span class="comment-by">Anonymous</span></span>');
	}
	container.append(com);
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
	var ansVoteDiv = $('<div class="ansVoteDiv" data-msgid="' + data.id + '">');
	var votesDisplay = $('<span class="votes net-vote">0</span>');
	if (data.votecount) {
		votesDisplay.text(data.votecount);
	}
	ansVoteDiv.append(votesDisplay);

	var miscBtnsWrapper = $('<div></div>').addClass('misc-btns');
	miscBtnsWrapper.append(ansVoteDiv).append(ansCommentDiv);
	textDiv.append(answer).append(commentsDiv).append(ansby).append(miscBtnsWrapper);
	answerDiv
			.append(textDiv);
//			.append(ansVoteDiv)
//			.append(ansCommentDiv);
	container.prepend(answerDiv);

}
function lucky() {
	var r = Math.floor(Math.random() * 8);

	return r;
}