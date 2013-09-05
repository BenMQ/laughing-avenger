function addEvtForNavLinks(){
	$('#nav-pane ul.nav li').on('click',function(){
		$('#nav-pane ul.nav li.active').removeClass('active');
		$(this).addClass('active');
	});
}

function addCustomScrollBar(){
   $("#qn-view").mCustomScrollbar({
      theme: 'dark-thin',
        advanced:{
          autoScrollOnFocus: false,
          updateOnContentResize: true
      },
      scrollButtons:{
        enable: true
      }
    });
}

function addEvtForAnswer(){
  $('.answer-btn').on('click',function(){
    $('#title-view').hide();
    var textArea = $('#ans-view');
    textArea.attr('placeholder','What\'s your answer?');
    textArea.animate({
      height:'20%'
    },500,function(){
      textArea.focus();
    });
  });
}

function addEvtForComment(){
  $('.comment-btn').on('click',function(){
    $('#title-view').hide();
    var textArea = $('#ans-view');
    textArea.attr('placeholder','What\'s your comment');
    textArea.animate({
      height:'20%'
    },500,function(){
      textArea.focus();
    });
  });
}

function addEvtForTextArea(){
	var ans = $("#ans-view");
  ans.focusin(function(){
    ans.animate({height:'20%'},500);
  });
  ans.focusout(function(){
	if ($("#ans-view").val() != "") {
		return;
	}
    ans.animate({height:'10%'},'fast');
    $('#title-view').fadeIn(500);
	window.fragen.submitStatus = {
		// use a global object to remember the current submission status
		// type:		{'qn', 'ans', 'com' }
		// parent_id:	{ null, qnid,  postid}
		type: "qn",
		parent_id: null,
	};
  });
}

function voteNoAnim(votebtn){
    var voteSpan = votebtn.parent().find('.net-vote'); 
    var voteNo = parseInt(voteSpan.text());
    if(voteNo > 0) {
      voteSpan.css('color','rgb(43,97,117)');
    }else if(voteNo < 0){
      voteSpan.css('color','crimson');
    }
}

function addEvtForVoteBtn(){
  $('.upvote').on('click',function(){
    $(this).toggleClass('selected-pos');
    voteNoAnim($(this));
  });
  $('.downvote').on('click',function(){
    $(this).toggleClass('selected-neg');
    voteNoAnim($(this));
  });
}

$(function(){
//	addEvtForNavLinks();
    addCustomScrollBar();
//  addEvtForAnswer();
//  addEvtForComment();
//  addEvtForVoteBtn();
  addEvtForTextArea();
})