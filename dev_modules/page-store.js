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