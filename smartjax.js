var Smartjax = function() {


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
			if(!helper.isForce(requestObj) && storeService.isInStore(requestStoreId)){
				return 	helper.returnFromStore(requestStoreId, requestObj.success);
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
		cleanAll:function () {
			this.cleanStore({clearAll:true})
		},
		//cleans specific items (specific ids and groups)
		cleanStore:function (params) {
			//clear things basing on ids first
			var ids=params.ids;
			if(ids)
				storeService.remove(ids);

			//clear groups
			var groups=params.groups;
			if(groups)
				groupService.clearGroups(groups);
			
			//check and clear all
			var clearAll=params.clearAll;
			if(clearAll===true){
				helper.clearAll();
				return true;
			}
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
	}

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
		storageName:function (requestObj) {
			if (requestObj.store===true)
				requestObj.store=defaults.store;
			if(requestObj.store){
				switch(requestObj.store.toLowerCase()){
					case 'tab':
						return "sessionStorage";
					case 'page':
						return "globalVariable";
					case 'forever':
						return "localStorage";
				}
			}
			return null;
		},

		/*
			This handles the actual ajax call and storing
		*/
		returnWithAddedStore:function(params) {
			var newDeferred= new $.Deferred();

			//geting the actual requiest object by deleting the smartjax specific variables
			var requiredRequestObj = this.getOriginalRequestObject(params.requestObj);
			
			var defaultPromise=$.ajax(requiredRequestObj);
			defaultPromise.done(function (apiResult) {
				storeService.save({
					key:params.storeId,
					value:apiResult,
					store:helper.storageName(params)
				});
				groupService.registerGroup(params.requestObj,params.storeId)
				newDeferred.resolve(apiResult);
			});
			defaultPromise.fail(function (apiResult) {
				newDeferred.reject(apiResult)
			});
			return newDeferred.promise();
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

		returnFromStore:function(key,successCallBck) {
			var newDeferred= new $.Deferred();
			var apiResult = storeService.fetch({
				key:key
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
		clearAll:function () {
			var smartjaxStore = storeService.getFullStore();
			var storeIds=smartjaxStore && smartjaxStore.storeIds;
			if(storeIds && storeIds.length){
				storeIds.forEach(function (storeId) {
					storeService.clearStoreId(storeId);
				})
			}
			storeService.setFullStore({});
			console.log("All Smartjax store data cleared");
		}
	}

	//service related to storage
	var	storeService={
		getFullStore:function (storeName) {
			if(!storeName)
				return JSON.parse(sessionStorage.getItem("SmartjaxStore"));
			else
				return JSON.parse(sessionStorage.getItem(storeName));
		},
		setFullStore:function (storeData,storeName) {
			if(!storeName)
				sessionStorage.setItem("SmartjaxStore", JSON.stringify(storeData));
			else
				sessionStorage.setItem(storeName, JSON.stringify(storeData))
		},
		save:function (reqResToSave) {
			if(typeof(Storage)){
				if(!this.isInStore(reqResToSave.key))
					this.registerNewKey(reqResToSave.key);
				sessionStorage.setItem(reqResToSave.key, JSON.stringify(reqResToSave.value));
			}
		},
		fetch:function (reqResToFetch) {
			var stringResponse= sessionStorage.getItem(reqResToFetch.key)
			return JSON.parse(stringResponse);
		},
		isInStore:function (storeId) {
			var storeIds = this.getFullStore() && this.getFullStore().storeIds;
			if(storeIds && storeIds.length && storeIds.indexOf(storeId)!=-1)
				return true;
			else
				return false;
		},
		registerNewKey:function (key) {
			var smartjaxStore = this.getFullStore();
			if(!smartjaxStore)
				smartjaxStore={};
			if(!smartjaxStore.storeIds || !smartjaxStore.storeIds.length)
				smartjaxStore.storeIds=[];
			smartjaxStore.storeIds.push(key);
			this.setFullStore(smartjaxStore);		
		},
		clearStoreId:function (storeId) {
			sessionStorage.removeItem(storeId);
		},
		remove:function (ids) {
			if(typeof ids == "string")
				ids=[ids];
			var store = storeService.getFullStore();
			ids.forEach(function (id) {
				var index = store.storeIds.indexOf(id);
				if(index!=-1){
					store.storeIds.splice(index,1);
					this.clearStoreId(id);
				}
			}.bind(this));
			storeService.setFullStore(store);
		}
	}

	//group service to handle grouping
	var groupService={		
		registerGroup:function (requestObj,storeId) {
			var group = requestObj.group;
			if(!group)
				return null;
			if(!storeId)
				storeId=helper.buildRequestStoreId(requestObj);
			
			var smartjaxStore = storeService.getFullStore();
			if(!smartjaxStore)
				smartjaxStore={};
			if(!smartjaxStore.groups || !smartjaxStore.groups.length)
				smartjaxStore.groups=[];
			var selectedGroup=smartjaxStore.groups && helper.findBy(smartjaxStore.groups,'group',requestObj.group);
			if(!selectedGroup){
				selectedGroup={
					group:requestObj.group,
					storeIds:[],
				}
				smartjaxStore.groups.push(selectedGroup);
			}
			if(selectedGroup.storeIds.indexOf(storeId)==-1)
				selectedGroup.storeIds.push(storeId);
			storeService.setFullStore(smartjaxStore);	
			return true;
		},
		clearGroupData:function (groupName) {
			var smartjaxStore=storeService.getFullStore();
			var selectedGroup = smartjaxStore.groups && smartjaxStore.groups.length && helper.findBy(smartjaxStore.groups,'group',groupName);
			var mainStoreIds=smartjaxStore.storeIds;
			if(!selectedGroup)
				return false;
			else{
				var storeIds=selectedGroup.storeIds;
				if(storeIds){
					storeIds.forEach(function (storeId) {
						mainStoreIds.splice(mainStoreIds.indexOf(storeId),1);
						storeService.clearStoreId(storeId)
					});					
				}
				delete selectedGroup;
				storeService.setFullStore(smartjaxStore);
				console.log("group "+groupName+" cleared from Smartjax store");
			}
		},
		
		clearGroups:function (groups) {
			if(groups && groups.length){
				groups.forEach($.proxy(function (value,index) {
					this.clearGroupData(value);
				},this));
			}
		},
		
	}

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
			}
			var postHashUrl = {
				url:splittedByHash[1]
			}
			
			//if the query params is to be added before hash or after
			var queryParamUrl = (postHashUrl.url && postHashUrl.url.indexOf('?')!=-1)?postHashUrl:preHashUrl;
			if(queryParamUrl.url[queryParamUrl.url.length-1]==='/')
				queryParamUrl.url=queryParamUrl.url.slice(queryParamUrl.url.length-1,queryParamUrl.url.length)

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

			var modifiedUrl = preHashUrl.url 
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
	}

return smartjax;
}();
