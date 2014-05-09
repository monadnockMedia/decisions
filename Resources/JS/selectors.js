
/* - */

//-- Variable Declarations  -- //

var initHTML;
var initiated;

var scenario;
var curScreen;

var fvd;
var lg;

// --------------------------- //

$(function () {
	//Happens only FIRST time program is run
	if (!initiated) {
		console.log("Init");
		initHTML = $(document.body).html();
		initiated = true;
	} else {
		
	}
	
	//Happens on EVERY restart
	loadIdle();
	curScreen = 0;
});

// --------------------------- //


//-- Click Event Handlers  -- //

//Removes the attract loop and animates in the scenarioSelectBtns
$("#attractLoop").click(function(e) {
	$( "#attractLoop" ).tween({
	   opacity:{
	      start: 100,
	      stop: 0,
	      time: 0,
	      duration: 0.4,
	      effect:'easeInOut',
		  onStop: function(){
			$(".scenarioSelectBtn").each( function( i, v ) {
			  	$( this ).tween({
				   opacity:{
				      start: 0,
				      stop: 100,
				      time: (i/2)-(0.35*i),
				      duration: 0.25,
				      effect:'easeInOut'
				   },
				   transform:{
				      start: 'rotate(0deg) scale( 0.1 )',
				      stop: 'rotate(720deg) scale( 1 )',
				      time: (i/2)-(0.35*i),
				      duration: 1,
				      effect:'elasticOut'
				   }
				}).play();
			});
		   }
	   }
	}).play();
	
	$("#attractLoop").slideUp(500);
});

//Select scenario from main menu buttons
$(".scenarioSelectBtn").click(function(e) {
	scenario = $(this).attr("category");
	curScreen = 1;
	//Hide this stuff
	$('#screenContainer').tween({
		   opacity:{
		      start: 100,
		      stop: 0,
		      time: 0,
		      duration: 0.5,
		      effect:'sineOut'
		   },
		   onStop: function (elem) {
			  $("#scenarioSelect").remove();
			  $(".title").remove();
			  loadScenario();
		   }
	}).play();
});

//Next Button During Scenarios
var bindNextBtn = function() {
	$(".nextBtn").click(function(e) {
		console.log("NEXT Clicked");
		curScreen++;
		if (curScreen == 4) {
			hardReset();
		} else {
			loadScenario();
		}
	});
}

var initGraph = function(){	
	switch (scenario) {
		case "savings":
			lg = new savingsGraph("#chart",fvd);
			break;
		
		case "couch":
			lg = new savingsGraph("#chart",fvd);
			break;
		case "car":
			lg = new carGraph("#chart",fvd);
			break;
	}
};

// --------------------------- //

//-- Function Vars  -- //

var hardReset = function() {
	$(document.body).empty().append(initHTML);
}

//Makes the text bounce at the attract loop
var loadIdle = function() {
	$("#loadIdle").tween({
	  fontSize: {
			start: 100,
			stop: 110,
			time: 0,
			duration: 0.5,
			units: 'px',
			effect:'cubicIn'
		   },
	   onStop: function( elem ) {
			$("#loadIdle").tween({
				fontSize: {
					start: 110,
					stop: 100,
					time: 0,
					duration: 0.5,
					units: 'px',
					effect:'cubicOut'
				},
			   onStop: function( elem ) {
					loadIdle();
			   }
			}).play();
	   }
	}).play();
};

//Called when the user selects their scenario from scenarioSelectBtn.click
var loadScenario = function() {
	//load scenario from html into #screnContainer
	switch (scenario) {
		case "couch":
			$("#screenContainer").load("couch.html #couch_screen" + curScreen, function() {
				console.log("LOAD COUCH.HTML");
				animateScenario();
				if (curScreen == 1) {
					$("#screenContainer").addClass("couch1");
				} else if (curScreen == 2) {
					$("#screenContainer").removeClass("couch1");
					$("#screenContainer").addClass("couch2");
				} else if (curScreen == 3) {
					$("#screenContainer").removeClass("couch2");
					$("#screenContainer").addClass("couch3");
				}
				
			});
			break;
			
		case "car":
			$("#screenContainer").load("car.html #car_screen" + curScreen, function() {
				console.log("LOAD CAR.HTML");
				animateScenario();
				if (curScreen == 1) {
					$("#screenContainer").addClass("car1");
				} else if (curScreen == 2) {
					$("#screenContainer").removeClass("car1");
					$("#screenContainer").addClass("car2");
				} else if (curScreen == 3) {
					$("#screenContainer").removeClass("car2");
					$("#screenContainer").addClass("car3");
				}
			});
			break;
			
		case "savings":
			$("#screenContainer").load("saving.html #saving_screen" + curScreen, function() {
				console.log("LOAD SAVING.HTML");
				animateScenario();
				if (curScreen == 1) {
					$("#screenContainer").addClass("save1");
				} else if (curScreen == 2) {
					$("#screenContainer").removeClass("save1");
					$("#screenContainer").addClass("save2");
				} else if (curScreen == 3) {
					$("#screenContainer").removeClass("save2");
					$("#screenContainer").addClass("save3");
				}
			});
			break;
			
		case "lottery":
			break;
	}	
};

