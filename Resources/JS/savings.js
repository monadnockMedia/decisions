function savingsGraph( sel, _data ){
	_self = this;
	this.fvParams = {
		rate: 0.03, 
		weeklyContribution: 10, 
		startAge: 15, 
		endAge: 65,
		offsetMonths: 0
	}
	
	this.chartState = JSON.parse(JSON.stringify(this.fvParams));
	this.sliderP = {
		rate : {min: 1, max: 7},
		contribution : {min: 0, max: 100}
	}
	
	this.container = d3.select(sel);
	this.data = this.futureValueWeekly(this.fvParams);
	this.ages = this.collapseAges(this.data.map(function(d){return d.AGE}));
	this.vData = this.data;
	this.pData = [];
	this.dotSize = 8;
	this.datalength = this.data.length;
	this.lastDatum = this.data[this.datalength-1];
	this.firstDatum = this.data[0];
	this.weekRange = {min:this.firstDatum.WEEK, max: this.lastDatum.WEEK  };
	//set up viewport size, etc.
	this.w = this.stripPx(this.container.style("width"));
	this.h = this.stripPx(this.container.style("height"));
	this.padding = {
		left: 65,
		right: 40,
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
			x: this.padding.left,
			y: 0,
			width: this.w,
			height: this.h
		})
	
		//add bars	
			this.xBar = this.svg.append("line").attr("class","x bar").attr("stroke-dasharray","2,4");
			this.yBar = this.svg.append("line").attr("class","y bar").attr("stroke-dasharray","2,4");
			this.barBox = this.svg.append("rect").attr("class","barBox");
	//and a group for the chart's lines, masked by the clipPath
	this.chartBody = this.svg.append("g")
		.attr("clip-path", "url(#clip)").attr("class"," chartBody")
	
	this.addAxes();

		
	//and a linear function
	this.line = d3.svg.line()
		.x(function(d){return _self.xs(d.WEEK)})
		.y(function(d){return _self.ys(d.FV)});

		
	//and the path
	this.path = this.chartBody.append("path").attr("class","line selection lifted");
	this.proj = this.chartBody.append("path").attr("class","line projection").attr("stroke-dasharray","5,5");
	
	
	
	this.dot = this.chartBody.append("circle").attr("class","datum").attr("r",this.dotSize);
	this.dotLabel = this.chartBody.append("text").attr("class","label dot").attr("text-anchor","middle");
	//add slider range
	this.buildSliders();
//	$(".slider>.ui-slider-handle:first").addClass("locked").mousedown(function(e){e.preventDefault()}) //lock the leftmost handle for now
	this.svg.append("text").attr("class","label").text("Age").attr({
		x: this.w/2,
		y: this.h - this.padding.bottom/3
	})
	this.drawLines();
	
	
	var ww = $("<div id='warnWrap'/>")
	$("body").append(ww.load("warning.html .savings").click(function(){$(this).find("div").toggleClass(" active inactive ")}))
}

lgp = savingsGraph.prototype;
lgp.setScales = function(){
	//set up scales for each axis / datum
	this.xs = d3.scale.linear()
		.range([this.padding.left, this.innerRight])
		.domain(d3.extent(this.data, function(d){return +d.WEEK}));
		
	this.xs2 = d3.scale.linear()
		.range([this.padding.left, this.innerRight])
		.domain(d3.extent(this.ages, function(d){return +d}));
		

	this.ys = d3.scale.linear()
		.range([ this.h - this.padding.bottom, this.padding.top]) //svg origin is top-left
		.domain(d3.extent(this.data, function(d){return +d.FV}));
	
}

lgp.updateScales = function(){
	this.ys.domain(d3.extent(this.data, function(d){return +d.FV}));
}

lgp.setAxes = function(){
	//set up axes
	
	this.xA2 = d3.svg.axis()
		.scale(this.xs2)
		.orient("bottom")
		.ticks(50)

	
	this.xA = d3.svg.axis()
		.scale(this.xs)
		.orient("bottom")
		.ticks(50)

		.tickFormat(function(d){
			o = _self.data[d];
			return o.AGE;
			})
			
		
	this.yA = d3.svg.axis()
		.scale(this.ys)
		.orient('left')
		.tickFormat(function(t){return finance.format(t, 'USD')})
}

