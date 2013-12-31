var fv = {
	
	 futureValueWeekly : function(rate, weeklyContribution, startAge, endAge )
	{
		var ret = new Array();
		var years = endAge - startAge;
		var weeks = years*52;
		var FV = 0;
		var lastV = 0;
		var age = startAge;
		var weekRate = rate/52;
		console.log("Weekly rate :" + weekRate)
		
		for (i = 0; i <= weeks; i++){
			
			FV = (lastV + weeklyContribution ) * (1+weekRate);
			console.log("last / current :" + lastV + " / " + FV);
			o={};
			o.FV = FV;
			o.AGE = age;
			o.WEEK = i ;
			ret.push(o);
			if (i % 52 == 1) { 
				age+=1 
			};
			lastV = FV;
		}
		return ret;
	}
}

