function carGraph( sel, _data ){
	self = this;
	this.months= [
		"JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"
	];
	this.data = null;
	this.cars = {
		"economy":15000,
		'midsized':25000,
		'luxury':50000
	}
	this.amParams = {
		contrib: 200,
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
	this.xs = d3.time.scale()
		.range([this.padding.left, this.innerRight])
		.domain(d3.extent(this.data, function(d){return +d.date}));
		
	this.ys = d3.scale.linear()
		.range([ this.h - this.padding.bottom, this.padding.top]) //svg origin is top-left
		.domain([0,d3.max(this.data, function(d){return +d.totalPaid})]);
}
cgP.setAxes = function(){
	//set up axes
	

	
	this.xA = d3.svg.axis()
		.scale(this.xs)
		.orient("bottom")
		.ticks(this.amParams.length)
		.tickFormat(function(t){return self.months[t.getMonth()]});
		
	this.yA = d3.svg.axis()
		.scale(this.ys)
		.orient('left')
		.tickFormat(function(t){return finance.format(t, 'USD')})
}
cgP.addAxes = function(){

	this.svg.append("g").attr({
			class: "x axis",
			transform: "translate(0,"+(this.h - this.padding.bottom) +")", //transform from top-left to bottom-left (minus padding)
		}).call(this.xA).selectAll("text").attr({
			"text-align":"center",
			"transform":"rotate(90) translate(20 -10) scale(0.8)"
		})
	
		
		
	this.svg.append("g").attr({
		class: "y axis",
		transform: "translate("+this.padding.left +","+0+")"
	}).call(this.yA)
}
cgP.updateAxes = function(){
	this.yA.scale(this.ys);
	this.svg.select(".y.axis").call(this.yA);
}
cgP.amortize = function(){
	with (this.amParams){
		this.amParams.length = finance.calculateMonths(balance, rate, contrib);
		var amort = finance.calculateAmortization(balance, length, rate);
		var dOff;
		amort.forEach(function(o,i){
		//	console.log("item "+i+" :: "+o);
			if(i==0){
				dOff = +o.date.getFullYear();
				o.year = 0;
				o.cumToPrinciple = o.paymentToPrinciple;
				o.totalPaid = o.cumToPrinciple + o.interest;
			}else{
				o.year = +o.date.getFullYear() - dOff;
				o.cumToPrinciple = amort[i-1].cumToPrinciple + o.paymentToPrinciple;
				o.totalPaid = o.cumToPrinciple + o.interest;
			}
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
		}
		

	this.lineGroup = this.svg.append("g").attr("class","lineGroup");
	
	this.total = this.lineGroup.append("path").attr("class","line total");
	this.interest = this.lineGroup.append("path").attr("class","line interest");
	this.balance = this.lineGroup.append("path").attr("class","line balance");
	this.drawLines();
}

cgP.drawLines = function(){
	this.total.datum(this.data).attr("d", self.lineFunctions.total);
	this.interest.datum(this.data).attr("d", this.lineFunctions.interest);
	this.balance.datum(this.data).attr("d", this.lineFunctions.balance);
}
cgP.stripPx = function(_str){
	i = _str.indexOf("px");
	return +_str.slice(0,i);
}