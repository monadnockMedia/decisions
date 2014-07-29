var Chart = function (sel) {
    self = this;
    
    this.dimen = {
        bars:{
        width: 1024,
            height: 300},
        lines:{
            width: 950,
            height: 100
        }, 
        width: 1024,
        height: 500
 
    };
    
    
    
   


    this.padding = {
        left: 60,
        right: 120,
        top: 18,
        bottom: 20,
        gutter: 60
    };
    
    this.dimen.height = this.dimen.bars.height+this.dimen.lines.height+this.padding.gutter+self.padding.bottom+self.padding.top;
    this.dimen.width = this.dimen.bars.width;
    
    this.inner = {
        bars:
        { top: self.dimen.lines.height+self.padding.gutter+self.padding.top,
         w: this.dimen.bars.width - this.padding.left - this.padding.right,
        h: this.dimen.bars.height - this.padding.top - this.padding.bottom,
        r: this.dimen.bars.width - this.padding.right,
        b: this.dimen.bars.height - this.padding.bottom},
        
        lines:
        {
            b: this.padding.top +  this.dimen.lines.height
           }
        
   
    };

    this.params = {
        lump: {value: 500000, allowance: 11000},
        annuity: 750000,
        term: 20,
        rate: 0.04,
        max: 50000,
        
        
    };
    
    this.sliderParams = {
        rate:{
            min: 0.01, 
            max:0.1,
            step: 0.001,
            value: self.params.rate,
            slide: function(e,ui){
                self.params.rate = ui.value;
                $(ui.handle).text((ui.value*100).toFixed(2));
                self.redraw();
            }
        },
        allowance:{
            min: 0, 
            max:20000,
            step: 100,
            value: self.params.lump.allowance,
            slide: function(e,ui){
                self.params.lump.allowance = ui.value;
                $(ui.handle).text((ui.value).toFixed(2));
                self.redraw();
            }
        }
    };
    this.data = this.calculate();
    
    this.div = d3.select(sel);
    this.svg = this.div.append("svg")
            .attr("width", this.dimen.width)
            .attr("height", this.dimen.height);


    this.scales = {
        y: d3.scale.linear(),
        tall: d3.scale.linear(),
        x: d3.scale.ordinal(),
        x1: d3.scale.ordinal(),
        lineX: d3.scale.linear(),
        lineY: d3.scale.linear()
    };
    
    var dataDomain = d3.range(0,self.data.length);
    
    this.scales.y.range([this.inner.bars.b, this.padding.top])
        .domain([0, this.params.max]);
    
    this.scales.tall.range([0, this.inner.bars.h])
        .domain([0,  this.params.max]);

    
    this.scales.x.rangeBands([this.padding.left, this.inner.bars.r], 0.33)
        .domain(dataDomain);
    
    this.scales.lineX.range([this.padding.left, this.inner.bars.r])
        .domain([0,self.data.length]);
    
    this.scales.x1.rangeBands([0,self.scales.x.rangeBand()])
        .domain(["lump","annuity"]);
    
    this.scales.lineY.range([this.inner.lines.b, this.padding.top]).domain([0,1000000]);

    this.axes = {y : d3.svg.axis().scale(this.scales.y).ticks(5)}
    this.axes.y.orient("left");
    
    this.axes.line = d3.svg.axis().scale(this.scales.lineY).ticks(3).tickFormat(function(d){return d/1000000+"m"});
    this.axes.line.orient("left");
    
    this.line = d3.svg.line()
        .x(function(d,i){ return self.scales.lineX(i) })
        .y(function(d){return self.scales.lineY(d)})
    
    this.buildAxes();
    this.buildBars();
    this.buildSlider();
    this.buildLines();
    
};

Chart.prototype.buildAxes = function () {
   this.yAxis = this.svg.append("g")
        .attr("class", "axis")
        .attr("width", this.dimen.height)
        .attr("height", 30)
        .append("g")
        .attr("transform", "translate("+self.padding.left+","+self.inner.bars.top+")")
        .call(self.axes.y);
    
    this.svg.append("g")
        .attr("class", "axis")
        .attr("width", this.dimen.height)
        .attr("height", 30)
        .append("g")
        .attr("transform", "translate("+self.padding.left+","+self.padding.top+")")
        .call(self.axes.line);
};

Chart.prototype.updateAxes = function(){
    var min = 0;
    var ydom = [0, Math.max(self.params.max, +self.data[0].lump.totalPaid) ];
    console.log(ydom);
    self.scales.y.domain(ydom);
    self.scales.tall.domain(ydom);
   this.yAxis.call(self.axes.y);     
}
Chart.prototype.buildBars = function(){
    this.barGroup = this.svg.append("g").attr({
        class: "bars",
        transform: "translate(0,"+(self.inner.bars.top)+")"
    })
    this.barGroup.append("text").text("").attr({
        x: +self.inner.bars.r/4,
        y: 20
    });
    
    this.barGroup.append("text").text("Year").attr({
        class: "query",
        x: +self.inner.bars.r/2,
        y: self.inner.bars.b + 30
    });
    
    this.pairs = this.barGroup.selectAll("g.pairs").data(self.data).enter().append("g")
        .attr("class","pairs")
        .attr( "transform" , function(d,i){return "translate(" + self.scales.x(i) + ",0)"  });
  
    this.pairs.selectAll("rect").data(
        function(d){
            var a = [d.lump, d.annuity];
            return  a;
        })
    .enter().append("rect").attr("class", function(d){return d.key})
        .attr({
            x: function(d){return self.scales.x1(d.key)},
            height: function(d){return self.scales.tall(d.totalPaid)},
            width: self.scales.x1.rangeBand(),
            y: function(d){ 
                var h = self.scales.tall(d.totalPaid);
                return  self.inner.bars.b - h;            
            },
        })
                 
    this.pairs.append("text").attr({
        y:self.inner.bars.b + 14,
    }).text(function(d,i){return i+1})

    this.barGroup.append("line").attr({
        class: "pipe",
        x1:self.padding.left,                           x2:self.inner.bars.r,
        y1: self.scales.y(self.data[0].annuity.totalPaid),    y2: self.scales.y(self.data[0].annuity.totalPaid),
        "stroke-dasharray": "5, 5" 
    })
    
    this.barGroup.append("text").attr({
        class: "pipeLabel",
        y: self.scales.y(self.data[0].annuity.totalPaid) + 5,
        x: self.inner.bars.r
    }).text("\u25C1$"+self.data[0].annuity.totalPaid)
    
   
   
};

