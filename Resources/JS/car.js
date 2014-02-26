function carGraph( sel, _data ){
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
		contrib: 450,
		rate: 20,
	//	balance: this.cars.Midsized
	balance: 10000
	}
	this.amortize();
	//set up viewport size, etc.
	this.container = d3.select(sel);
	this.w = this.stripPx(this.container.style("width"));
	this.h = this.stripPx(this.container.style("height"));
	this.padding = {
		left: 70,
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
	this.addBars();
	this.addLines();
	this.addLegend();
	this.buildSliders();
	
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
	this.scales.range.y = [ this.h - this.padding.bottom, this.padding.top];
	
	this.scales.x = d3.time.scale()
		.range(this.scales.range.x)
		.domain(d3.extent(this.data, function(d){return +d.date}));
		
	this.scales.y = d3.scale.linear()
		.range(this.scales.range.y) //svg origin is top-left
		.domain([0,this.cars.Luxury]);
	//	.domain([0,d3.max(this.data, function(d){return +d.totalPaid})]);
		
		this.scales.iy = d3.scale.linear()
			.range(this.scales.range.y) //svg origin is top-left
			.domain([0,self.amParams.contrib]);
			
	this.scales.box = d3.scale.ordinal()
		.rangeRoundBands(this.scales.range.x, 0)
		.domain(d3.range(this.data.length))
		
	
}

cgP.updateScales = function(){
	this.scales.x
		.domain(d3.extent(this.data, function(d){return +d.date}));
		
	this.scales.y
	.domain([0,this.cars.Luxury]);
		//.domain([0,d3.max(this.data, function(d){return +d.totalPaid})]);
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
}
cgP.addAxes = function(){

/*	this.svg.append("g").attr({
			class: "x axis",
			transform: "translate(0,"+(this.h - this.padding.bottom + this.axesPad ) +")", //transform from top-left to bottom-left (minus padding)
		}).call(this.xA) */
	
		
	this.svg.append("g").attr({
		class: "y axis lifted",
		transform: "translate("+(this.padding.left-this.axesPad ) +","+0+")"
	}).call(this.yA)
}
cgP.updateAxes = function(){
	this.yA.scale(this.scales.y);
	this.svg.select(".y.axis").transition().call(this.yA);
	
	this.xA.scale(this.scales.x);
	this.svg.select(".x.axis").transition().call(this.xA);
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
		}

	this.lineGroup = this.svg.append("g").attr("class","lineGroup");
	this.area = this.lineGroup.append("path").attr("class","line area");
	this.total = this.lineGroup.append("path").attr("class","line total");
	this.interest = this.lineGroup.append("path").attr("class","line interest");
	
	this.balance = this.lineGroup.append("path").attr("class","line balance lifted");
	this.lineLabel = this.lineGroup.append("g").attr("class","lifted");
	this.lineNode = this.lineLabel.append("circle").attr({
		class:"balance"})
		
	this.lineText = this.lineLabel.append("text").attr({
		class: "linelabel "
	}).text("Balance")
	
	this.drawLines();
	
}

cgP.drawLines = function(){
	var prin = this.data.map(function(d){return {date: d.date, val: d.cumToPrinciple}});
	var total = this.data.map(function(d){return {date: d.date, val: d.totalPaid}});
	
	areaData = prin.concat(total.reverse());
	this.area.datum(areaData)
		.transition().duration(150).style("opacity",0).attr("d", self.lineFunctions.area)
		.transition().duration(1500).style("opacity",1);
	this.total.datum(this.data).transition().delay(170).attr("d", self.lineFunctions.total);
//	this.interest.datum(this.data).attr("d", this.lineFunctions.interest);
	this.balance.datum(this.data).transition().attr("d", this.lineFunctions.balance);
	

	
	this.lineNode.attr({
		r: 6,
		cx: self.scales.box(0),
		cy: self.scales.y(self.data[0].principle)
	})
	
	this.lineText.attr({
		transform: "translate("+(self.scales.box(0)+12)+","+ (self.scales.y(self.data[0].principle)-8)+") rotate(-45)",
		
	})
}