lgp.addAxes = function(){
	//now add groups for axes, using our axis functions
/*	this.svg.append("g").attr({
		class: "x axis",
		transform: "translate(0,"+(this.h - this.padding.bottom) +")", //transform from top-left to bottom-left (minus padding)
	}).call(this.xA).selectAll("text").attr("class","x tick")
	.each(function(){
		check = !(+this.textContent % 5 == 0) ;
		d3.select(this).classed("hidden", check);
	}); */
	this.svg.append("g").attr({
			class: "glow x axis",
			transform: "translate(0,"+(this.h - this.padding.bottom) +")", //transform from top-left to bottom-left (minus padding)
		}).call(this.xA2).selectAll("text").attr("class","x tick")
		.each(function(){
			d3.select(this).classed("hidden", true);
		});
		
	this.svg.append("g").attr({
			class: "x axis",
			transform: "translate(0,"+(this.h - this.padding.bottom) +")", //transform from top-left to bottom-left (minus padding)
		}).call(this.xA2).selectAll("text").attr("class","x tick")
		.each(function(){
			check = !(+this.textContent % 5 == 0) ;
			d3.select(this).classed("hidden", check);
		});
		
		
	this.svg.append("g").attr({
		class: "y axis",
		transform: "translate("+this.padding.left +","+0+")"
	}).call(this.yA);
	

	
/*	this.svg.select(".x.axis").selectAll(".tick.major").insert("circle").attr({
		"class":"glow",
		"r":5,
		fill:"red"
	})*/
}
lgp.updateAxes = function(){
	this.yA.scale(this.ys);
	this.svg.select(".y.axis").call(this.yA);
}

lgp.buildSliders = function(){
	this.container.append("div").attr({"class":"tooltip"}).append("h1");
	this.sliderDiv = this.container.append("div").attr({class:"savingsSliders"});
	this.sliderDiv.append("div").attr({	
		"class": "slider age",
		title: "Age"
	});
	this.sliderDiv.append("div").attr({
		"class": "slider contribution",
		title: "Contribution"
		
		});
	this.sliderDiv.append("div").attr(	{
			"class": "slider rate",
			title: "Rate"
			});
	
	$(".slider").css({
		"margin-left": this.padding.left,
		"margin-right": this.padding.right
	});
	
	var maxSpan = 10;
	var span;
	$(".slider").slider({
		start: function(ev,ui){
			moveTip(ui);
			showTip();
		
		}
	});
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
	$(".slider.age").slider({
		range: true,
		min: 0,
		max: _self.datalength,
		values: [0,_self.datalength],
		
		slide: function(ev, ui){
				
			span = Math.ceil((ui.values[1] - ui.values[0])/52);  //span is in years, scale is in months.
			
			if($(ui.handle).hasClass("locked")){
				return false;
			}
			else if( span <= maxSpan){ //span is 10 years or less
				hI = +( ui.value == ui.values[1]  ); //index of this handle, +false == 0;
				hT = +!hI; //index of other handle, +!false = +true = 1
				if(ui.values[hT] == 0 || ui.values[hT] >= _self.datalength){
					return false;
				}else{
					var newVal = (hI == 0) ? ui.value+maxSpan*52 :ui.value-maxSpan*52 ;
					$(this).slider('values',hT,newVal);
				}
				
			}
			
			$(".tooltip").css({
				"left": _self.sliderScales.age(ui.value),
				"top": $(ui.handle).offset().top
			}).html( _self.data[ui.value].AGE )
			
				
			
			_self.weekRange.min = ui.values[0];
			_self.weekRange.max = ui.values[1];
			_self.redraw();
			return true;
		},
		stop: function(ev,ui){
			$(ui.handle).html(_self.data[ui.value].AGE)
			hideTip();
		}
	}).find("a:first").html("15");
	$(".slider.age").find("a:last").html("65");
	
	var moveTip = function(_ui,s){
			var pos = $(_ui.handle).offset();
			var offset = $(_ui.handle).width() /2;
			console.log(offset);
			$(".tooltip").css({
				top: pos.top,
				left: +pos.left+offset
			}).html(s)
	}



	$(".slider.contribution").slider({
		min: this.sliderP.contribution.min,
		max: this.sliderP.contribution.max,
		value: _self.fvParams.weeklyContribution,
		slide: function(ev, ui){
			$(".tooltip").css({
				"left": _self.sliderScales.contribution(ui.value),
				"top": $(ui.handle).offset().top
			}).html("$"+ui.value)
			_self.fvParams.weeklyContribution = ui.value;
			_self.redraw();
		},
		stop: function(ev,ui){
			$(this).find(".ui-slider-handle").text("$"+ui.value);
			hideTip();
		}
	}).find("a").html("$"+_self.fvParams.weeklyContribution);
	
	$(".slider.rate").slider({
		min: this.sliderP.rate.min,
		max: this.sliderP.rate.max,
		step: 0.1,
		value: _self.fvParams.rate*100,
		slide: function(ev, ui){
			$(".tooltip").css({
				"left": _self.sliderScales.rate(ui.value),
				"top": $(ui.handle).offset().top
			}).html(ui.value+"%")
			
			_self.fvParams.rate = ui.value/100;
			_self.redraw();
		},
		stop: function(ev,ui){
			$(this).find(".ui-slider-handle").text(ui.value+"%");
			hideTip();
		}
	}).find("a").html((_self.fvParams.rate*100)+"%");
	

	this.sliderScales = {};
	contOff = $(".slider.contribution").offset();
	contW = $(".slider.contribution").width();
	this.sliderScales.contribution = d3.scale.linear()
		.range([contOff.left,contOff.left+contW ])
		.domain([ _self.sliderP.contribution.min , _self.sliderP.contribution.max]);
	
	rateOff = $(".slider.rate").offset();
	rateW = $(".slider.rate").width();
	this.sliderScales.rate = d3.scale.linear()
		.range([rateOff.left,rateOff.left+rateW ])
		.domain([_self.sliderP.rate.min,_self.sliderP.rate.max]);
	
	ageOff = $(".slider.age").offset();
	ageW = $(".slider.age").width();
	this.sliderScales.age = d3.scale.linear()
		.range([ageOff.left,ageOff.left+rateW ])
		.domain([0,_self.datalength]);


}

