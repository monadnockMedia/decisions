function cardGraph( sel ){
	var self = this;
	this.months= [
		"JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"
	];
	this.data = null;
	this.axesPad = 10;
	this.sliderP = {
		term : {min: 5, max: 35}
	
	}

	this.amParams = {
	        rate: 20,
	        balance: 1000,
	        contrib: 25
	    }
	this.amParams.length = finance.calculateMonths(this.amParams.balance, this.amParams.rate, this.amParams.contrib);
	this.sliderP.term.max = this.amParams.length;
	this.amortize();
	//set up viewport size, etc.
	this.container = d3.select(sel);
	this.w = this.stripPx(this.container.style("width"));
	this.h = this.stripPx(this.container.style("height"));
	

	this.padding = {
		left: 68,
		right: 80,
		top: 30,
		bottom: 60,
		font: 4
	}
	this.innerWidth = this.w - this.padding.left - this.padding.right;
	this.innerHeight = this.h - this.padding.top - this.padding.bottom;
	this.innerTop = this.padding.top;
	this.innerRight = this.w - this.padding.right;
	this.innerBottom = this.h - this.padding.bottom;
	this.innerLeft = this.padding.left;
	var gutter = 25;
	

	
	var clipGutter = 5;
	//now call some functions to build a graph
	this.setScales();
	
		
	this.setAxes();

	//add an svg element to draw the graph in
	this.svg = this.container.append("svg").attr({
		width: this.w,
		height: this.h,
		class: "lineGraph"
	});

	


		
	this.addYears();
	this.addAxes();
	this.addBars();

	//this.addLegend();
	this.buildSliders();
	
	d3.select(sel).append("div").attr("class", "bartip");
	var ww = $("<div id='warnWrap'/>");
	$(sel).append(ww.load("warning.html .card").click(function(){$(this).find("div").toggleClass(" active inactive ")}))
	
}

var cgP = cardGraph.prototype;

cgP.setScales = function(){
		var self = this;
	//set up scales for each axis / datum
/*	this.scales.x = d3.time.scale()
		.range([this.padding.left, this.innerRight])
		.domain(d3.extent(this.data, function(d){return +d.date}));*/
	this.scales = {};
	this.scales.range = {};
	this.scales.range.x = [this.innerLeft, this.innerRight];
	
	this.scales.range.y = [ this.innerBottom, this.innerTop];
	

	
/*this.scales.x = d3.time.scale()
		.range(this.scales.range.x)
		.domain(d3.extent(this.data, function(d){return +d.date}));*/
		

		
	this.scales.y = d3.scale.linear()
		.range(this.scales.range.y) //svg origin is top-left
	//	.domain([0,this.cars.Luxury]);
		.domain([0,d3.max(this.data, function(d){return +d.totalPaid})]);
		
	this.scales.iy = d3.scale.linear()
		.range([ this.innerTop, this.innerBottom]) //svg origin is top-left
		.domain([0,d3.max(this.data, function(d){return +d.totalPaid})]);
		
	this.scales.height = d3.scale.linear()
			.range([ 0, this.innerHeight]) //svg origin is top-left
			.domain([0,d3.max(this.data, function(d){return +d.totalPaid})]);
	
	this.scales.bar = d3.scale.ordinal().domain(d3.range(0,self.data.length))
		.rangeBands(this.scales.range.x)
		
		
		this.scales.yearBox = d3.scale.linear()
			.range(this.scales.range.x)
			.domain([0, +this.data.length]) 
		
	
}

cgP.updateScales = function(){
/*	this.scales.x
		.domain(d3.extent(this.data, function(d){return +d.date})); */
		
	this.scales.y
		.domain([0,d3.max(this.data, function(d){return +d.totalPaid})]);
		
		this.scales.yearBox.domain([0, +this.data.length])
}

