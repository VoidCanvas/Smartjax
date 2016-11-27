return smartjax;
}();
if(typeof module!=="undefined"){
	module.exports = Smartjax;
} else {
	if(typeof window!=="undefined"){
		window.Smartjax = Smartjax;
	}
}