lgp.redraw = function(){
	if (this.update){
		_self.data = _self.futureValueWeekly(_self.fvParams);
		//console.log("params changed");
	}
	_self.updateAxes();
	_self.sliceData();
	this.lastDatum = this.vData[this.vData.length-1];
	this.firstDatum = this.vData[0];
	_self.updateScales();
	
/*	this.svg.selectAll(".x.tick").each(function(){
		checkLast = (this.textContent) == _self.lastDatum.AGE;
		checkFirst = (this.textContent) == _self.firstDatum.AGE;
		d3.select(this).classed("active", (checkLast || checkFirst )); //its active if either are true
		d3.select(this).classed("last", checkLast)
		d3.select(this).classed("first", checkFirst);
	});*/
	

	

	_self.drawLines();
	
	
	
	this.chartState = JSON.parse(JSON.stringify(this.fvParams));
}

lgp.update = function(){
	var p = this.fvParams;
	var state = this.chartState;
	var doUpdate = null;
//	console.log(state);
	for (var i in state){
		
		att = p[i];
		st = state[i];
		//console.log("comparing "+att+" to "+st);
		if (att != st){
			console.log("mismatch")
			doUpdate = true;
			break;
		} 
	}
	return doUpdate;
}


lgp.sliceData = function(){
	p = this.weekRange;
	if (p.min != this.fvParams.offsetMonths){ 
		//console.log("getting data")
		this.fvParams.offsetMonths = p.min;
		this.data = this.futureValueWeekly(this.fvParams);
	}
	//console.log("slicing min/max: "+p.min+" / "+p.max)
	this.vData = this.data.slice(p.min,p.max);
	this.pData = this.data.slice(p.max,this.data.length)
}

lgp.drawLines = function(){
	//console.log("drawing");
	this.path.datum(this.vData).attr("d", this.line); 
	this.proj.datum(this.pData).attr("d", this.line);
	
	
	datumX = this.xs(this.lastDatum.WEEK);
	datumY = this.ys(this.lastDatum.FV);
	//console.log(lastDatum);
	this.dot.attr({
		cx: datumX,
		cy: datumY,
	})
	this.dotLabel.attr({
		x: datumX,
		y: datumY-this.dotSize-2,
	}).text(finance.format(this.lastDatum.FV.toFixed(0), 'USD'))
	
	this.xBar.attr({
		x1: datumX,
		y1: this.ys(0),
		x2: datumX,
		y2: datumY
	})
	
	this.yBar.attr({
		x1: this.xs(0),
		y1: datumY,
		x2: datumX,
		y2: datumY
	})
	
	this.barBox.attr({
		y: datumY,
		x: _self.padding.left,
		width: datumX - _self.padding.left,
		height: (_self.h - datumY - _self.padding.bottom) 
	})

}
		
lgp.stripPx = function(_str){
	i = _str.indexOf("px");
	return +_str.slice(0,i);
}
lgp.collapseAges = function(arr) {
    var a = [], prev;

    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
            
        }
        prev = arr[i];
    }

    return a;
}
/*lgp.futureValueWeekly = function( p )
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
} */

lgp.futureValueWeekly = function( p )
{
        var ret = new Array();
        var years = p.endAge - p.startAge;
        var weeks = years*52;
        var FV = 0;
        var lastV = 0;
        var age = p.startAge;
        var weekRate = p.rate/52;
        for (i = 0; i <= weeks; i++){
                FV = (i > p.offsetMonths ) ? (lastV + p.weeklyContribution ) * (1+weekRate) : 0;
                o={};
                o.FV = FV;
                o.AGE = age;
                o.WEEK = i ;
                ret.push(o);
                if ((i+1) % 52 ==  0 ) { 
                        age+=1 
                };
                lastV = FV;
        }
        return ret;

}