# Smartjax : make your ajax calls smarter

## Demo
[Working demo](http://www.voidcanvas.com/demo/1339smartjax-demo/)

## Description
Smartjax stores your api responses and do not ping the server for the same ajax call for the second time (options are available for force call too).

**Example**

You display your logged in user's summery in the right top cornor of your site. But to display that in every page you either need to make an ajax call, or have to make a server side processing. But using smartjax, you will get rid of all those processing.

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

Using the property *store* you can decide should the response be stored till the page refresh, or till the tab closes or forever.

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

This will clear the response once you reload the page or nvigate to another page.

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

This will keep the response till the user closes the tab. Even if he refreshes the page or navigate to another, the response will still be with smartjax and will be retured from client side cache of called again. This is also the default store of smartjax.

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

You don't wanna remove the response of a particular call? Use *forever* as the value of *store*. However smartjax provide you methods to clean your entire store or a particular call response. So you can clear things explicitly, any time you want.

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

If *force* property is true in a call, no matter even if the response is saved, but smartjax will make and fresh call and shore the new result.

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
Default the value is false.

**id**

You can provide individual *id* to each call. So that you can individually identify a call. You can clear the saved response of an id.

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

This function is parameterless and cleans all the saved records.

```javascript
Smartjax.cleanAll();
```

The function takes an object as a parameter. where you can mention the properties given above. By default the default call method is 'get', but you can change it for all calls. Same in case of force and store.

## Time based auto expiration
If you want the cached api calls to be cleared after a certain period of time; you can run `.setExpirationWindow()` with parameters. See example in `demo/main.js`. The expiration is a periodic task which runs in every your given timeframe.

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
You can provide the time parameters like seconds, minutes etc. If you don't provide one, that will be considered as zero. If you make `cleanAll: true`, it will clean all cached records once the oldest cache record is crossed the given time limit. You can set `groupBasedClean:true` if you want to clean all calls of a group once the oldest one of that group is crossed the time limit.

**Exception calls**

If your time based expiration is on, but you want certain calls to keep its cache alive, you can set `noAutoClean:true` to that perticular call. Below is an example.

```javascript
Smartjax.ajax({
	url:'http://httpbin.org/get',
	type: 'GET',
	noAutoClean: true
});
```


#Url manipulation

Smartjax has started supporting url manipulations. Now you can change your browser url without reloading the page using the folowing.

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

The property 'url' is optional. If you don't provide, it will execute with current url. The second property 'params' is to take a JSON object with query string params and values. If any param is already present in the url it will replace the previous value with the new one you provide.

