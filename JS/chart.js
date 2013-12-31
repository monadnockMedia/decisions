function lineGraph( sel, _data ){
	_self = this;
	this.container = d3.select(sel);
	this.data = _data;
	this.datalength = this.data.length;
	this.firstAge = +this.data[0].AGE;
	this.lastAge = +this.data[this.datalength-1].AGE;
	//set up viewport size, etc.
	this.w = this.stripPx(this.container.style("width"));
	this.h = this.stripPx(this.container.style("height"));
	this.padding = {
		left: 60,
		right: 30,
		top: 30,
		bottom: 30
	}
	this.innerWidth = this.w - this.padding.left - this.padding.right;
	this.innerHeight = this.h - this.padding.top - this.padding.bottom;
	this.innerTop = this.h - this.padding.top;
	this.innerRight = this.w - this.padding.right;
	var clipGutter = 5;
	//set up scales for each axis / datum
	this.xs = d3.scale.linear()
		.range([this.padding.left, this.innerRight])
		.domain(d3.extent(this.data, function(d){return +d.WEEK}));
	
	this.ys = d3.scale.linear()
		.range([this.innerTop, this.padding.bottom]) //svg origin is top-left
		.domain(d3.extent(this.data, function(d){return +d.FV}));
		
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
		transform: "translate("+this.padding.left +",0)"
	}).call(this.yA);

		
	//and a linear function
	this.line = d3.svg.line()
		.x(function(d){return _self.xs(d.WEEK)})
		.y(function(d){return _self.ys(d.FV)});
	//and the path
	this.path = this.svg.append("path").attr("class","line");
	this.path.datum(this.data).attr("d", this.line); 
	
	//add slider range
	this.container.append("div").attr("class", "slider age");
	$(".slider.age").slider({
		range: true,
		min: _self.firstAge,
		max: _self.lastAge,
		values: [_self.firstAge,_self.lastAge,]
	}).css({
		"margin-left": this.padding.left,
		"margin-right": this.padding.right
	})
	
}

lgp = lineGraph.prototype;

		
lgp.stripPx = function(_str){
	i = _str.indexOf("px");
	return +_str.slice(0,i);
}