var expirationService = {
	timer: null,
	expirationWindowInMilliseconds: null,
	groupBasedClean: false,
	idBasedClean: true,
	setExpirationWindow: function (milliseconds,seconds,minutes,hours,days,cleanAll,groupBasedClean,idBasedClean) {
		//let's clear it if you already have an expiration timer
		if(this.timer!==null){
			clearInterval(this.timer);
		}
		var expirationWindowInMilliseconds = milliseconds + (seconds + (minutes + (hours + (days * 24))*60)*60) * 1000;
		this.expirationWindowInMilliseconds = expirationWindowInMilliseconds;
		if(idBasedClean===false){
			this.idBasedClean = false;
		}
		if(groupBasedClean===true){
			this.groupBasedClean = true;
		}
		
		//clear at the time of loading
		this.clearSelective();

		if(cleanAll===true){
			this.timer = setInterval(function(){
				Smartjax.cleanAll();
			}.bind(this), expirationWindowInMilliseconds);
		} else {
			this.timer = setInterval(function(){
				this.clearSelective();
			}.bind(this), expirationWindowInMilliseconds);
		}
	},
	clearSelective: function(){
		var environmentsToClear = ["page", "tab", "forever"];
		var currentDate = Date.now();
		var storeIdsToBeDeleted = [];
		var groupsToBeDeleted = [];
		
		environmentsToClear.forEach(function (ele) {
			var smartjaxStore = storeService.getFullStore(ele);
			if(smartjaxStore){
				var storeIds=smartjaxStore.storeIds;
				var groups=smartjaxStore.groups;
				if(this.idBasedClean && storeIds){
					for(var id in storeIds){
						if(storeIds.hasOwnProperty(id)){
							var storeIdDetails = storeIds[id];
							if(storeIdDetails && storeIdDetails.noAutoClean===true && storeIdDetails.firstSavedOn && (currentDate - storeIdDetails.firstSavedOn) > this.expirationWindowInMilliseconds){
								storeIdsToBeDeleted.push(id);
							}
						}
					}
				}
				if(this.groupBasedClean && groups){
					for(var group in groups){
						if(groups.hasOwnProperty(group)){
							var groupDetails = groups[group];
							if(groupDetails && groupDetails.firstSavedOn && (currentDate - groupDetails.firstSavedOn) > this.expirationWindowInMilliseconds){
								groupsToBeDeleted.push(group);
							}
						}
					}
				}
			}
		}.bind(this));
		smartjax.cleanStore({
			ids: storeIdsToBeDeleted,
			groups: groupsToBeDeleted
		});
	}
};