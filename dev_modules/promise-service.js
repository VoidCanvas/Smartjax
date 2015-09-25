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