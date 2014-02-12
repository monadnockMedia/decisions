var fvd;
var lg;
var toggle = true;
$(function(){
	makeGraph();
//	window.lg = new savingsGraph("#chart",fvd);
	//window.lg = new carGraph("#chart",fvd);
	$("#switch").click(function(){
		toggle = !toggle;
		$("#chart").html(" ")
		makeGraph();
	})
})

var makeGraph = function(){
		window.lg = (toggle) ? new carGraph("#chart",fvd) : new savingsGraph("#chart",fvd);
	
}

