(function() {
	var chatApp = function() {
		
		function payLoad(userId, message) {
			this.userId = userId;
			this.message = message;
		}
		
		var settings = {
			dom: {
				searchBox: function() {return jQuery('.searchbox');},
				siderBarBody: function() {return jQuery('.sideBar-body');},
				sendReply: function() {return jQuery('.send-reply');},
				comment: function() {return jQuery('#comment');},
				sideBar: function() {return jQuery('.sideBar > div');},
				headerName: function() {return jQuery('.heading-name-meta');},
				conversation: function() {return jQuery('.conversation > div');}
			},
			init: function() {
				settings.utilities.freezeClickEvents();
				settings.utilities.loadUsers();
				this.events.all();
				settings.utilities.unFreezeClickEvents();
			},
			events: {
				all: function() {
					settings.events.sendReplyClick();
					settings.events.userClick();
					settings.events.searchBox();
				},
				searchBox:function() {
					settings.dom.searchBox().on('keyup', 'input', function(e) {
						let $elem = jQuery(this),
							text = $elem.val().trim().toUpperCase(),
							userId = settings.utilities.selectedUserId();
						settings.dom.siderBarBody().each(function() {
							let $this = jQuery(this),
								elemText = $this.text().trim().toUpperCase();
							if(elemText.indexOf(text) === -1 && userId !== $this.attr('user-id')) {
								$this.addClass('hide');
							} else {
								$this.removeClass('hide');
							}
						});
					});
				},
				userClick:function(){
					settings.dom.sideBar().on('click', '.sideBar-body', function(e) {
						let $elem = jQuery(this);
						if(!$elem.hasClass('user-selected')) {
							settings.dom.conversation().empty();
							settings.dom.comment().val('');
							settings.dom.sideBar().find('.user-selected').removeClass('user-selected');
							let userId = parseInt($elem.attr('user-id'));
							$elem.addClass('user-selected');
							let user = settings.globals.defaultUsers.filter(function(o){
								return o.id === userId;
							});
							if(user.length) {
								settings.utilities.getMessages().done(function(messages) {
									messages.forEach(function(messageObj) {
										settings.utilities.appendMessage(messageObj.message, messageObj.isSend,messageObj.day);
									});
								});
								settings.dom.headerName().text(user[0].name);
							}
						}
					});
				},
				sendReplyClick: function() {
					settings.dom.sendReply().on('click', function(e) {
						var $elem = settings.dom.comment(),
							userId = settings.utilities.selectedUserId(),
							$text = $elem.val().trim();
						if (userId && $text.length > 0) {
							let data = new payLoad(userId, $text)
							settings.utilities.appendMessage($text, true,settings.utilities.getDay());
							socket.send(JSON.stringify(data));
							settings.utilities.saveMessage(data, true);
							$elem.val('');
						}
					});
				}
			},
			utilities: {
				freezeClickEvents: function() {
					settings.dom.siderBarBody().css('pointer', 'none');
					settings.dom.sendReply().css('pointer', 'none');
				},
				unFreezeClickEvents: function() {
					settings.dom.siderBarBody().css('pointer', 'cursor');
					settings.dom.sendReply().css('pointer', 'cursor');
				},
				selectedUserId: function() {
					return settings.dom.sideBar().find('.user-selected').attr('user-id');
				},
				receiveMessage: function(message) {
					var messageObj = JSON.parse(message);
					//==to ignore int and string comparison
					if(messageObj.userId == settings.utilities.selectedUserId()) {
						settings.utilities.appendMessage(messageObj.message, false,settings.utilities.getDay());
					}
					settings.utilities.saveMessage(messageObj, false);
				},
				appendMessage: function(message , isSend, day) {
					var $template = jQuery(isSend ? settings.templates.senderTemplate : settings.templates.receiverTemplate),
						$conversation = settings.dom.conversation();
					$template.find('.message-text').text(message);
					$template.find('.message-time').text(day || settings.utilities.getDay());
					$conversation.append($template);
					$conversation.scrollTop($conversation[0].scrollHeight);
				},
				saveMessage:function(messageObj, isSend){
					var messages = localStorage.getItem(messageObj.userId.toString());
					if(messages) {
						messages = JSON.parse(messages);
					} else {
						messages = [];
					}
					messages.push({message:messageObj.message, isSend:isSend, day: settings.utilities.getDay()});
					localStorage.setItem(messageObj.userId.toString(),JSON.stringify(messages));
				},
				getMessages: function() {
					//same example of promise
					var dfd = jQuery.Deferred();
					setTimeout(function() {
						try {
							let userId = settings.utilities.selectedUserId(),
								messages = localStorage.getItem(userId.toString());
							if(messages && messages.length > 0) {
								messages = JSON.parse(messages);
								dfd.resolve(messages);
							} else {
								dfd.reject("list is empty");
							}
						} catch(e) {
							dfd.reject(e);
						}
					});
					return dfd.promise();
				},
				loadUsers: function() {
					var sideBar = settings.dom.sideBar();
					settings.globals.defaultUsers.forEach(function(userObj){
						var $elem = jQuery(settings.templates.userTemplate);
						$elem.attr('user-id', userObj.id)
							.find('span').text(userObj.name);
						sideBar.append($elem);
					});
				},
				getDay() {
					let d = new Date(),
					    n = d.getDay();
					return settings.globals.days[n];
				}
			},
			templates: {
				receiverTemplate: '<div  class="row message-body width-100"><div class="col-sm-12 margin-5"><div class="receiver"><div class="message-text"></div><span class="message-time pull-right"></span></div></div></div>',
				senderTemplate: '<div  class="row message-body width-100"><div class="col-sm-12 margin-5"><div class="sender"><div class="message-text"></div><span class="message-time pull-right"></span></div></div></div>',
				userTemplate:'<div class="row sideBar-body"><div class="col-sm-12 margin-auto"><span></span></div></div>'
			},
			globals:{
				days: ['Sun', 'Mon', 'Tue','Wed' ,'Thu', 'Fri', 'Sat'],
				defaultUsers: [{
					id: 1,
					name: 'Arvind',
				},
				{
					id: 2,
					name: 'Surya'
				},
				{
					id: 3,
					name: 'Tanisha'
				},
				{
					id: 4,
					name: 'Aayushi'
				},
				{
					id: 5,
					name: 'Rakesh'
				},
				{
					id: 6,
					name: 'Vivek'
				},
				{
					id:7,
					name:'Mohan'
				},
				{
					id: 8,
					name: 'Sandya'
				},
				{
					id: 9,
					name: 'Ashish'
				},
				{
					id: 10,
					name: 'Kavya'
				},
				{
					id: 11,
					name: 'Zac'
				}]
			}
		}
		
		var socket = new WebSocket('ws://echo.websocket.org');
		socket.onopen = function(evt) {
			console.log('Connection Successful');
			//init settings;
		}
		socket.onerror = function(error) {
			console.log('WebSocket Error: ' + error);
		};
		socket.onmessage = function(event) {
		    settings.utilities.receiveMessage(event.data);
		};
		socket.onclose = function(event) {
			console.log('Disconnected');
		};
		settings.init();
	}
	chatApp();
})()