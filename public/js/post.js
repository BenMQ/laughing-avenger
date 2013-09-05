$(document).ready(function() {
	var id = $("#question_id").attr("data-questionid");
	$.get("/question/data/" + id, function(data) {
		var container = $(".messageBoard");
		displayPostVer(data, container);
	});
});


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
	var tObj = data.timestamp.split(/[- : T .]/);
	var date = new Date(tObj[0], tObj[1] - 1, tObj[2], tObj[3], tObj[4], tObj[5]);
	date = date.toString().split(' ');
	var clearfix = $('<div class="stats clearfix">');
	var totalvote = $('<div class="total-votes"><span class="net-vote">' + data.votecount + '</span><span>votes</span></div>');
	var totalans = $('<div class="total-answers"><span class="answer-number">' + data.answers.length + '</span><span>answers</span></div>');

	var timeOfPost = $('<span id="time-post" title = "' + date[0] + ' ' + date[1] + ' ' + date[2] + ' ' + date[3] + ' ' + date[4] + '">' + date[1] + '\' ' + date[3].substring(2) + '</span>');
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


function lucky() {
	var r = Math.floor(Math.random() * 8);

	return r;
}