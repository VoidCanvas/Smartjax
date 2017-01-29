// the actual Smartjax to be returned
var smartjax={
	
	/*
		These are the default values smartjax uses in operations
	*/
	defaults:{
		defaultMethod: 'get',
		alwaysForce: false,
		alwaysStore: true,
		defaultStorageName: 'SmartjaxStore',
		store:'tab' // values can be 'page', 'tab' and 'forever' 
	},

	/*
		This method helps to override the defaults
	*/
	setDefaults:function (newValues) {
		$.extend(this.defaults,newValues);
	},

	//ajax to handle all request
	ajax: function (requestObj) {
		//generating unique requestStoreId
		var requestStoreId = helper.buildRequestStoreId(requestObj);
		//make calls accordingly
		if(!helper.isForce(requestObj) && storeService.isInStore(requestStoreId, requestObj.store)){
			return 	helper.returnFromStore(requestStoreId, requestObj.store ,requestObj.success);
		}
		else{
			if(helper.shouldStore(requestObj))
				return helper.returnWithAddedStore({
					storeId:requestStoreId,
					requestObj:requestObj	
				});
			else
				return $.ajax(helper.getOriginalRequestObject(requestObj));	
		}
	},
	//clears everything smartjax cached
	cleanAll:function (storeName) {
		this.cleanStore({clearAll:true}, storeName);
	},
	//cleans specific items (specific ids and groups)
	cleanStore:function (params, storeName) {
		//check and clear all
		var clearAll=params.clearAll;
		if(clearAll===true){
			if(storeName){
				helper.clearAll(storeName);
			}
			else{
				helper.clearAll("page");
				helper.clearAll("tab");
				helper.clearAll("forever");
				return true;
			}
		}

		//clear things basing on ids first
		var ids=params.ids;
		if(ids){
			if(storeName){
				storeService.remove(ids,storeName);
			}
			else{
				storeService.remove(ids,"page");
				storeService.remove(ids,"tab");
				storeService.remove(ids,"forever");
			}
		}

		//clear groups
		var groups=params.groups;
		if(groups){
			if(storeName){
				groupService.clearGroups(groups,storeName);
			}
			else{
				groupService.clearGroups(groups,"page");
				groupService.clearGroups(groups,"tab");
				groupService.clearGroups(groups,"forever");
			}
		}
	},

	setExpirationWindow: function(obj){
		var milliseconds = obj.milliseconds || 0;
		var seconds = obj.seconds || 0;
		var minutes = obj.minutes || 0;
		var hours = obj.hours || 0;
		var days = obj.days || 0;
		var cleanAll = (obj.cleanAll === true) || false;
		expirationService.setExpirationWindow(milliseconds,seconds,minutes,hours,days,cleanAll,obj.groupBasedClean,obj.idBasedClean);
	},
	/*
		if you pass a string, it will completely replace the browser url
		if a JSON object is sent as a param with two properties it will work accordingly
		Eg:
		{
			url:'a url',
			params:{
				query1:'a query',
				myQuery:'another query'
			}
		}
		if you want to append the query params to the current url then send the url property as null
	*/
	changeUrl:function (reqModel) {
		var url = reqModel.url || window.location.href;
		var params = reqModel.params;
		if(params)
			url = historyService.addQueryString(url,params);
		historyService.replaceURL(url);
	}
};