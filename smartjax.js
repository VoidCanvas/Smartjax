var Smartjax = function() {



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


// this service helps to manipulate urls. Pushing and poping browser state
var historyService={
	//it will directly replace the url without loading the page
	//takes string as param
	replaceURL:function (url) {
		if(window.history && window.history.pushState){
			var stateObj = { title:'Smartjax Url' };
			history.pushState(stateObj, "Smartjax Url", url);
		}
	},

	//append querystring
	//takes array as param
	/* Example:
		{
			query1:'a query',
			myQuery:'another query'
		}

		output: //currenturl.com?query1=a query&myQuery=another query
	*/
	addQueryString:function (url,queryParams) {
		var currentUrl = url || " ";
		var splittedByHash = currentUrl.split('#');
		var preHashUrl = {
			url:splittedByHash[0]
		};
		var postHashUrl = {
			url:splittedByHash[1]
		};
		
		//if the query params is to be added before hash or after
		var queryParamUrl = (postHashUrl.url && postHashUrl.url.indexOf('?')!=-1)?postHashUrl:preHashUrl;
		if(queryParamUrl.url[queryParamUrl.url.length-1]==='/')
			queryParamUrl.url=queryParamUrl.url.slice(queryParamUrl.url.length-1,queryParamUrl.url.length);

		queryParams = $.extend({},historyService.existingQueryParams(queryParamUrl.url),queryParams);
		queryParamUrl.url = queryParamUrl.url.split('?')[0];
		//appending query params
		for (var key in queryParams) {
		  if (queryParams.hasOwnProperty(key)) {
		  	var value = queryParams[key];
		  	queryParamUrl.url+=(queryParamUrl.url.indexOf('?')===-1)?'?':'&';
		  	queryParamUrl.url+=key+"="+value;
		  }
		}

		var modifiedUrl = preHashUrl.url;
		if(postHashUrl.url)
			modifiedUrl+="#"+postHashUrl.url;	
		return modifiedUrl;		
	},
	existingQueryParams:function (url) {
		var existingQueryParams ={};
		var QSPart = url.split('?')[1];
		if(QSPart){
			var keyValPair = QSPart.split('&');
			keyValPair.forEach(function (keyVal) {
				keyVal=keyVal.split('=');
				var key=keyVal[0];
				var value=keyVal[1];
				existingQueryParams[key]=value;
			});
		}
		return existingQueryParams;
	}
};


// the page level storage
var pageStore={
	SmartjaxStore:{},
	getItem:function (id) {
		return this[id];
	},
	setItem:function (id,obj) {
		this[id]=obj;
	},
	removeItem:function (id) {
		this.setItem(id,null);
	}
};


var promiseService ={
	promiseStore : {
		//it will hold the promise objects
	},

	getPromiseFor:function (storeId) {
		return this.promiseStore[storeId] && this.promiseStore[storeId].promise;
	},

	setAndRefinePromise:function (storeId, promise) {
		this.promiseStore[storeId] = {
			promise:promise
		};
		var newDeferred= new $.Deferred();
		promise.then(function () {
			delete(promiseService.promiseStore[storeId]);
			newDeferred.resolve.apply(this,arguments);
		},function () {
			delete(promiseService.promiseStore[storeId]);
			newDeferred.reject.apply(this,arguments);
		});
		return newDeferred.promise();
	}
};


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


//service related to storage
var	storeService={
	getFullStore:function (storeName) {
		storeName = storeName || smartjax.defaults.store;

		var storeObj = helper.getStorageObj(storeName).getItem("SmartjaxStore");
		if(storeName && storeName.toLowerCase()!="page")
			storeObj = JSON.parse(storeObj);
		return storeObj;
	},
	setFullStore:function (storeData,storeName) {
		storeName = storeName || smartjax.defaults.store;

		var store = helper.getStorageObj(storeName);
		if(storeName && storeName.toLowerCase()=="page")
			store.setItem("SmartjaxStore", storeData);
		else
			store.setItem("SmartjaxStore", JSON.stringify(storeData));
	},
	save:function (reqResToSave) {
		var storeName = reqResToSave.storeName || smartjax.defaults.store;
		var store = helper.getStorageObj(storeName);

		//registers teh key
		if(!this.isInStore(reqResToSave.key, reqResToSave.storeName))
			this.registerNewKey(reqResToSave.key, reqResToSave.storeName, {status: "success"});
		var objectToSave = reqResToSave.value;
		if(storeName!="page")
			objectToSave = JSON.stringify(objectToSave);
		store.setItem(reqResToSave.key, objectToSave);
		
	},
	fetch:function (reqResToFetch) {
		var store = helper.getStorageObj(reqResToFetch.storeName);

		var response= store.getItem(reqResToFetch.key);
		if(reqResToFetch.storeName && reqResToFetch.storeName.toLowerCase()=="page")
			return response;
		else
			return JSON.parse(response);
	},
	isInStore:function (storeId, storeName) {
		storeName = storeName || smartjax.defaults.store;

		var storeIds = this.getFullStore(storeName) && this.getFullStore(storeName).storeIds;

		if(storeIds && storeIds[storeId]!==undefined && storeIds[storeId]!==null)
			return true;
		else
			return false;
	},
	registerNewKey:function (key, storeName, options) {
		storeName = storeName || smartjax.defaults.store;

		var smartjaxStore = this.getFullStore(storeName);
		if(!smartjaxStore)
			smartjaxStore={};
		if(!smartjaxStore.storeIds)
			smartjaxStore.storeIds={};
		smartjaxStore.storeIds[key]={
			firstSavedOn: Date.now()
		};
		this.setFullStore(smartjaxStore,storeName);		
	},
	clearStoreId:function (storeId, storeName) {
		storeName = storeName || smartjax.defaults.store;
		
		var store = helper.getStorageObj(storeName);
		store.removeItem(storeId);
	},
	remove:function (ids, storeName) {
		if(typeof ids == "string")
			ids=[ids];
		var store = storeService.getFullStore(storeName);
		if(store){
			ids.forEach(function (id) {
				if(store.storeIds){
					delete store.storeIds[id];
				}
				this.clearStoreId(id, storeName);
			}.bind(this));
			storeService.setFullStore(store,storeName);
		}
	}
};


return smartjax;
}();
if(typeof module!=="undefined"){
	module.exports = Smartjax;
} else {
	if(typeof window!=="undefined"){
		window.Smartjax = Smartjax;
	}
}
