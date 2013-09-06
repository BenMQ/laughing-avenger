// Adds and removes pointer when nav links are clicked
function addEvtForNavLinks(){
	$('ul.nav li').on('click',function(e){
		// makes pointer
		var pointer = $('<div></div>').addClass('selected');
		//	ptr_shadow = $('<div></div>').addClass('pointer-shadow'),
		//	ptr = $('<div></div>').addClass('pointer');
//		pointer
//			.append(ptr_shadow)
//			.append(ptr);
		// removes poinyer
		$('ul.nav li div.selected').remove();
		$('ul.nav li.active').removeClass('active');
		// adds pointer
		$(this).append(pointer).addClass('active');
	});
}

function addEvtForMobile(){
	$(window).on('resize',function(){
		if($(window).width() < 768){
			$('div.selected').css('display','none');
			$('nav.collapse').removeClass('pull-right');
		}else{
			$('div.selected').css('display','block');
			$('nav.collapse').addClass('pull-right');
		}
	});
}

function addEvtForIcons(){
	$('.social i').on('mouseenter mouseleave',function(){
		$(this).toggleClass('icon-spin');
	},function(){
		$(this).toggleClass('icon-spin');
	});
}

$(function(){
	addEvtForNavLinks();
	addEvtForMobile();
	addEvtForIcons();
	$('[data-typer-targets]').typer();
});
