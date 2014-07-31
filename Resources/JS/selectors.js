
/* - */

//-- Variable Declarations  -- //

var initHTML;
var initiated;

var scenario;
var curScreen;
var carType;

var fvd;
var lg;

var attractTimer;
var attractVis = false;

var bCanClick;

var idleInterval;
var bStarted;

// --------------------------- //

$(function () {
	//Happens only FIRST time program is run
	if (!initiated) {
		console.log("Init");
		initHTML = $(document.body).html();
		initiated = true;
		
		//$("*").css({'cursor' : 'none'});
	} else {
		
	}
	
	//Happens on EVERY restart
	$("*").clear();
	loadIdle();
	curScreen = 0;
	startAnim();
	bCanClick = true;
	idleInterval = setInterval(timeOut, 90000);
	bStarted = false;
});

$( "*" ).on( "click", function() {
  	console.log("Reset Idle");
	clearInterval(idleInterval);
	idleInterval = setInterval(timeOut, 90000);
});

// --------------------------- //

var timeOut = function() {
	if (bStarted) {
		try {
			var isOpen = $( "#dialog" ).dialog( "isOpen" );
		} catch (e) {
			var isOpen = false;
		}
	
		console.log("isOpen: ", isOpen);
		if (!isOpen) {
			clearInterval(idleInterval);
			idleInterval = setInterval(timeOut, 15000);
		
			$( "#dialog" ).dialog({
			      resizable: false,
				  draggable: false,
				  hide: "fade",
				  show: "drop",
			      modal: true,
				  open: function(event, ui) { $(".ui-dialog-titlebar-close").hide(); },
			      buttons: {
			        "Yes!": function() {
			          $( this ).dialog( "close" );
					  clearInterval(idleInterval);
					  idleInterval = setInterval(timeOut, 90000);
			        }
			      }
			    });
		} else {
			clearInterval(idleInterval);
			hardReset();
		}
	}
}

//Removes the attract loop and animates in the scenarioSelectBtns
var startAnim = function() {
	$( "#attractLoop" ).tween({
	   opacity:{
	      start: 100,
	      stop: 0,
	      time: 0,
	      duration: 0.4,
	      effect:'easeInOut',
		  onStop: function(){
			attractTimer = setInterval(function(){attract()}, 4500);
			attractLoopShow();
		   }
	   }
	}).play();
	
	$("#attractLoop").slideUp(500);
};

var attract = function() {
	if (attractVis) {
		attractLoopHide();
	} else {
		attractLoopShow();
	}
}

var attractLoopHide = function() {
	attractVis = false;
	$(".scenarioSelectBtn").each( function( i, v ) {
	  	$( this ).tween({
		   opacity:{
		      start: 100,
		      stop: 0,
		      time: 3+(i/1)-(0.5*i), // 0.5+(i/2)-(0.35*i)
		      duration: 0.25,
		      effect:'easeInOut'
		   },
		   transform:{
		      start: 'rotate(0deg) scale( 1 )',
		      stop: 'rotate(720deg) scale( 0.1 )',
		      time: 3+(i/1)-(0.5*i),
		      duration: 1,
		      effect:'elasticOut'
		   }
		}).play();
	});
}

var attractLoopShow = function() {
	attractVis = true;
	$(".scenarioSelectBtn").each( function( i, v ) {
	  	$( this ).tween({
		   opacity:{
		      start: 0,
		      stop: 100,
		      time: 0.5+(i/1)-(0.35*i), // 0.5+(i/2)-(0.35*i)
		      duration: 0.25,
		      effect:'easeInOut'
		   },
		   transform:{
		      start: 'rotate(0deg) scale( 0.1 )',
		      stop: 'rotate(720deg) scale( 1 )',
		      time: 0.5+(i/1)-(0.35*i),
		      duration: 1,
		      effect:'elasticOut'
		   }
		}).play();
	});
}

//Select scenario from main menu buttons
	$(".scenarioSelectBtn").click(function(e) {
		if ($(this).css("opacity") >= 0.75 && bCanClick) {
			bCanClick = false;
			bStarted = true;
			clearInterval(attractTimer);
			scenario = $(this).attr("category");
			console.log("Hit Select Btn: ", scenario);
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
		}
	});


//Next Button During Scenarios
var bindNextBtn = function() {
	$(".nextBtn").click(function(e) {
		if (bCanClick) {
			bCanClick = false;
			if ($(this).hasClass("economy")) {
				console.log("Economy");
				carType = "Economy";
			} else if ($(this).hasClass("midsize")) {
				console.log("Midsized");
				carType = "Midsized";
			} else if ($(this).hasClass("luxury")) {
				console.log("Luxury");
				carType = "Luxury";
			}
		
			console.log("NEXT Clicked");
			curScreen++;
			if (curScreen == 4) {
				hardReset();
			} else {
				loadScenario();
			}
		}
	});
}