cgP.setAxes = function(){
	//set up axes
	

	
/*	this.xA = d3.svg.axis()
		.scale(this.scales.x)
		.orient("bottom")
		.ticks(this.data.length)
		.tickFormat(function(t){return t.getUTCFullYear()}); */
		
	this.yA = d3.svg.axis()
		.scale(this.scales.y)
		.orient('left')
		.tickFormat(function(t){return finance.format(t, 'USD')})
		
/*	this.bA = d3.svg.axis()
		.scale(this.scales.iy)
		.orient('left')
		.tickValues([0,this.amParams.contrib])
		.tickFormat(function(t){return finance.format(t, 'USD')}) */
}
cgP.addAxes = function(){

/*	this.svg.append("g").attr({
			class: "x axis",
			transform: "translate(0,"+(this.h - this.padding.bottom + this.axesPad ) +")", //transform from top-left to bottom-left (minus padding)
		}).call(this.xA) */
	/*this.barGroup.append("g").attr({
			class: "y axis lifted",
			transform: "translate("+(this.padding.left-this.axesPad ) +","+0+")"
	}).call(this.bA)*/
		
	this.svg.append("g").attr({
		class: "y axis lifted",
		transform: "translate("+(this.padding.left-this.axesPad ) +","+0+")"
	}).call(this.yA)
	
}
cgP.updateAxes = function(){
	this.yA.scale(this.scales.y);
//	this.lineGroup.select(".y.axis").transition().call(this.yA);
	
//	this.xA.scale(this.scales.x);
//	this.lineGroup.select(".x.axis").transition().call(this.xA);
}
cgP.amortize = function(){
	with (this.amParams){
		var amort = finance.calculateAmortization(balance, length, rate);
		var dOff;
		amort.forEach(function(o,i){
		//	console.log("item "+i+" :: "+o);
			o.month = i;
			if(i==0){
				
				dOff = +o.date.getFullYear();
				o.year = 0;
				o.cumToPrinciple = o.paymentToPrinciple;
			}else{
				o.year = +o.date.getFullYear() - dOff;
				o.cumToPrinciple = amort[i-1].cumToPrinciple + o.paymentToPrinciple;	
			}
			o.totalPaid = o.cumToPrinciple + o.interest;
		})
		this.amParams.contrib = amort[amort.length-1].payment;
		this.data = amort;
	}
}


cgP.addLines = function(){
		var self = this;
	//create line functions
	this.lineFunctions = {
	
		interest : d3.svg.line()
			.x(function(d){ return self.scales.x(d.date) })
			.y(function(d){ return self.scales.y(d.interest)}),
		
		balance : d3.svg.line()
			.x(function(d){ return self.scales.x(d.date) })
			.y(function(d){ return self.scales.y(d.principle)}),
		
		total : d3.svg.line()
			.x(function(d){ return self.scales.x(d.date) })
			.y(function(d){ return self.scales.y(d.totalPaid)}),
		
		
		area : d3.svg.line()
			.x(function(d){ return self.scales.x(d.date) })
			.y(function(d){ return self.scales.y(d.val)}),
			
		principle : d3.svg.line()
			.x(function(d){ return self.scales.x(d.date) })
			.y(function(d){ return self.scales.y(d.val)}),
		}

	//Append groups and child paths for area, total, balance.
	this.area = this.lineGroup.append("path").attr("class","line area").attr("id","interestArea");
	this.total = this.lineGroup.append("path").attr("class","line total lifted").attr("id","lineTotal");
	//this.balance = this.lineGroup.append("path").attr("class","line balance lifted").attr("id","lineBalance");
	//invisible line for label to align to 
	this.mid = this.lineGroup.append("path").attr("id","toPrinciple");
	
	//add a group for labels
	this.lineLabel = this.lineGroup.append("g").attr("class","linelabel");
	
	//an object to access our labels	
	this.labels = {};
	
	//Total labels
	this.labels.TotalPaid = this.lineLabel.append("text");
	this.labels.TotalInterest = this.lineLabel.append("text");
	
	
	
	
/*	this.labels.Balance = this.lineLabel.append("text").attr({
		class: "balance",
		dy: -5
	}).append("textPath").text("Balance").attr(	"startOffset","5%");*/
	
	this.labels.Total = this.lineLabel.append("text").attr({
		class: " total",
		dy:-5
	}).append("textPath").text("Total Paid").attr(	"startOffset","70%");
	

	
	this.labels.Interest = this.lineLabel.append("text").attr({
		class: " outline interestPaid",
		dy:5
	}).append("textPath").text("Total Interest Paid").attr(	"startOffset","70%")
	
	this.drawLines();
	
}