//Tweens the dialog, circles, and images for the scneario expository scenes
var animateScenario = function() {
	if (curScreen == 3) {
		initGraph();
		
		var nextBtnCnt = $(".nextBtn .done").length;
		nextBtnCnt--;
		$(".nextBtn .done").each(function(i, v) {
			$(this).tween({
			   opacity:{
			      	start: 0,
			      	stop: 100,
			      	time: parseInt($(this).attr("time")),
			      	duration: 0.5,
			      	effect:'sineOut'
			   },
			   onStop: function(elem) {
					if (i == nextBtnCnt) {
						bindNextBtn();
					}
			   }
			}).play();
		});
	}
	
	if (curScreen == 1) {
		$('#screenContainer').tween({
		   opacity:{
		      start: 0,
		      stop: 100,
		      time: 0,
		      duration: 0.5,
		      effect:'sineOut'
		   }
		}).play();
		
		//Animate image on screen
		$('.comicImg').tween({
		   opacity:{
		      start: 0,
		      stop: 100,
		      time: 0,
		      duration: 0.5,
		      effect:'sineOut'
		   },
		   height:{
		      start: 0,
		      stop: 768,
		      time: 0,
		      units: 'px',
		      duration: 0.5,
		      effect:'sineOut'
		   },
		   top:{
		      start: 1025,
		      stop: 0,
		      time: 0,
		      units: 'px',
		      duration: 0.5,
		      effect:'sineOut'
		   }
		});
	} else if (curScreen == 2) {
		$('.fadeImg').tween({
		   opacity:{
		      start: 100,
		      stop: 0,
		      time: 0,
		      duration: 1,
		      effect:'sineOut'
		   }
		}).play();
		
		//Animate image on screen
		$('.comicImg').tween({
		   opacity:{
		      start: 0,
		      stop: 100,
		      time: 0,
		      duration: 1,
		      effect:'sineOut'
		   },
		   height:{
		      start: 768,
		      stop: 768,
		      time: 0,
		      units: 'px',
		      duration: 0,
		      effect:'sineOut'
		   },
		   top:{
		      start: 0,
		      stop: 0,
		      time: 0,
		      units: 'px',
		      duration: 0,
		      effect:'sineOut'
		   }
		});
	}
	
			
		
		
		//Animate circles onto screen
			$(".circleText").each( function( i, v ) {
			  	$( this ).tween({
				   opacity:{
				      start: 0,
				      stop: 100,
				      time: parseInt($(this).attr("time")),
				      duration: 0.25,
				      effect:'easeInOut'
				   },
				   transform:{
				      start: 'rotate(0deg) scale( 0.1 )',
				      stop: 'rotate(720deg) scale( 1 )',
				      time: parseInt($(this).attr("time")),
				      duration: 1,
				      effect:'elasticOut'
				   },
				}).play();
			});
					
		//Animate Text on Screen
		$(".dialog").each(function(i, v){
			var thisObj = $(this);
			var anim = getTargetAnim(thisObj);
			console.log("anim.timing");
			console.log(anim.timing);
			
			//Set Vertical Location of Dialog
			$(this).css("top", anim.top + "px");
			
			//Animate dialog horizontally
			$(this).tween({
			   left:{
			      start: 1280,
			      stop: anim.left,
			      time: parseInt(anim.timing),
			      units: 'px',
			      duration: 0.5,
			      effect:'sineOut'
			   },
			   onStop: function( elem ) {
				
			   }
			}).play();
		});
		
		var nextBtnCnt = $(".nextBtn").length;
		nextBtnCnt--;
		$(".nextBtn").each(function(i, v) {
			$(this).tween({
			   opacity:{
			      	start: 0,
			      	stop: 100,
			      	time: parseInt($(this).attr("time")),
			      	duration: 0.5,
			      	effect:'sineOut'
			   },
			   onStop: function(elem) {
					if (i == nextBtnCnt) {
						bindNextBtn();
					}
			   }
			}).play();
		});
}

//Pull anim vars off targeted dialog line
var getTargetAnim = function(target) {
	var anim = target.attr("anim");
	return JSON.parse(anim);
}


