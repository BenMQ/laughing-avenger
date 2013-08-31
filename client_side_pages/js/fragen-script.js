function addEvtForNavLinks(){
	$('#nav-pane ul.nav li').on('click',function(){
		$('#nav-pane ul.nav li.active').removeClass('active');
		$(this).addClass('active');
	});
}

function addCustomScrollBar(){
   $("#qn-view,#notification,#ans-view").mCustomScrollbar({
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
  var textArea = $('#ans-view');
  textArea.focusin(function(){
    $(this).animate({height:'20%'},500);
  });
  textArea.focusout(function(){
    textArea.animate({height:'10%'},500);
  });

}

$(function(){
	addEvtForNavLinks();
  addCustomScrollBar();
  addEvtForAnswer();
  addEvtForComment();
})