cgP.drawLines = function(){
		var self = this;
	var prin = this.data.map(function(d){return {date: d.date, val: d.cumToPrinciple}});
	var total = this.data.map(function(d){return {date: d.date, val: d.totalPaid}});
	var mid = this.data.map(function(d){return {date: d.date, val: d.totalPaid-((d.totalPaid-d.cumToPrinciple)/2)}});
	var totalPaid = total[total.length-1].val;
	var toPrin = prin[prin.length-1].val;
	
//	console.log("TotalPaid: "+totalPaid);
//	console.log("toPrinciple: "+toPrin);
	
	
	
	areaData = prin.concat(total.reverse());
	this.area.datum(areaData)
		.transition().duration(150).style("opacity",0).attr("d", self.lineFunctions.area)
		.transition().duration(1500).style("opacity",1);
	this.total.datum(this.data).transition().delay(170).attr("d", self.lineFunctions.total);
//	this.interest.datum(this.data).attr("d", this.lineFunctions.interest);
//	this.balance.datum(this.data).transition().attr("d", this.lineFunctions.balance);
	
	this.mid.datum(mid).attr("d", this.lineFunctions.principle);

	nodeRad = 6;
	


	
	//position the total paid labels
	this.labels.TotalPaid.attr({
		x: self.innerRight+self.padding.font-(nodeRad/2),
		y: self.scales.y(self.data[self.data.length-1].totalPaid)+(nodeRad/2)
	}).text("\u25C2"+finance.format(totalPaid.toFixed(0), 'USD'));
	
	this.labels.TotalInterest.attr({
		x: self.innerRight+self.padding.font-(nodeRad-1),
		y: self.scales.y(mid[mid.length-1].val)+(nodeRad/2)
	}).text("-"+finance.format(( totalPaid - toPrin  ).toFixed(0), 'USD'));
	
	//attach path-following labels to correct path IDs
	/*this.labels.Balance.attr({
		"xlink:href":"#lineBalance",
	})*/
	
	this.labels.Total.attr({
		"xlink:href":"#lineTotal",
	})
	
	this.labels.Interest.attr({
		"xlink:href":"#toPrinciple",
	})
}

cgP.addBars = function(){
	this.barGroup = this.svg.append("g").attr("class","barGroup");
	this.drawBars();
}

cgP.drawBars = function(){
	(!this.barGroup.empty()) ? this.barGroup.selectAll("*").remove() : null ;
	var self = this;
	var delayStep = 5;
	var principle = this.barGroup.selectAll("rect.principle").data(this.data).enter().append("rect").attr({
		width: function(d,i){return self.scales.bar.rangeBand()-3},
		x: function(d,i){return self.scales.yearBox(i) +1	}, 
		y: self.innerBottom,
		height: function(d,i){
			//console.log("HEIGHT", d.paymentToInterest); 
	
			//return self.scales.height(d.cumToPrinciple)
			return 0;
			},
		
		class: "principle"
	})
	.transition().delay(function(d,i){return i*delayStep})
	.attr({
			height: function(d,i){
				//console.log("HEIGHT", d.paymentToInterest); 
				return self.scales.height(d.cumToPrinciple)},
			y: function(d){return self.innerBottom - self.scales.height(d.cumToPrinciple)}
	})
	
	var interest = this.barGroup.selectAll("rect.interest").data(this.data).enter().append("rect")
	.attr({
		width: function(d,i){return self.scales.bar.rangeBand()-3},
		x: function(d,i){return self.scales.yearBox(i)+1 }, 
		height: function(d,i){
			//console.log("HEIGHT", d.interest); 
			return 0},
			y: self.innerBottom,
	//	y: function(d){return self.innerBottom - self.scales.height(d.cumToPrinciple) },
		class: "interest"
	})
	.transition().delay(function(d,i){return i*delayStep})
	.attr({
			x: function(d,i){return self.scales.yearBox(i)+1 }, 
			y: function(d){return (self.innerBottom - self.scales.height(d.cumToPrinciple) - self.scales.height(d.interest)) } ,
			height: function(d,i){
				//console.log("HEIGHT", d.interest); 
				return self.scales.height(d.interest)}
		})
		
	this.barGroup.selectAll("rect").on("click", function(d,i){ 
		console.log("clicked", d);
		var text = "<p>Interest: ";
		text+= "<strong class='highlight_interest'>"+self.formatDollars(d.interest)+"</strong></p>";
		text+= "<p>Principal: ";
		text+= "<strong class='highlight_principal'>"+self.formatDollars(d.cumToPrinciple)+"</strong>";
	
		$(".bartip").css({
			"left": d3.event.clientX,
			"top": d3.event.clientY
		}).html(text);

	
	})
}

cgP.addYears = function(){
	
	var boxPad = 4;
	

	this.yearGroup = this.svg.append("g").attr("class","yearGroup").attr("transform","translate(0,"+(this.innerBottom+5)+")");


	this.drawYears();
	
}	

