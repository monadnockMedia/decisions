function lineGraph( sel, _data ){
	_self = this;
	this.fvParams = {
		rate: 0.03, 
		weeklyContribution: 10, 
		startAge: 15, 
		endAge: 65,
		offsetMonths: 0
	}
	this.container = d3.select(sel);
	this.data = this.futureValueWeekly(this.fvParams);
	this.vData = this.data;
	this.pData = [];
	this.dotSize = 8;
	this.datalength = this.data.length;
	//set up viewport size, etc.
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
	
	//now add groups for axes, using our axis functions
	this.svg.append("g").attr({
		class: "x axis",
		transform: "translate(0,"+(this.h - this.padding.bottom) +")", //transform from top-left to bottom-left (minus padding)
	}).call(this.xA);

	this.svg.append("g").attr({
		class: "y axis",
		transform: "translate("+this.padding.left +","+0+")"
	}).call(this.yA);

		
	//and a linear function
	this.line = d3.svg.line()
		.x(function(d){return _self.xs(d.WEEK)})
		.y(function(d){return _self.ys(d.FV)});
	//and the path
	this.path = this.svg.append("path").attr("class","line selection");
	this.proj = this.svg.append("path").attr("class","line projection").attr("stroke-dasharray","5,5");
	this.dot = this.svg.append("circle").attr("class","datum").attr("r",this.dotSize);
	this.dotLabel = this.svg.append("text").attr("class","label dot").attr("text-anchor","middle");
	//add slider range
	this.container.append("div").attr("class", "slider age");
	
	$(".slider.age").slider({
		range: true,
		min: 0,
		max: _self.datalength,
		values: [0,_self.datalength],
		slide: function(ev, ui){
			if($(ui.handle).hasClass("locked")){
				return false;
			}else{
				_self.sliceData(ui.values[0], ui.values[1]);
				_self.drawLines();
				return true;
			}
			
			
		
		}
	}).css({
		"margin-left": this.padding.left,
		"margin-right": this.padding.right
	})
//	$(".slider>.ui-slider-handle:first").addClass("locked").mousedown(function(e){e.preventDefault()}) //lock the leftmost handle for now
	this.svg.append("text").attr("class","label").text("Age").attr({
		x: this.w/2,
		y: this.h - this.padding.bottom/3
	})
	this.drawLines();
}

lgp = lineGraph.prototype;
lgp.setScales = function(){
	//set up scales for each axis / datum
	this.xs = d3.scale.linear()
		.range([this.padding.left, this.innerRight])
		.domain(d3.extent(this.data, function(d){return +d.WEEK}));
	
	this.ys = d3.scale.linear()
		.range([ this.h - this.padding.bottom, this.padding.top]) //svg origin is top-left
		.domain(d3.extent(this.data, function(d){return +d.FV}));
}
lgp.setAxes = function(){
	//set up axes
	this.xA = d3.svg.axis()
		.scale(this.xs)
		.orient("bottom")
		.ticks((this.datalength/52)/5).tickFormat(function(d){
			o = _self.data[d];
			return o.AGE;
			})
		
	this.yA = d3.svg.axis()
		.scale(this.ys)
		.orient('left')
		.tickFormat(function(t){return finance.format(t, 'USD')})
}

lgp.sliceData = function(min,max){
	if (min != this.fvParams.offsetMonths){ 
		console.log("getting data")
		this.fvParams.offsetMonths = min;
		this.data = this.futureValueWeekly(this.fvParams);
	}
	console.log("slicing min/max: "+min+" / "+max)
	this.vData = this.data.slice(min,max);
	this.pData = this.data.slice(max,this.data.length)
}

lgp.drawLines = function(){
	this.path.datum(this.vData).attr("d", this.line); 
	this.proj.datum(this.pData).attr("d", this.line);
	lastDatum = this.vData[this.vData.length-1];
	console.log(lastDatum);
	this.dot.attr({
		cx: _self.xs(lastDatum.WEEK),
		cy: _self.ys(lastDatum.FV),
	})
	this.dotLabel.attr({
		x: _self.xs(lastDatum.WEEK),
		y: _self.ys(lastDatum.FV)-this.dotSize-2,
	}).text(finance.format(lastDatum.FV, 'USD'))
}
		
lgp.stripPx = function(_str){
	i = _str.indexOf("px");
	return +_str.slice(0,i);
}

lgp.futureValueWeekly = function( p )
{
	
	var ret = new Array();
	p.years = p.endAge - p.startAge;
	p.weeks = p.years*52;
	p.FV = 0;
	p.lastV = 0;
	p.age = p.startAge;
	p.weekRate = p.rate/52;
	console.log(p);
	
	for (i = 0; i <= p.weeks; i++){
		
		p.FV = (i > p.offsetMonths ) ? (p.lastV + p.weeklyContribution ) * (1+p.weekRate) : 0;
		o={};
		o.FV = p.FV;
		o.AGE = p.age;
		o.WEEK = i ;
		ret.push(o);
		if (i % 52 == 1) { 
			p.age+=1 
		};
		p.lastV = p.FV;
	}
	return ret;
}