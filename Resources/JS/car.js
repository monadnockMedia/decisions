function carGraph( sel, cartype ){
	self = this;
	this.months= [
		"JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"
	];
	this.data = null;
	this.axesPad = 10;
	this.sliderP = {
		rate : {min: 1, max: 21},
		contribution : {min: 200, max: 1000}
	}
	this.cars = {
		"Economy":15000,
		'Midsized':25000,
		'Luxury':50000
	}
	this.amParams = {
		contrib: 600,
		rate: 7,
	//	balance: this.cars.Midsizeds
		balance: this.cars[cartype]
	}
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
	this.innerTop = this.h - this.padding.top;
	this.innerRight = this.w - this.padding.right;
	
	
	var gutter = 25;
	
	this.lineGroupH = (this.h - this.padding.bottom);
	
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
	
	this.lineGroup = this.svg.append("g").attr("class","lineGroup");
	
	//and a clipping mask for lines (so they don't cross the y-axis)
	this.svg.append("defs").append("clipPath")
		.attr("id","clip")
		.append("svg:rect")
		.attr({
			x: this.padding.left + clipGutter,
			y: 0,
			width: this.innerWidth - clipGutter,
			height: this.innerHeight
		})
	
	//and a group for the chart's lines, masked by the clipPath
	this.chartBody = this.lineGroup.append("g")
		.attr("clip-path", "url(#clip)").attr("class","chartBody")
		
	this.addBars();
	this.addAxes();
	
	this.addLines();
	//this.addLegend();
	this.buildSliders();
	
	var ww = $("<div id='warnWrap'/>")
	$(sel).append(ww.load("warning.html .car").click(function(){$(this).find("div").toggleClass(" active inactive ")}))
	
}

cgP = carGraph.prototype;

cgP.setScales = function(){
	//set up scales for each axis / datum
/*	this.scales.x = d3.time.scale()
		.range([this.padding.left, this.innerRight])
		.domain(d3.extent(this.data, function(d){return +d.date}));*/
	this.scales = {};
	this.scales.range = {};
	this.scales.range.x = [this.padding.left, this.innerRight];
	
	this.scales.range.y = [ this.lineGroupH, this.padding.top];
	
	this.scales.range.boxy = [this.barGroupH,0];
	
	this.scales.x = d3.time.scale()
		.range(this.scales.range.x)
		.domain(d3.extent(this.data, function(d){return +d.date}));
		

		
	this.scales.y = d3.scale.linear()
		.range(this.scales.range.y) //svg origin is top-left
	//	.domain([0,this.cars.Luxury]);
		.domain([0,d3.max(this.data, function(d){return +d.totalPaid})]);
		
		this.scales.iy = d3.scale.linear()
			.range(this.scales.range.boxy) //svg origin is top-left
			.domain([0,self.amParams.contrib]);
			
/*	this.scales.box = d3.scale.ordinal()
		.rangeBands(this.scales.range.x)
		.domain([0, +this.data.length]) */
		this.scales.box = d3.scale.linear()
			.range(this.scales.range.x)
			.domain([0, +this.data.length])
		
	
}

cgP.updateScales = function(){
	this.scales.x
		.domain(d3.extent(this.data, function(d){return +d.date}));
		
	this.scales.y
	//.domain([0,this.cars.Luxury]);
		.domain([0,d3.max(this.data, function(d){return +d.totalPaid})]);
		
		this.scales.box.domain([0, +this.data.length])
}

cgP.setAxes = function(){
	//set up axes
	

	
	this.xA = d3.svg.axis()
		.scale(this.scales.x)
		.orient("bottom")
		.ticks(this.data.length)
		.tickFormat(function(t){return t.getUTCFullYear()});
		
	this.yA = d3.svg.axis()
		.scale(this.scales.y)
		.orient('left')
		.tickFormat(function(t){return finance.format(t, 'USD')})
		
	this.bA = d3.svg.axis()
		.scale(this.scales.iy)
		.orient('left')
		.tickValues([0,this.amParams.contrib])
		.tickFormat(function(t){return finance.format(t, 'USD')})
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
		
	this.lineGroup.append("g").attr({
		class: "y axis lifted",
		transform: "translate("+(this.padding.left-this.axesPad ) +","+0+")"
	}).call(this.yA)
	
}
cgP.updateAxes = function(){
	this.yA.scale(this.scales.y);
	this.lineGroup.select(".y.axis").transition().call(this.yA);
	
	this.xA.scale(this.scales.x);
	this.lineGroup.select(".x.axis").transition().call(this.xA);
}
cgP.amortize = function(){
	with (this.amParams){
		this.amParams.length = finance.calculateMonths(balance, rate, contrib);
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
		this.data = amort;
	}
}

cgP.addLines = function(){
	
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
	
	var boxPad = 4;
	

	this.yearGroup = this.svg.append("g").attr("class","yearGroup").attr("transform","translate(0,"+(this.lineGroupH)+")");


	this.drawBars();

	
	
	
	
	
	
}	

