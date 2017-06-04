//group service to handle grouping
var groupService={		
	registerGroup:function (requestObj,storeId) {
		var group = requestObj.group;
		if(!group)
			return null;
		if(!storeId)
			storeId=helper.buildRequestStoreId(requestObj);
		
		var smartjaxStore = storeService.getFullStore(requestObj.store);
		if(!smartjaxStore)
			smartjaxStore={};
		if(!smartjaxStore.groups)
			smartjaxStore.groups={};
		var selectedGroup=smartjaxStore.groups[requestObj.group];
		if(!selectedGroup){
			selectedGroup={
				group:requestObj.group,
				storeIds:[],
				firstSavedOn: Date.now()
			};
			smartjaxStore.groups[requestObj.group]=selectedGroup;
		}
		if(selectedGroup.storeIds.indexOf(storeId)==-1)
			selectedGroup.storeIds.push(storeId);
		storeService.setFullStore(smartjaxStore,requestObj.store);	
		return true;
	},
	clearGroupData:function (groupName, storeName) {
		var smartjaxStore=storeService.getFullStore(storeName);
		var selectedGroup = smartjaxStore && smartjaxStore.groups && smartjaxStore.groups[groupName];
		if(!selectedGroup || !smartjaxStore)
			return false;
		else{
			//var mainStoreIds=smartjaxStore.storeIds;
			var storeIds=selectedGroup.storeIds;
			if(storeIds){
				storeIds.forEach(function (storeId) {
					//mainStoreIds.splice(mainStoreIds.indexOf(storeId),1);
					storeService.remove(storeId, storeName);
					storeService.clearStoreId(storeId, storeName);
				});					
			}
			smartjaxStore=storeService.getFullStore(storeName); //again fetching the latest data
			if(smartjaxStore && smartjaxStore.groups && smartjaxStore.groups[groupName]){
				delete smartjaxStore.groups[groupName];
			}
			storeService.setFullStore(smartjaxStore,storeName);
			console.log("group "+groupName+" cleared from Smartjax store");
		}
	},
	
	clearGroups:function (groups, storeName) {
		if(groups && groups.length){
			groups.forEach($.proxy(function (value,index) {
				this.clearGroupData(value,storeName);
			},this));
		}
	},
	
};