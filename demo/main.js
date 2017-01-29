$("#btn_c1").on('click',function () {
	$("#resultContainer").html('');
	$("#callMsgBoard").html("Call in progress!!");
	var promise=Smartjax.ajax({
		url:'http://httpbin.org/get',
		type: 'GET',
		noAutoClean: true
	});
	promise.then(function (apiResult) {
		$("#callMsgBoard").html("Call completed!!");
		$("#resultContainer").html(JSON.stringify(apiResult));
	},function(){
		$("#callMsgBoard").html("Call failed!!");
	});
});

$("#btn_c1_force").on('click',function () {
	$("#resultContainer").html('');
	$("#callMsgBoard").html("Call in progress!!");
	var promise=Smartjax.ajax({
		url:'http://httpbin.org/get',
		type: 'GET',
		force: true,
	});
	promise.then(function (apiResult) {
		$("#callMsgBoard").html("Call completed!!");
		$("#resultContainer").html(JSON.stringify(apiResult));
	},function(){
		$("#callMsgBoard").html("Call failed!!");
	});
});

$("#btn_c2_g1").on('click',function () {
	$("#resultContainer").html('');
	$("#callMsgBoard").html("Call in progress!!");
	var promise=Smartjax.ajax({
		url:'http://httpbin.org/post',
		type: 'POST',
		store:"page",
		data:{
			a:1,b:2
		},
		group:'g1',
		id:"i1"
	});
	promise.then(function (apiResult) {
		$("#callMsgBoard").html("Call completed!!");
		$("#resultContainer").html(JSON.stringify(apiResult));
	},function(){
		$("#callMsgBoard").html("Call failed!!");
	});
});
$("#btn_c3_g1").on('click',function () {
	$("#resultContainer").html('');
	$("#callMsgBoard").html("Call in progress!!");
	var promise=Smartjax.ajax({
		url:'http://jsonplaceholder.typicode.com/posts/1',
		type: 'GET',
		store:"forever",
		group:'g1'
	});
	promise.then(function (apiResult) {
		$("#callMsgBoard").html("Call completed!!");
		$("#resultContainer").html(JSON.stringify(apiResult));
	},function(){
		$("#callMsgBoard").html("Call failed!!");
	});
});

$("#btn_c4_g2").on('click',function () {
	$("#resultContainer").html('');
	$("#callMsgBoard").html("Call in progress!!");
	var promise=Smartjax.ajax({
		url:'http://jsonplaceholder.typicode.com/posts/3',
		type: 'GET',
		group:'g2'
	});
	promise.then(function (apiResult) {
		$("#callMsgBoard").html("Call completed!!");
		$("#resultContainer").html(JSON.stringify(apiResult));
	},function(){
		$("#callMsgBoard").html("Call failed!!");
	});
});

$("#btn_c5_g2").on('click',function () {
	$("#resultContainer").html('');
	$("#callMsgBoard").html("Call in progress!!");
	var promise=Smartjax.ajax({
		url:'http://jsonplaceholder.typicode.com/posts/2',
		type: 'GET',
		group:'g2'
	});
	promise.then(function (apiResult) {
		$("#callMsgBoard").html("Call completed!!");
		$("#resultContainer").html(JSON.stringify(apiResult));
	},function(){
		$("#callMsgBoard").html("Call failed!!");
	});
});

$('#btn_clr_i1').on('click',function () {
	Smartjax.cleanStore({ids:["i1"]});
	$("#callMsgBoard").html("id:i1 saved calls removed");
});
$('#btn_clr_g1').on('click',function () {
	Smartjax.cleanStore({groups:["g1"]});
	$("#callMsgBoard").html("group:g1 saved calls removed");
});
$('#btn_clr_g2').on('click',function () {
	Smartjax.cleanStore({groups:["g2"]});
	$("#callMsgBoard").html("group:g2 saved calls removed");
});
$('#btn_clr_all').on('click',function () {
	Smartjax.cleanAll();
	$("#callMsgBoard").html("all saved calls removed");
});


Smartjax.setExpirationWindow({
	seconds: 15,
	minutes: 0,
	hours: 0,
	days: 0,
	cleanAll: false,
	groupBasedClean: true
});