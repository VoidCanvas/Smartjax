# Smartjax : make your ajax calls smarter

## Demo
[Working demo](http://www.voidcanvas.com/demo/1339smartjax-demo/)

## Description
Smartjax stores your API responses and does not ping the server for the same ajax call for the second time (options are available for force call too).

**Example**

You display your logged in user's summary in the top-right corner of your site. But to display that in every page you either need to make an ajax call, or have to make a server side processing. But using smartjax, you will get rid of all those processing.

Display it by making an ajax call using Smartjax. It will make the first call to get the user info and will store it internally. You can store the information for page level, tab's lifetime level or for forever. You can clear the entire store or the response for a particular one anytime you want.

## Why useful?

	* Reducing http calls will give your site a performance boost.
	* It will also reduce your server side processing, as the client side itself returns the result.
	* You can store responses for the lifetime of a page, a tab, or forever.
	* The plugin is very light weight.
	* You don't have to learn a lot. Instead of $.ajax(), use Smartjax.ajax() and it will start caching. There are some extra flags and methods you need to know to manage and clear your stored response.


## How to use:
This is very very simple to use the smartjax. Below is a comparison.

**In jQuery:**

```javascript
$.ajax({
	url:'http://httpbin.org/post',
	type: 'POST',
	data:{
		a:1,b:2
	}
});
```

**In Smartjax:**

```javascript
Smartjax.ajax({
	url:'http://httpbin.org/post',
	type: 'POST',
	data:{
		a:1,b:2
	}
});
```

Smartjax caches the result in the client side, and response with the same if you make the call again.

## Different level of caching

Using the property *store* you can decide whether the response should be stored till the page gets refreshed, or until the tab is closed or should be stored forever.

**Page level**

```javascript
Smartjax.ajax({
	url:'http://httpbin.org/post',
	type: 'POST',
	data:{
		a:1,b:2
	},
	store:"page"
});
```

This will clear the response once you reload the page or navigate to another page.

**Tab level**

```javascript
Smartjax.ajax({
	url:'http://httpbin.org/post',
	type: 'POST',
	data:{
		a:1,b:2
	},
	store:"tab"
});
```

This will keep the response till the user closes the tab. Even if the page is refresehed or user navigates to another page, the response will be cached in smartjax and will be returned from client side cache, if same call is made again. This is default store type in smartjax.

**Forever**

```javascript
Smartjax.ajax({
	url:'http://httpbin.org/post',
	type: 'POST',
	data:{
		a:1,b:2
	},
	store:"forever"
});
```

If you don't want too remove the response of a particular call, use *forever* as the value of *store*. However, smartjax provide you methods to clean your entire store or a particular call response. So you can clear them explicitly, any time you want.

**do not store**

If *store* property is set to false in the call, the response will not be saved. If you do not want to store by default, you can change the store property in defaults. In the next point you will find how to set defaults.

```javascript
Smartjax.ajax({
	url:'http://httpbin.org/post',
	type: 'POST',
	data:{
		a:1,b:2
	},
	store:false
});
```


## How to control data flow:

With some extra parameter in the Smartjax.ajax() call you can control the behavior of storing. Some of them also helps to clear the saved data.

**force**

If *force* property is true in a call, no matter even if the response is saved, but smartjax will make and fresh call and store the new result.

```javascript
Smartjax.ajax({
	url:'http://httpbin.org/post',
	type: 'POST',
	data:{
		a:1,b:2
	},
	force:true
});
```
Default value for *force* option is false.

**id**

You can provide separate *id* to each call. So that you can individually identify a call. You can clear the saved response of the call by using the specified *id*.

```javascript
Smartjax.ajax({
	url:'http://httpbin.org/post',
	type: 'POST',
	data:{
		a:1,b:2
	},
	id:"i1"
});
```

**group**

You can group the calls using the *group* parameter. For the time being, the group is useful at the time of cleaning the store.

```javascript
Smartjax.ajax({
	url:'http://httpbin.org/post',
	type: 'POST',
	data:{
		a:1,b:2
	},
	group:"group1"
});
```

**cleanStore(param)**

This function is used to clean the store. You can provide list of groups or ids or both to be cleaned.

```javascript
Smartjax.cleanStore({groups:["g1"], ids:["i1"]});
```


**cleanAll()**

This function is parameter-less and cleans all the saved records.

```javascript
Smartjax.cleanAll();
```

The function takes an object as a parameter. where you can mention the properties given above. By default, the default call method is 'get' (GET verb), but you can change it for all calls. Same in case of *force* and *store* options.

## Time based auto expiration
If you want the cached API calls to be cleared after a certain period of time; you can run `.setExpirationWindow()` with parameters. See example in `demo/main.js`. The expiration is a periodic task which runs in every your given timeframe.

```javascript
Smartjax.setExpirationWindow({
	seconds: 0,
	minutes: 1,
	hours: 0,
	days: 0,
	cleanAll: false, //default is false
	groupBasedClean: false //default is false
});
```
You can provide the time parameters in seconds, minutes etc. If you don't provide one, that will be considered as 0 (zero). If  `cleanAll: true` option is used, it will clean all cached records, once the oldest cache record is crossed the given time limit. You can set `groupBasedClean:true` if you want to clean all calls of a group once the oldest one of that group is crossed the time limit.

**Exception calls**

If your time based expiration is on, but you want certain calls to keep its cache alive, you can set `noAutoClean:true` to that particular call. Below is an example.

```javascript
Smartjax.ajax({
	url:'http://httpbin.org/get',
	type: 'GET',
	noAutoClean: true
});
```


#URL manipulation

Smartjax has in-built support for URL manipulations. You can change your browser URL without reloading the entire page, using the following:

**changeUrl()**

```javascript
Smartjax.changeUrl({
	url:'/my-relative-url',
	params:{
		query1:'query text',
		myQuery:'my own query'
	}
});
```

The property 'url' is optional. If you don't provide, it will execute with current URL. The second property 'params' is to take a JSON object with query string params and values. If any param is already present in the url it will replace previous value with the new one.

