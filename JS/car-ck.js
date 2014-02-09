function carGraph(e,t){self=this;this.months=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];this.data=null;this.sliderP={rate:{min:1,max:21},contribution:{min:200,max:1e3}};this.cars={economy:15e3,midsized:25e3,luxury:5e4};this.amParams={contrib:450,rate:2,balance:this.cars.midsized};this.amortize();this.container=d3.select(e);this.w=this.stripPx(this.container.style("width"));this.h=this.stripPx(this.container.style("height"));this.padding={left:60,right:30,top:30,bottom:50};this.innerWidth=this.w-this.padding.left-this.padding.right;this.innerHeight=this.h-this.padding.top-this.padding.bottom;this.innerTop=this.h-this.padding.top;this.innerRight=this.w-this.padding.right;var n=5;this.setScales();this.setAxes();this.svg=this.container.append("svg").attr({width:this.w,height:this.h,"class":"lineGraph"});this.svg.append("defs").append("clipPath").attr("id","clip").append("svg:rect").attr({x:this.padding.left+n,y:0,width:this.innerWidth-n,height:this.innerHeight});this.chartBody=this.svg.append("g").attr("clip-path","url(#clip)").attr("class","chartBody");this.addAxes();this.addLines()}cgP=carGraph.prototype;cgP.setScales=function(){this.xs=d3.time.scale().range([this.padding.left,this.innerRight]).domain(d3.extent(this.data,function(e){return+e.date}));this.ys=d3.scale.linear().range([this.h-this.padding.bottom,this.padding.top]).domain([0,d3.max(this.data,function(e){return+e.totalPaid})])};cgP.updateScales=function(){this.xs.domain(d3.extent(this.data,function(e){return+e.date}));this.ys.domain([0,d3.max(this.data,function(e){return+e.totalPaid})])};cgP.setAxes=function(){this.xA=d3.svg.axis().scale(this.xs).orient("bottom").ticks(10).tickFormat(function(e){return e.getUTCFullYear()});this.yA=d3.svg.axis().scale(this.ys).orient("left").tickFormat(function(e){return finance.format(e,"USD")})};cgP.addAxes=function(){this.svg.append("g").attr({"class":"x axis",transform:"translate(0,"+(this.h-this.padding.bottom)+")"}).call(this.xA);this.svg.append("g").attr({"class":"y axis",transform:"translate("+(this.padding.left-2)+","+0+")"}).call(this.yA)};cgP.updateAxes=function(){this.yA.scale(this.ys);this.svg.select(".y.axis").call(this.yA);this.xA.scale(this.xs);this.svg.select(".x.axis").call(this.xA)};cgP.amortize=function(){with(this.amParams){this.amParams.length=finance.calculateMonths(balance,rate,contrib);var amort=finance.calculateAmortization(balance,length,rate),dOff;amort.forEach(function(e,t){e.month=t;if(t==0){dOff=+e.date.getFullYear();e.year=0;e.cumToPrinciple=e.paymentToPrinciple}else{e.year=+e.date.getFullYear()-dOff;e.cumToPrinciple=amort[t-1].cumToPrinciple+e.paymentToPrinciple}e.totalPaid=e.cumToPrinciple+e.interest});this.data=amort}};cgP.addLines=function(){this.lineFunctions={interest:d3.svg.line().x(function(e){return self.xs(e.date)}).y(function(e){return self.ys(e.interest)}),balance:d3.svg.line().x(function(e){return self.xs(e.date)}).y(function(e){return self.ys(e.principle)}),total:d3.svg.line().x(function(e){return self.xs(e.date)}).y(function(e){return self.ys(e.totalPaid)}),area:d3.svg.line().x(function(e){return self.xs(e.date)}).y(function(e){return self.ys(e.val)})};this.lineGroup=this.svg.append("g").attr("class","lineGroup");this.area=this.lineGroup.append("path").attr("class","line area");this.total=this.lineGroup.append("path").attr("class","line total");this.interest=this.lineGroup.append("path").attr("class","line interest");this.balance=this.lineGroup.append("path").attr("class","line balance");this.drawLines();this.buildSliders()};cgP.drawLines=function(){var e=this.data.map(function(e){return{date:e.date,val:e.cumToPrinciple}}),t=this.data.map(function(e){return{date:e.date,val:e.totalPaid}});areaData=e.concat(t.reverse());this.area.datum(areaData).transition().style("opacity",0).attr("d",self.lineFunctions.area).transition().style("opacity",1);this.total.datum(this.data).transition().attr("d",self.lineFunctions.total);this.balance.datum(this.data).transition().attr("d",this.lineFunctions.balance)};cgP.buildSliders=function(){this.container.append("div").attr({"class":"tooltip"}).append("h1");this.contributionSlider=this.container.append("div").attr({"class":"slider contribution car",title:"Payment"});this.rateSlider=this.container.append("div").attr({"class":"slider rate car",title:"Loan APR"});$(".slider").css({"margin-left":this.padding.left*2.5,"margin-right":this.padding.right});var e=function(e){},t=function(){$(".tooltip").animate({opacity:0})},n=function(){$(".tooltip").animate({opacity:1})};$(".slider.contribution").slider({min:self.sliderP.contribution.min,max:self.sliderP.contribution.max,value:self.amParams.contrib,slide:function(e,t){console.log(t.handle);$(".tooltip").css({left:self.sliderScales.contribution(t.value),top:$(t.handle).offset().top}).html("$"+t.value);self.amParams.contrib=t.value},stop:function(e,n){$(this).find(".ui-slider-handle").text("$"+n.value);t();self.redraw()}}).find("a").html("$"+self.amParams.contrib);this.sliderScales={};contOff=$(".slider.contribution").offset();contW=$(".slider.contribution").width();this.sliderScales.contribution=d3.scale.linear().range([contOff.left,contOff.left+contW]).domain([self.sliderP.contribution.min,self.sliderP.contribution.max]);$(".slider.rate").slider({min:self.sliderP.rate.min,max:self.sliderP.rate.max,step:1,value:self.amParams.rate,slide:function(e,t){console.log("rateChange");$(".tooltip").css({left:self.sliderScales.rate(t.value),top:$(t.handle).offset().top}).html(t.value+"%");self.amParams.rate=t.value},stop:function(e,n){$(this).find(".ui-slider-handle").text(n.value+"%");t();console.log(self.amParams);self.redraw()}}).find("a").html(self.amParams.rate+"%");rateOff=$(".slider.rate").offset();rateW=$(".slider.rate").width();this.sliderScales.rate=d3.scale.linear().range([rateOff.left,rateOff.left+rateW]).domain([self.sliderP.rate.min,self.sliderP.rate.max]);$(".slider").slider({start:function(e,t){n()}})};cgP.redraw=function(){this.amortize();this.updateScales();this.updateAxes();this.drawLines()};cgP.stripPx=function(e){i=e.indexOf("px");return+e.slice(0,i)};