Chart.prototype.drawBars = function(){
    
}

Chart.prototype.buildLines = function(){
    this.lineGroup = this.svg.append("g").attr("class","linegroup").attr("transform","translate(0,"+self.padding.top+")");
    this.lineData = {};
    this.lineGroup.append("text").text("").attr({
         class: "query",
        x: +self.inner.bars.r/4,
        y: 20
    });
    this.mapLines();
    this.lines = this.lineGroup.selectAll("path").data(Object.keys(this.lineData)).enter().append("path")
        .attr("class",function(d){return d});
    
    this.lineLabels = this.lineGroup.selectAll("text.label").data(Object.keys(this.lineData)).enter()
        .append("text").attr("class","label")
        
    this.drawLines();
        
}

Chart.prototype.mapLines = function(){
    this.lineData = {
        annuity:this.data.map(function(d){return d.annuity.value}),
        lump: this.lineData = this.data.map(function(d){return d.lump.value})
    }
    
   
}

Chart.prototype.drawLines = function(){
    this.lines.attr("d", function(d){ return self.line(self.lineData[d])});
    this.lineLabels.text(function(d){
             var l = self.lineData[d].length;
            return "\u25C1$"+self.lineData[d][l-1];
        }).attr({
            x: self.inner.bars.r-22,
            y: function(d){
                 var l = self.lineData[d].length;
                 return self.scales.lineY(self.lineData[d][l-1])+5;
            }
        })
}

Chart.prototype.redraw = function(){
    
    self.data = self.calculate();
    this.mapLines();
    this.updateAxes();
    this.pairs = this.barGroup.selectAll("g.pairs").data(self.data)
    this.pairs.selectAll("rect").data(
        function(d){
            var a = [d.lump, d.annuity];
            return  a;
        })
    
        .attr({
            x: function(d){return self.scales.x1(d.key)},
            height: function(d){return self.scales.tall(d.totalPaid)},
            width: self.scales.x1.rangeBand(),
            y: function(d){ 
                var h = self.scales.tall(d.totalPaid);
                return  self.inner.bars.b - h;            
            },
        })
    
    
    this.barGroup.selectAll(".pipe").attr({

        x1:self.padding.left,                           x2:self.inner.bars.r,
        y1: self.scales.y(self.data[0].annuity.totalPaid),    y2: self.scales.y(self.data[0].annuity.totalPaid),
        "stroke-dasharray": "5, 5" 
    })
    
     this.barGroup.selectAll(".pipeLabel").attr({
      
        y: self.scales.y(self.data[0].annuity.totalPaid) + 5,
        x: self.inner.bars.r
    }).text("\u25C1$"+self.data[0].annuity.totalPaid)
    
    this.drawLines();
    
    
}

Chart.prototype.buildSlider = function(){
        this.div.append("h2").text("Interest Rate").attr("class","lump");
        this.div.append("div").attr("class","slider rate").attr({
            style: "width:"+self.inner.bars.w+"px; margin-left:"+self.padding.left+"px;"
       
        });
        $(".slider.rate").slider(self.sliderParams.rate);
    this.div.append("h2").text("Allowance").attr("class","lump")
       this.div.append("div").attr("class","slider allowance").attr({
            style: "width:"+self.inner.bars.w+"px; margin-left:"+self.padding.left+"px;"
       
        });
        $(".slider.allowance").slider(self.sliderParams.allowance);
}

Chart.prototype.calculate = function(){
    var p = this.params;
    
    var res = [];
    for (i=0;i<p.term; i++){
        //lump sum remaining
        var rem = (i==0) ? p.lump.value : res[i-1].lump.value; 
        var an_rem = (i==0) ? p.annuity : res[i-1].annuity.value;
        
        o = {};
        o.annuity = {key:"annuity"};
        o.annuity.totalPaid = p.annuity/p.term;
        
 
    
        o.lump = {}
        o.lump.key = "lump";
        o.lump.fromInterest = rem*p.rate;
        o.lump.fromAllowance = p.lump.allowance;
        
        o.lump.totalPaid = o.lump.fromInterest + o.lump.fromAllowance;
   
            o.annuity.value = an_rem - o.annuity.totalPaid;
            o.lump.value = rem - p.lump.allowance;
       
        
        res.push(o);
    }
    return res;
}


//var c = new Chart("#chart");