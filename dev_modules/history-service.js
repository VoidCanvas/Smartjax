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