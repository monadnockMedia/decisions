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
	
	

/*	  var path = './';
	  var fs = require('fs');

	  fs.watch(path, [], function() {
	    if (location)
	      location.reload(false);
	  });*/

	
	
	
	
})

var makeGraph = function(){
	lg = (toggle) ? new cardGraph("#chart",fvd) : new savingsGraph("#chart",fvd);
		//lg = new carGraph("#chart",fvd);
		
}

