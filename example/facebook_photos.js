function fb_photos() {
	var fb = require('com.ti.facebook');
	
	var win = Ti.UI.createWindow({
		title: 'Photos',
		backgroundColor:'#fff',
		fullscreen: false
	});
	
	win.fbProxy = fb.createActivityWorker({lifecycleContainer: win});
	
	var B1_TITLE = 'Upload Photo from Gallery with Graph API';
	var B2_TITLE = 'Upload Photo from file with Graph API';
	
	var b1 = Ti.UI.createButton({
		title:B1_TITLE,
		left: 10, right: 10, top: 0, height: 80
	});
	
	var b2 = Ti.UI.createButton({
		title: B2_TITLE,
		left: 10, right: 10, top: 90, height: 80
	});
	
	function showRequestResult(e) {
		var s = '';
		if (e.success) {
			s = 'SUCCESS';
			if (e.result) {
				s += "; " + e.result;
			}
		} else {
			s = 'FAIL';
			if (e.error) {
				s += "; " + e.error;
			}
		}
		b1.title = B1_TITLE;
		b2.title = B2_TITLE;
		alert(s);
	}
	
	var login = fb.createLoginButton({
		top: 10
	});
	login.style = fb.BUTTON_STYLE_WIDE;
	win.add(login);

	var actionsView = Ti.UI.createView({
		top: 80, left: 0, right: 0, visible: fb.loggedIn, height: 'auto'
	});
	actionsView.add(b1);
	actionsView.add(b2);
	
	fb.addEventListener('login', function(e) {
		if (e.success) {
			actionsView.show();
			//If publish_actions permission is not granted, request it
			if(fb.permissions.indexOf('publish_actions') < 0) {
				fb.requestNewPublishPermissions(['publish_actions'],function(e){
					if(e.success) {
						Ti.API.info('Permissions:'+fb.permissions);
					}
					if(e.error) {
						Ti.API.info('Publish permission error');
					}
					if(e.cancelled) {
						Ti.API.info('Publish permission cancelled');
					}
				});
			}
		}
		if (e.error) {
			alert(e.error);
		}
	});
	
	fb.addEventListener('logout', function(e){
		Ti.API.info('logout event');
		actionsView.hide();
	});
	
	b1.addEventListener('click', function() {
		Titanium.Media.openPhotoGallery({
			success:function(event)
			{
				b1.title = 'Uploading Photo...';
				var data = {picture: event.media};
				fb.requestWithGraphPath('me/photos', data, "POST", showRequestResult);
			},
			cancel:function()
			{
			},
			error:function(error)
			{
			},
			allowEditing:true
		});
	});
	
	
	b2.addEventListener('click', function() {
		b2.title = 'Uploading Photo...';
		var f = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'images', 'flower.jpg');
		var blob = f.read();
		var data = {
			caption: 'behold, a flower',
			picture: blob
		};
		// Rest API is deprecated. Please use requestWithGraphPath
		fb.requestWithGraphPath('me/photos', data, "POST", showRequestResult);
	});
	
	
	win.add(actionsView);
	return win;
};

module.exports = fb_photos;
