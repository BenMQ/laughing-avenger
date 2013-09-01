function addEvtForNavLinks() {
	$('#nav-pane ul.nav li').on('click', function() {
		$('#nav-pane ul.nav li.active').removeClass('active');
		$(this).addClass('active');
	});
}

function addCustomScrollBar() {
	$("#qn-view").mCustomScrollbar({//,#notification,#ans-view
		theme: 'dark-thin',
		advanced: {
			autoScrollOnFocus: false,
			updateOnContentResize: true
		},
		scrollButtons: {
			enable: true
		}
	});
}

function addEvtForAnswer() {
	$('.answer-btn').on('click', function() {
		$('#title-view').hide();
		var textArea = $('#ans-view');
		textArea.attr('placeholder', 'What\'s your answer?');
		textArea.animate({
			height: '20%'
		}, 500, function() {
			textArea.focus();
		});
	});
}

function addEvtForComment() {
	$('.comment-btn').on('click', function() {
		$('#title-view').hide();
		var textArea = $('#ans-view');
		textArea.attr('placeholder', 'What\'s your comment');
		textArea.animate({
			height: '20%'
		}, 500, function() {
			textArea.focus();
		});
	});
}

function addEvtForTextArea() {
//  var textArea = $('#ans-view-wrapper');
//	textArea.focusin(function() {
//		textArea.find('#ans-view').animate({height: '20%'}, 500);
//	});
	$('#ans-view').focusin(function() {
		$(this).animate({height: '20%'}, 500);
	});
	$('#ans-view').focusout(function() {
		$(this).animate({height: '10%'}, 'fast');
		$('#title-view').fadeIn(500);
	});
//	textArea.focusout(function() {
//		textArea.find('#ans-view').animate({height: '10%'}, 'fast');
//		$('#title-view').fadeIn(500);
//	});
}

function voteNoAnim(votebtn) {
	var voteSpan = votebtn.parent().find('.net-vote');
	var voteNo = parseInt(voteSpan.text());
	if (voteNo > 0) {
		voteSpan.css('color', 'rgb(43,97,117)');
	} else if (voteNo < 0) {
		voteSpan.css('color', 'crimson');
	}
}

function addEvtForVoteBtn() {
	$('.upvote').on('click', function() {
		$(this).toggleClass('selected-pos');
		voteNoAnim($(this));
	});
	$('.downvote').on('click', function() {
		$(this).toggleClass('selected-neg');
		voteNoAnim($(this));
	});
}

$(function() {
//	addEvtForNavLinks();
//  addCustomScrollBar();
//  addEvtForAnswer();
//  addEvtForComment();
//  addEvtForVoteBtn();
	addEvtForTextArea();
})