var initGraph = function(){	
	switch (scenario) {
		case "savings":
			lg = new savingsGraph("#chart",fvd);
			break;
		
		case "couch":
			lg = new cardGraph("#chart",fvd);
			break;
		case "car":
			lg = new carGraph("#chart", carType);
			break;
			
		case "lottery":
			lg = new Chart("#chart", fvd);
			$("svg").css("padding", "0.5em");
			$(".nextBtnFake").click(function(e) {
				$('.screenText').tween({
					   opacity:{
					      start: 100,
					      stop: 0,
					      time: 0,
					      duration: 0.25,
					      effect:'sineOut'
					   },
					   onStop: function (elem) {
				          
						  $(".screenText").remove();
					   }
				}).play();
				
				$('.nextBtnFake').tween({
					   opacity:{
					      start: 100,
					      stop: 0,
					      time: 0,
					      duration: 0.25,
					      effect:'sineOut'
					   },
					   onStop: function (elem) {
						  $(".nextBtnFake").remove();
					   }
				}).play();
				
				$('.overlay').tween({
					   opacity:{
					      start: 100,
					      stop: 0,
					      time: 0,
					      duration: 0.25,
					      effect:'sineOut'
					   },
					   onStop: function (elem) {
						  $(".overlay").remove();
					   }
				}).play();
			});
			break;
	}
};

// --------------------------- //

//-- Function Vars  -- //

var hardReset = function() {
	clearInterval(attractTimer);
	bStarted = false;
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
			console.log("lottery");
			$("#screenContainer").load("lottery.html #lottery_screen" + curScreen, function() {
				console.log("LOAD LOTTERY.HTML");
				animateScenario();
				if (curScreen == 1) {
					$("#screenContainer").addClass("lotto1");
				} else if (curScreen == 2) {
					$("#screenContainer").removeClass("lotto1");
					$("#screenContainer").addClass("lotto2");
				} else if (curScreen == 3) {
					$("#screenContainer").removeClass("lotto2");
					$("#screenContainer").addClass("lotto3");
				}
			});
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
			      	time: parseFloat($(this).attr("time")),
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
				      time: parseFloat($(this).attr("time")),
				      duration: 0.25,
				      effect:'easeInOut'
				   },
				   transform:{
				      start: 'rotate(0deg) scale( 0.1 )',
				      stop: 'rotate(720deg) scale( 1 )',
				      time: parseFloat($(this).attr("time")),
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
			      time: parseFloat(anim.timing),
			      units: 'px',
			      duration: 1,
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
			      	time: parseFloat($(this).attr("time")),
			      	duration: 0.5,
			      	effect:'sineOut'
			   },
			   onStop: function(elem) {
					if (i == nextBtnCnt) {
						bindNextBtn();
						bCanClick = true;
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


var ada = false;

var adaChecker = setInterval(function(){adaStyle()}, 500);


var adaStyle = function() {
	if (!ada) {
		console.log("ada OFF");
		$("h1,h2,h3,h4,h5,p,span,.ui-button-text-only,.dialog,.nextBtn,.scenarioSelectBtn,.titleChart,.smaller,.small,.circleText").removeClass("adaStyle");
		
	} else {
		console.log("ada ON");
		$("h1,h2,h3,h4,h5,p,span,.ui-button-text-only,.dialog,.nextBtn,.scenarioSelectBtn,.titleChart,.smaller,.small,.circleText").addClass("adaStyle");
	}
}

$( "#adaBtn" ).on( "click", function() {
	console.log("ADA: ", ada);
	if (!ada) {
		ada = true;
		adaStyle();
	} else {
		ada = false;
		adaStyle();
	}
});

var nwKiosk = function(){
	var mouseHidden =true;
	var kioskMode=true;
	var devTools=true;
	var gui =require('nw.gui');
	//setInterval(focus_window,5000);

	var win = gui.Window.get();
	this.win = win;
	this.gui = gui;
	
	this.setup = function(){$(document).keypress(function(d){
		switch(d.keyCode)
		{
		case 107:
		  (kioskMode) ? win.enterKioskMode() : win.leaveKioskMode() ;
		  kioskMode = !kioskMode;
		  break;
		case 109:
		  (mouseHidden) ? $("body").css("cursor","none") : $("body").css("cursor","pointer") ;
		  mouseHidden=!mouseHidden;
		  break;
		case 100:
		  (devTools) ? gui.Window.get().showDevTools() : gui.Window.get().closeDevTools();
		  devTools=!devTools;
		  break;
		}


	})}
	this.hideMouse = function(){
		$("body").css("cursor","none")
	}
	this.showMouse = function(){
		$("body").css("cursor","pointer")
	}
	
}
$(function(){nwK = new nwKiosk();
nwK.hideMouse();
nwK.setup();})