cgP.addBars = function(){
	this.barGroup = this.svg.append("g").attr("class","barGroup");
	
	boxWidth = 6;
	this.bar = this.barGroup.selectAll("g").data(this.data).enter().append("g")
		.attr("class","bar")
		.attr("transform", function(d,i){return "translate("+(self.scales.box(i))+",0)"})
	
		
	lines = false;
	bars = true;
	if (!lines && bars)
	{
		
	
	//principle bar
	this.bar.append("rect")
		.attr({
		//	x: function(d,i){return self.scales.box(i)},
			y: function(d){return self.scales.iy( d.paymentToPrinciple )},
			height: function(d){return (self.h - self.padding.bottom ) - self.scales.iy(d.paymentToPrinciple)},
			width: this.scales.box.rangeBand()-4,
			"class": "principle",
		})
	//interest bar	
	this.bar.append("rect")
		.attr({
		//	x: function(d,i){return self.scales.box(i)},
			y: function(d){return self.scales.iy(d.payment) },
			height: function(d){return (self.h - self.padding.bottom ) - self.scales.iy(d.paymentToInterest)-1},
			width: this.scales.box.rangeBand()-4,
			"class": "interest"
		}) 

	}
	
	if (!lines && !bars)
	{
		
	
	
	this.bar.append("rect")
		.attr({
			x: function(d,i){return self.scales.box(i)},
			y: function(d){return self.scales.y( d.cumToPrinciple )},
			height: function(d){return (self.h - self.padding.bottom ) - self.scales.y(d.cumToPrinciple)},
			width: this.scales.box.rangeBand()-4,
			"class": "principle"
		})
		
	this.bar.append("rect")
		.attr({
			x: function(d,i){return self.scales.box(i)},
			y: function(d){return self.scales.y(d.totalPaid) },
			height: function(d){return (self.h - self.padding.bottom ) - self.scales.y(d.interest)-1},
			width: this.scales.box.rangeBand()-4,
			"class": "interest"
		}) 

	}
	
	this.bar.append("text")
		.attr({
			x:(self.scales.box.rangeBand()/2),
	
			y: self.h - self.padding.bottom + 18,
			"text-anchor": "middle",
			"class":"year"
		}).text(function(d, i){  
			var ret = null;
			if(+d.date.getMonth() % 12 == 0 || i == 0){
				ret = d.date.getFullYear();
			}
			return ret;
			})
			
	this.bar.append("text")
		.attr({
			
		//	x:function(d,i){return self.scales.box(i) + (self.scales.box.rangeBand()/2)},
			
		//	y: self.h - self.padding.bottom + 15,
			transform: "translate("+(self.scales.box.rangeBand()/2)+","+(self.h - self.padding.bottom - 15) +") rotate(-90)",
			"text-anchor": "middle",
			"class" : "month"
			
		}).text(function(d){  
			ret = self.months[+d.date.getMonth()];
			return ret;
		})
		
	if (lines)
	{
	this.pLine = this.bar.append("line").attr("class","principle")
		.attr({
			x1: 0, 
			y1: self.h - self.padding.bottom,
			x2: 0, 
			y2: function(d){return self.scales.iy(d.paymentToPrinciple)}
			
		})
		
		this.iLine = this.bar.append("line")
			.attr({
				x1: 0, 
				y1: function(d){return self.scales.iy(d.paymentToPrinciple)},
				x2: 0, 
				y2: function(d){return self.scales.iy(d.payment)},
				fill: "#f00",
				class:"interest"

			})}
}		

cgP.addLegend = function(){
	
	this.legend = this.container.append("div").attr("id","legend");
	
	this.legend.append("div").attr("class","key payment interest");
	this.legend.append("p").text("Payment to Interest")
	
	this.legend.append("div").attr("class","key principle interest");
	this.legend.append("p").text("Payment to Principle")
	
}

cgP.buildSliders = function(){
	this.buttonParams = [
	{name: "Economy", price:15000, icon:"blank.svg"},
	{name: "Midsized", price:25000, icon:"blank.svg"},
	{name: "Luxury", price:50000, icon:"blank.svg"}]
	
	
	
	this.container.append("div").attr({"class":"tooltip"}).append("h1");
	this.container.append("div").attr({
		"class":"buttons",
		"title":"Car Type"})
		.selectAll("div").data(this.buttonParams).enter().append("div")
		.attr({
			"class": function(d){return "carButton "+d.name},
			"type":function(d){return d.name}
			}).html(function(d){return d.name});
	
	$(".carButton").button().click(function( event ) {
		var type = $(this).attr("type");
		console.log(type);
		$(".carButton").each(function(){
			check = $(this).attr("type") == type;
			$(this).toggleClass("car-selected", check);
		});
		self.amParams.balance = self.cars[type];
		console.log(self.amParams);
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
		slide: function(ev, ui){
			console.log(ui.handle);
			$(".tooltip").css({
				"left": self.sliderScales.contribution(ui.value),
				"top": $(ui.handle).offset().top
			}).html("$"+ui.value)
			//setTimeout(moveTip(ui), 15);
			
			
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