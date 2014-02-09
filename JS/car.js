function carGraph( sel, _data ){
	self = this;
	this.months= [
		"JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"
	];
	this.data = null;
	this.sliderP = {
		rate : {min: 1, max: 21},
		contribution : {min: 200, max: 1000}
	}
	this.cars = {
		"economy":15000,
		'midsized':25000,
		'luxury':50000
	}
	this.amParams = {
		contrib: 450,
		rate: 2,
		balance: this.cars.midsized
	}
	this.amortize();
	//set up viewport size, etc.
	this.container = d3.select(sel);
	this.w = this.stripPx(this.container.style("width"));
	this.h = this.stripPx(this.container.style("height"));
	this.padding = {
		left: 60,
		right: 30,
		top: 30,
		bottom: 50
	}
	this.innerWidth = this.w - this.padding.left - this.padding.right;
	this.innerHeight = this.h - this.padding.top - this.padding.bottom;
	this.innerTop = this.h - this.padding.top;
	this.innerRight = this.w - this.padding.right;
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
	this.chartBody = this.svg.append("g")
		.attr("clip-path", "url(#clip)").attr("class","chartBody")
	
	this.addAxes();
	this.addLines();
	
}

cgP = carGraph.prototype;

cgP.setScales = function(){
	//set up scales for each axis / datum
/*	this.xs = d3.time.scale()
		.range([this.padding.left, this.innerRight])
		.domain(d3.extent(this.data, function(d){return +d.date}));*/
		
	this.xs = d3.time.scale()
		.range([this.padding.left, this.innerRight])
		.domain(d3.extent(this.data, function(d){return +d.date}));
		
	this.ys = d3.scale.linear()
		.range([ this.h - this.padding.bottom, this.padding.top]) //svg origin is top-left
		.domain([0,d3.max(this.data, function(d){return +d.totalPaid})]);
}

cgP.updateScales = function(){
	this.xs
		.domain(d3.extent(this.data, function(d){return +d.date}));
		
	this.ys
		.domain([0,d3.max(this.data, function(d){return +d.totalPaid})]);
}

cgP.setAxes = function(){
	//set up axes
	

	
	this.xA = d3.svg.axis()
		.scale(this.xs)
		.orient("bottom")
		.ticks(10)
		.tickFormat(function(t){return t.getUTCFullYear()});
		
	this.yA = d3.svg.axis()
		.scale(this.ys)
		.orient('left')
		.tickFormat(function(t){return finance.format(t, 'USD')})
}
cgP.addAxes = function(){

	this.svg.append("g").attr({
			class: "x axis",
			transform: "translate(0,"+(this.h - this.padding.bottom) +")", //transform from top-left to bottom-left (minus padding)
		}).call(this.xA)
	
		
		
	this.svg.append("g").attr({
		class: "y axis",
		transform: "translate("+(this.padding.left-2) +","+0+")"
	}).call(this.yA)
}
cgP.updateAxes = function(){
	this.yA.scale(this.ys);
	this.svg.select(".y.axis").call(this.yA);
	
	this.xA.scale(this.xs);
	this.svg.select(".x.axis").call(this.xA);
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
	this.lineFunctions = {
	
		interest : d3.svg.line()
			.x(function(d){ return self.xs(d.date) })
			.y(function(d){ return self.ys(d.interest)}),
		
		balance : d3.svg.line()
			.x(function(d){ return self.xs(d.date) })
			.y(function(d){ return self.ys(d.principle)}),
		
		total : d3.svg.line()
			.x(function(d){ return self.xs(d.date) })
			.y(function(d){ return self.ys(d.totalPaid)}),
		
		
		area : d3.svg.line()
			.x(function(d){ return self.xs(d.date) })
			.y(function(d){ return self.ys(d.val)}),
		}

	this.lineGroup = this.svg.append("g").attr("class","lineGroup");
	this.area = this.lineGroup.append("path").attr("class","line area");
	this.total = this.lineGroup.append("path").attr("class","line total");
	this.interest = this.lineGroup.append("path").attr("class","line interest");
	
	this.balance = this.lineGroup.append("path").attr("class","line balance");
	this.drawLines();
	this.buildSliders();
}

cgP.drawLines = function(){
	var prin = this.data.map(function(d){return {date: d.date, val: d.cumToPrinciple}});
	var total = this.data.map(function(d){return {date: d.date, val: d.totalPaid}});
	
	areaData = prin.concat(total.reverse());
	this.area.datum(areaData).transition().style("opacity",0).attr("d", self.lineFunctions.area).transition().style("opacity",1);
	this.total.datum(this.data).transition().attr("d", self.lineFunctions.total);
//	this.interest.datum(this.data).attr("d", this.lineFunctions.interest);
	this.balance.datum(this.data).transition().attr("d", this.lineFunctions.balance)
}



cgP.buildSliders = function(){
	this.container.append("div").attr({"class":"tooltip"}).append("h1");

	
	this.contributionSlider = this.container.append("div").attr({
		"class": "slider contribution car",
		title: "Payment"
		
		});
	this.rateSlider = this.container.append("div").attr(	{
			"class": "slider rate car",
			title: "Loan APR"
			});
	
	$(".slider").css({
		"margin-left": this.padding.left*2.5,
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
		slide: function(ev, ui){
			console.log(ui.handle);
			$(".tooltip").css({
				"left": self.sliderScales.contribution(ui.value),
				"top": $(ui.handle).offset().top
			}).html("$"+ui.value)
			//setTimeout(moveTip(ui), 15);
			self.amParams.contrib = ui.value;
			
		},
		stop: function(ev,ui){
			$(this).find(".ui-slider-handle").text("$"+ui.value);
			hideTip();
			self.redraw();
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
			console.log("rateChange")
			$(".tooltip").css({
				"left": self.sliderScales.rate(ui.value),
				"top": $(ui.handle).offset().top
			}).html(ui.value+"%")
			self.amParams.rate = ui.value;
	
		},
		stop: function(ev,ui){
			$(this).find(".ui-slider-handle").text(ui.value+"%");
			hideTip();
			console.log(self.amParams);
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
	

}
cgP.redraw = function(){
	this.amortize();
	this.updateScales();
	this.updateAxes();
	this.drawLines();
}



cgP.stripPx = function(_str){
	i = _str.indexOf("px");
	return +_str.slice(0,i);
}