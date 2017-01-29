//multiple helper function to use services
var helper={
	/*
		following function creates a store id
		If id is already given in the request object than use it, else generate
	*/
	buildRequestStoreId:function (requestObj) {
		//if id is provided by the user than use as it is.
		if(requestObj.id)
			return requestObj.id;

		//else create dynamic id
		var storeId="";
		var url=requestObj.url;
		//removing slashes
		if(url){
			if(url[0]!=="/")
				storeId+=url[0];
			storeId+=url.substr(1,url.length-2);
			if(url[url.length-1]!=="/")
				storeId+=url[url.length-1];
		}
		if(requestObj.data)
			storeId+=JSON.stringify(requestObj.data);
		return storeId;
	},

	//check if the call is a forced call
	isForce:function (requestObj) {
		if(typeof(requestObj.force)==="boolean")
			return requestObj.force;
		else{
			return smartjax.defaults.alwaysForce;
		}
	},

	//check if this call response need to be stored
	shouldStore:function (requestObj) {
		if(typeof(requestObj.store)==="boolean")
			return requestObj.store;
		else{
			return smartjax.defaults.alwaysStore;
		}
	},

	/* 
		Where to store?
		In page as an JS object, or in tab as sessionStorage, or forever as localStorage
	*/
	getStorageObj:function (requestObj) {
		var storeName = smartjax.defaults.store;
		var store=null;
		if(typeof requestObj == "string")
			storeName = requestObj;
		else
			if(requestObj && requestObj.store===false)
				storeName=null;

		//if session/local Storage support is not there, return page by default
		if(!Storage)
			return pageStore;

		if(storeName){
			switch(storeName.toLowerCase()){
				case 'tab':
					store = sessionStorage;
					break;
				case 'page':
					store = pageStore;
					break;
				case 'forever':
					store = localStorage;
					break;
			}
		}
		return store;
	},

	/*
		This handles the actual ajax call and storing
	*/
	returnWithAddedStore:function(params) {
		var newDeferred= new $.Deferred();

		//geting the actual requiest object by deleting the smartjax specific variables
		var requiredRequestObj = this.getOriginalRequestObject(params.requestObj);
		
		//check if call is already in progress
		var storeId=params.storeId;
		var promiseOfCall = promiseService.getPromiseFor(storeId);
		if(!promiseOfCall){
			//if no previous promise found, create and send
			var defaultPromise=$.ajax(requiredRequestObj);
			defaultPromise.done(function (apiResult) {
				storeService.save({
					key:storeId,
					value:apiResult,
					storeName:params.requestObj.store,
					noAutoClean: params.requestObj.noAutoClean
				});
				groupService.registerGroup(params.requestObj,storeId);
				newDeferred.resolve(apiResult);
			});
			defaultPromise.fail(function (apiResult) {
				newDeferred.reject(apiResult);
			});
			promiseOfCall=promiseService.setAndRefinePromise(storeId,newDeferred.promise());
		}

		return promiseOfCall;
	},

	/*
		This method removes the unnecessary properties
		from the request object which are used for smartjax operations only
	*/
	getOriginalRequestObject:function (requestObj) {
		var request = $.extend({},requestObj);
		delete request.store;
		delete request.force;
		return request;
	},

	returnFromStore:function(key,storeName, successCallBck) {
		var newDeferred= new $.Deferred();
		var apiResult = storeService.fetch({
			key:key,
			storeName:storeName
		});
		if(successCallBck && typeof(successCallBck)==="function")
			successCallBck();

		newDeferred.resolve(apiResult);
		return newDeferred.promise();
	},

	//To find elements from an array from specific key value match
	findBy:function (array,key,value) {
		if(!array || !array.length || !key || !value)
			return null;
		var allMatched = $.grep(array, function(e){ 
			return e[key] == value; 
		});
		if(allMatched && allMatched.length && allMatched[0])
			return allMatched[0];
		else
			return null;
	},

	//the method who cleans the store actually
	clearAll:function (storeName) {
		var smartjaxStore = storeService.getFullStore(storeName);
		var storeIds=smartjaxStore && smartjaxStore.storeIds;
		if(storeIds && storeIds.length){
			storeIds.forEach(function (storeId) {
				storeService.clearStoreId(storeId,storeName);
			});
		}
		storeService.setFullStore({},storeName);
		console.log("All Smartjax store data cleared");
	}
};