cgP.drawBars = function(){
	this.yearGroup.selectAll("g").remove();
	this.yearRanges = this.yearRangeData();
	this.years = this.yearGroup.selectAll("g").data(this.yearRanges);
	console.table(this.yearRanges);
	this.years.enter().append("g").attr({
		transform: function(d){return "translate("+self.scales.box(d.min)+",0)" }
	})
	this.years.exit().remove();
	

	//rect to outline year band
	this.years.append("rect").attr({
		x: 0,
		y:0,
		width: function(d){return +self.scales.box(d.max-d.min)-self.scales.box.range()[0]-2},
		height: 20,
		class: "yearBar",
		"stroke-dasharray":"2,1"

	});  

	this.years.append("text").text(function(d){return  d.date.getFullYear();}).attr(
		{"class":"year outlinesm", y:20-self.padding.font,
		x:self.padding.font});
	
}

cgP.yearRangeData = function(){
	
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


cgP.buildSliders = function(){
	this.buttonParams = [
	{name: "Economy", price:"$15,000", icon:"icon_18516.svg"},
	{name: "Midsized", price:"$25,000", icon:"icon_18509.svg"},
	{name: "Luxury", price:"$50,000", icon:"icon_18564.svg"}]
	
	this.container.append("div").attr({"class":"tooltip"}).append("h1");
	this.sliderDiv = this.container.append("div").attr({class:"carSliders"});
	this.container.append("div").attr({
		"class":"buttons",
		"title":"Car Type"})
		.selectAll("div").data(this.buttonParams).enter().append("div")
		.attr({
			"class": function(d){return "carButton "+d.name},
			"type":function(d){return d.name}
			}).html(function(d){return "<img class = 'carIcon' width ='100px' src = IMAGES/"+d.icon+"> "+d.name+"<br /> "+d.price});
	
	$(".carButton").button().click(function( event ) {
		var type = $(this).attr("type");
		//console.log(type);
		$(".carButton").each(function(){
			check = $(this).attr("type") == type;
			$(this).toggleClass("car-selected", check);
		});
		self.amParams.balance = self.cars[type];
		//console.log(self.amParams);
		self.redraw()
	});
	
	
	this.contributionSlider = this.container.append("div").attr({
		"class": "slider contribution car",
		title: "Payment"
		
		});
	this.rateSlider = this.container.append("div").attr(	{
			"class": "slider rate car",
			title: "Loan APR"
			});
	
	$(".slider").css({
		"margin-left": this.padding.left*2,
		"margin-right": this.padding.right
	});
	$(".buttons").css({
		"margin-left": this.padding.left*2,
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

	$(".slider.contribution").slider({
		min: self.sliderP.contribution.min,
		max: self.sliderP.contribution.max,
		value: self.amParams.contrib,
		step: 50,
		slide: function(ev, ui){
			//console.log(ui.handle);
			$(".tooltip").css({
				"left": self.sliderScales.contribution(ui.value),
				"top": $(ui.handle).offset().top
			}).html("$"+ui.value)
	
			
			
		},
		stop: function(ev,ui){
			$(this).find(".ui-slider-handle").text("$"+ui.value);
			hideTip();
			self.redraw();
			self.amParams.contrib = ui.value;
		}
	}).find("a").html("$"+self.amParams.contrib);
	
	this.sliderScales = {};
	contOff = $(".slider.contribution").offset();
	contW = $(".slider.contribution").width();
	this.sliderScales.contribution = d3.scale.linear()
		.range([contOff.left,contOff.left+contW ])
		.domain([self.sliderP.contribution.min,self.sliderP.contribution.max]);
	
	


	$(".slider.rate").slider({
		min: self.sliderP.rate.min,
		max: self.sliderP.rate.max,
		step: 1,
		value: self.amParams.rate,
		slide: function(ev, ui){
		
			$(".tooltip").css({
				"left": self.sliderScales.rate(ui.value),
				"top": $(ui.handle).offset().top
			}).html(ui.value+"%")
			self.amParams.rate = ui.value;
	
		},
		stop: function(ev,ui){
			$(this).find(".ui-slider-handle").text(ui.value+"%");
			hideTip();
			//console.log(self.amParams);
			self.redraw();
		}
	}).find("a").html(self.amParams.rate+"%");
	
	rateOff = $(".slider.rate").offset();
	rateW = $(".slider.rate").width();
	this.sliderScales.rate = d3.scale.linear()
		.range([rateOff.left,rateOff.left+rateW ])
		.domain([self.sliderP.rate.min,self.sliderP.rate.max]);
	
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
//	txtLeft = 0;
//	rectLeft = 55;
	
/*	this.smLegend = this.barGroup.append("g").attr({
		class: "legend",
		transform: "translate("+(this.innerRight+legendPad)+","+legendPad+")"
	})
	
	
	
	this.iL = this.smLegend.append("g");
	
	this.iL.append("rect").attr({
		x: rectLeft,
		width: rectSize, height: rectSize,
		"class":"interest"
	});
	
	this.iL.append("text").attr({
		y: rectSize-2,
		x: txtLeft,
		"class":"legendText"
	}).text("Interest")
	
	
	this.pL = this.smLegend.append("g").attr("transform","translate(0,"+(rectSize+legendPad)+")");
	
	this.pL.append("rect").attr({
		x: rectLeft,
		width: rectSize, height: rectSize,
		"class":"principle"
	});
	
	this.pL.append("text").attr({
		y: rectSize-2,
		x: txtLeft,
		"class":"legendText"
	}).text("Principle") */

	

}
cgP.redraw = function(){
	this.amortize();
	this.updateScales();
	this.updateAxes();
	this.drawLines();
	this.drawBars();
}



cgP.stripPx = function(_str){
	i = _str.indexOf("px");
	return +_str.slice(0,i);
}