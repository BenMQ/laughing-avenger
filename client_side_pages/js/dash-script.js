// remove after integration with back-end
var moduleAlloc = {
	'CS3216':'SOFTWARE DEVELOPMENT ON EVOLVING PLATFORMS',
 	'CS2103':'SOFTWARE ENGINEERING',
 	'EE2020':'DIGITAL FUNDAMENTALS',
 	'EE2021':'DEVICES AND CIRCUITS',
 	'CG2271':'REAL-TIME OPERATING SYSTEM',
 	'CS3108B':'INDEPENDENT WORK',
 	'SSA2202': 'CHANGING LANDSCAPES OF SINGAPORE'
};

var tileColorClass = ['sienna','olive','crimson','amber','cobalt','magenta','mauve','teal','steel','lime'];

function addEvtForNavLinks(){
	$('#nav-pane ul.nav li').on('click',function(){
		$('#nav-pane ul.nav li.active').removeClass('active');
		$(this).addClass('active');
	});
}

function tile(){
	var tile = $('<div></div>'),
		index = Math.floor(Math.random()*tileColorClass.length);
	tile.attr({
		class : 'col-md-5 live-tile ' +	 tileColorClass[index],
		'data-mode':'none',
		'data-bounce':true
	});
	tileColorClass.splice(index,1);
	return tile;
}

function tileElem(mod){
	var tile_wrapper = $('<div></div>');
	tile_wrapper
		.append('<h2 id="mod-code">' + mod + '</h2>')
		.append('<h4 id="mod-title">' + moduleAlloc[mod] + '</h4>');
	return tile_wrapper;
}

function addTiles(){
	var tileGrp = $('.tiles.tile-group');
	for(mod in moduleAlloc){
		tileGrp.append(tile().append(tileElem(mod)));
	}
}

$(function(){
	addEvtForNavLinks();
	addTiles();
});