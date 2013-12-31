var fvd;
$(function(){
	fvd = fv.futureValueWeekly(.03, 10, 15, 65);
	lg = new lineGraph("#chart",fvd);
})