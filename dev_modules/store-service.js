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