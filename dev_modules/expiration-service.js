var expirationService = {
	timer: null,
	setExpirationWindow: function (milliseconds,seconds,minutes,hours,days,cleanAll) {
		//let's clear it if you already have an expiration timer
		if(this.timer!==null){
			clearInterval(this.timer);
		}
		var expirationWindowInMilliseconds = milliseconds + (seconds + (minutes + (hours + (days * 24))*60)*60) * 1000;
		if(cleanAll===true){
			this.timer = setInterval(function(){
				Smartjax.cleanAll();
			}.bind(this), expirationWindowInMilliseconds);
		}
	}
};