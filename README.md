# Smartjax : make your ajax calls smarter

## Demo
[Working demo](http://www.voidcanvas.com/demo/1339smartjax-demo/)

## Description
Smartjax stores your api responses and do not ping the server in the same ajax call for the second time. Eg: you display your logged in user's summery in the right top cornor of your site. But to display that in every page you either need to make an ajax call, or have to make a server side processing. But using smartjax, you will get rid of all those processing. It will make the first call to get the user info and will store it internally. For you implementing this is not at all difficult. You don't have to think of all these storing and retrieving thing. You just have to use Smartjax.ajax() instead of $.ajax(), that's it.

## Why useful?
Firstly, Smartjax.js is a very light weight plugin. Including this in your page will not make it heavy. Secondly, the syntax is almost exactly similar to $.ajax(), so no overhead of learning. Just few extra flags you need to know about. Thirdly, reducing server-client http interaction really gives a performance boost to your application.


## How to use:
This is very very simple to use the smartjax. Below is a comparison.

**In jQuery:**

	$.ajax({
		url:'http://httpbin.org/post',
		type: 'POST',
		data:{
			a:1,b:2
		}
	});

**In Smartjax:**

	Smartjax.ajax({
		url:'http://httpbin.org/post',
		type: 'POST',
		data:{
			a:1,b:2
		}
	});

Smartjax caches the result in the client side, and response with the same if you make the call again. 

## How to control data flow:

With some extra parameter in the Smartjax.ajax() call you can control the behavior of storing. Some of them also helps to clear the saved data.

**Smartjax**

If you include the library smartjax.js, it will create a global variable Smartjax. This variable contains a function ajax().

**force**

If *force* property is true in a call, no matter even if the response is saved, but smartjax will make and fresh call and shore the new result.

	Smartjax.ajax({
		url:'http://httpbin.org/post',
		type: 'POST',
		data:{
			a:1,b:2
		},
		force:true
	});
Defaulty the value is false.

**id**

You can provide indevidual *id* to each call. So that you can indevidually identify a call. You can clear the saved response of an id.

	Smartjax.ajax({
		url:'http://httpbin.org/post',
		type: 'POST',
		data:{
			a:1,b:2
		},
		id:"i1"
	});

**group**

You can group the calls using the *group* parameter. For the time being, the group is useful at the time of cleaning the store.

	Smartjax.ajax({
		url:'http://httpbin.org/post',
		type: 'POST',
		data:{
			a:1,b:2
		},
		group:"group1"
	});

**cleanStore(param)**

This function is used to clean the store. You can provide list of groups or ids or both to be cleaned.
	
	Smartjax.cleanStore({groups:["g1"]},{ids:["i1"]});

The above syntax make the call record clean for the particular group. Other parameters will be supported soon in this function.

**cleanAll()**

This function is parameterless and cleans all the saved records.
	
	Smartjax.cleanAll();

**setDefaults(param)**
	
	Smartjax.setDefaults({
		defaultMethod: 'get',
		alwaysForce: false,
		alwaysStore: true
	});

The function takes an object as a parameter. where you can mention the properties given above. By default the default call method is 'get', but you can change it for all calls. Same in case of force and store.

**changeUrl()**

	Smartjax.changeUrl({
		url:'/my-relative-url',
		params:{
			query1:'query text',
			myQuery:'my own query'
		}
	});

The property 'url' is optional. If you don't provide, it will execute with current url. The second property 'params' is to take a JSON object with query string params and values. If any param is already present in the url it will replace the previous value with the new one you provide. 

## Different kind of store

You can cache a call in for different types. Below are the examples.

**do not store**

If *store* property is set to false in the call, the response will not be saved. If you do not want to store by default, you can change the store property in defaults. In the next point you will find how to set defaults.

	Smartjax.ajax({
		url:'http://httpbin.org/post',
		type: 'POST',
		data:{
			a:1,b:2
		},
		store:false
	});

**page level storage**

If you want to store some response in page level; that is, after a page refresh, things should not be there, you have to set the *store* property to "page".

	Smartjax.ajax({
		url:'http://httpbin.org/post',
		type: 'POST',
		data:{
			a:1,b:2
		},
		store:"page"
	});


**tab level storage**

If you want to store some response in tab level; that is, if you access the site in a particular tab and no matter how many times you refresh or navigate to other pages of the site, the response will be cached there.

	Smartjax.ajax({
		url:'http://httpbin.org/post',
		type: 'POST',
		data:{
			a:1,b:2
		},
		store:"tab"
	});


**forever storage**

If you want to cache a call response forever in your browser, you have to set the value of *store* to "forever".

	Smartjax.ajax({
		url:'http://httpbin.org/post',
		type: 'POST',
		data:{
			a:1,b:2
		},
		store:"forever"
	});


## Setting defaults

To set smartjax defaults, you need to call the function *setDefaults* once with the default values you want.

	Smartjax.setDefaults({
		alwaysForce: false,
		alwaysStore: true,
		store:'tab'
	});


## Pipelined features
* Record and Mock services, which will help you to develop UI even if your api is not ready.