cgP.drawYears = function(){
		var self = this;
	this.yearGroup.selectAll("g").remove();
	this.yearRanges = this.yearRangeData();
	this.years = this.yearGroup.selectAll("g").data(this.yearRanges);
	//console.table(this.yearRanges);
	this.years.enter().append("g").attr({
		transform: function(d){return "translate("+self.scales.yearBox(d.min)+",0)" }
	})
	this.years.exit().remove();
	

	//rect to outline year band
	this.years.append("rect").attr({
		x: 0,
		y:0,
		width: function(d){
			return +self.scales.yearBox(d.max-d.min)-self.scales.yearBox.range()[0]-2
			},
		height: 20,
		class: "yearBar",
		"stroke-dasharray":"2,1"

	});  

	this.years.append("text").text(function(d){
			var wide = +self.scales.yearBox(d.max-d.min)-self.scales.yearBox.range()[0]-2;
			console.log("wide ",wide);
			var date = (wide >= 40) ? d.date.getFullYear() : "'"+String(d.date.getFullYear()).substr(2,2);
			return date;
		}).attr(
		{"class":"year outlinesm", y:20-self.padding.font,
		x:self.padding.font});
	
}

cgP.yearRangeData = function(){
	var self = this;
	yR = [];
	var y = -1;
	var lastI = -1;
	$.each(self.data, function(i,d){
		if(+d.year != y){
			y = d.year;
			var o = {};
			o.min = i;
			o.date = d.date;
			yR.push(o);
			lastI = i;
		}
		
	})  
	
	res = yR.map(function(d,i){
		I = (i == yR.length-1) ? self.data.length : yR[i+1].min;
		var ret = d;
		ret.max = I;
		return ret;
	})
	return res;
}

cgP.formatDollars = function(d){

	var ret = finance.format(d, 'USD');
	console.log("format",d,ret);
	if(ret.indexOf(".") > 0){
		ret = (ret.split(".")[1].length == 2 ) ? ret : ret+"0";
	}
	
	return ret;
}

cgP.buildSliders = function(){
	var self = this;
	var makeFraction = function( num ){
		var rem = num%12;
	
		var int = (num-rem)/12;
		console.log("remainder",rem);
		return '<span class = "int">'+int+'</span><span class = "fraction"><span class="top">'+rem+'</span><span class="bottom">12</span></span>';
	
		
	}
	
	var dateFilter = function ( num ){
		var rem = num%12;
		
		var int = (num-rem)/12;
		int = num/12;
		//if(rem == 6) int+=0.5;
		
		return(~~int+1);
	}
	
	this.container.append("div").attr({"class":"tooltip"}).append("h1");
	

	
	this.container.append("div").attr().append("h1").attr({
		class: "card payment",
		title: "Monthly Payment",
		style:  "margin-left:"+this.padding.left+"px"
	}).text( this.formatDollars(this.amParams.contrib) );
	
	this.termSlider = this.container.append("div").attr({
		"class": "slider term card",
		title: "Months to Pay"
		
		});

	
	$(".slider").css({
		"margin-left": this.padding.left,
		"margin-right": this.padding.right
	});



	var moveTip = function(ui) {
			
		
		};
	
	var hideTip = function(){
		$(".tooltip").animate({
			opacity: 0
		})
	}
	
	var showTip = function(){
		$(".tooltip").animate({
			opacity: 1
		})
	}

	$(".slider.term").slider({
		min: self.sliderP.term.min,
		max: self.sliderP.term.max,
		value: self.sliderP.term.max,
		
		slide: function(ev, ui){
			$(this).find(".ui-slider-handle").html("");
			//console.log(ui.handle);
			$(".tooltip").css({
				"left": self.sliderScales.term(ui.value),
				"top": $(ui.handle).offset().top
			}).html(/*dateFilter(ui.value)*/ ui.value)
	
			
			
		},
		stop: function(ev,ui){
			$(this).find(".ui-slider-handle").html(/*dateFilter(ui.value)*/ ui.value);
			hideTip();
			self.amParams.length = ui.value;
			self.redraw();
		}
	}).find("a").html(self.sliderP.term.max);
	
	this.sliderScales = {};
	termOff = $(".slider.term").offset();
	termW = $(".slider.term").width();
	this.sliderScales.term = d3.scale.linear()
		.range([termOff.left,termOff.left+termW ])
		.domain([self.sliderP.term.min,self.sliderP.term.max]);
	
	



	
	$(".slider").slider({
		start: function(ev,ui){
		//	moveTip(ui);
			showTip();
		}
	});
	
	rectSize = 12;
	legendPad = 6;
	
	txtLeft = rectSize+this.padding.font;
	rectLeft = 0;

	

}
cgP.redraw = function(){
	console.log("REDRAW");
	this.amortize();
	this.updateScales();
	this.updateAxes();
	this.drawBars();
	this.drawYears();
	$(".bartip").css("left", 1200);
	$(".card.payment").html(this.formatDollars(this.amParams.contrib));
}



cgP.stripPx = function(_str){
	i = _str.indexOf("px");
	return +_str.slice(0,i);
}