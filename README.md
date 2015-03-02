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

**store**

If *store* property is set to false in the call, the response will not be saved.

	Smartjax.ajax({
		url:'http://httpbin.org/post',
		type: 'POST',
		data:{
			a:1,b:2
		},
		store:false
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

This function is used to clean the store. Right now group wise cleaning is supported in Smartjax.
	
	Smartjax.cleanStore({groups:["g1"]});

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


## Pipelined features
* support of ID. It will make saving data and retrieving faster.
* Record and Mock services, which will help you to develop UI even if your api is not ready.
