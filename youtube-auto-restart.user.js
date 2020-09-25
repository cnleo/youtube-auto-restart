// ==UserScript==
// @name        Youtube-Autoplay (youtube.com)

// @description	Automaticly re-/starting the video even if youtube paused them for Popup-Requests like login or consent cockie stuff. \\n Highliy recomend to setup filter (MyFilter) in your addblocker like: \\n  www.youtube.com##ytd-consent-bump-lightbox \\n and \\n www.youtube.com##ytd-popup-container

// @downloadURL	https://github.com/cnleo/youtube-autoplay/raw/experimental/youtube-autoplay.user.js
// @updateURL	https://github.com/cnleo/youtube-autoplay/raw/experimental/youtube-autoplay.user.js

// @author		cnleo

// @namespace	cnleo/userscripts

// @grant       none

// @match	https://youtube.com/watch*
// @match	http://youtube.com/watch*
// @match	https://www.youtube.com/watch*
// @match	http://www.youtube.com/watch*

// @version	2.0.0

// @run-at document-start
// ==/UserScript==



// NATIVE USERSCRIPT IN FIREFOX

// https://github.com/mdn/webextensions-examples/tree/master/user-script-register

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/userScripts
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/userScripts/Working_with_userScripts




// IMPORTANT: setup follow filter in uBlock Origin to "My filters" (without the slashes //):
//
// www.youtube.com##ytd-consent-bump-lightbox
// www.youtube.com##ytd-popup-container

// TIME OUT function needed for youtubes behaviour of revoking htmlvideosrc/source to a backgroundimage with play button; htmlvideo element stll exist but not playable
// Theoreticly we can use the timeout function without a referenced variable, but, meh. 
let timeoutID = function(){};


const observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {

		if (mutation.type === 'childList') {
			for(var i = 0, len = mutation.addedNodes.length; i < len; i++){

				let addedNode = mutation.addedNodes[i];
				if (addedNode.nodeName !== '#text') {

					// do something
					console.log(`AAA mutation added Nodes: ${addedNode.nodeName}`);
					
					if (addedNode.nodeName === 'DIV') {
						console.log('addedNode:',addedNode);
					}


					// YT-NEXT-CONTINUATION is the last elemnt on the first bunch of recommend and suggested videolist. It exist only once and it will be something after loaded some other stuff, so it is a good point to hook in and to recheck for changes. MAYBE it will be too late for the first video to autoplay.
					if (addedNode.nodeName === 'YT-NEXT-CONTINUATION') {

						let yt_video_element = document.querySelector('video');

						timeoutID = window.setTimeout(function(){
							console.log('TIMER FIRE!!!');
							if (yt_video_element.currentSrc === ''){
								console.log('CURRENT NO SRC');
								yt_play_button = document.querySelector('button.ytp-large-play-button[aria-label="Play"]');
								if(!!yt_play_button){
									console.log('PLY BUTTION YT FOUND!');
									yt_play_button.click();
								}
							}
						},2200); // in modern times, never ever use less than 2 seconds. Is good for browser inactivity, Is good for youtube, is good for everything ― IMHO;

						
						if (!!yt_video_element.getAttribute('setupp')) {
							console.log('YT ALREADY SETUPP');
							
							return;
						} else {
							yt_video_element.setAttribute('setupp','setupp');
							console.log('YT SETUPP');
						}



						let yt_video_paused_by_user = false;						
						yt_video_element.addEventListener('click', function (e) {
							e.preventDefault();
							console.log("YTAP: click"); 
							if (e.isTrusted === true) {
								yt_video_paused_by_user = true;
								console.log("YTAP: click is TRUE");
								
								if (this.paused === true) {
									console.log("YTAP: click TRUE PLAY");
									this.play();
									yt_video_paused_by_user = false;
								} else {
									console.log("YTAP: click TRUE PAUSE");
									//this.pause();
								}
							} else {
								console.log("YTAP: click is FALSE");
								yt_video_paused_by_user = false;
							}
							return false;
									
						}, false);

						yt_video_element.addEventListener('pause', function (e) {
							e.preventDefault();
							
							console.log("YTAP: pause");
							if (yt_video_paused_by_user === true) {
								
								console.log("YTAP: pause by USER");
								if (this.paused === true){
									console.log("YTAP: pause by USER PAUSED NOW PLAY");
									//this.play();
								} else {
									console.log("YTAP: pause by USER  PAUSED NOW PAUSED");
									this.pause();
									//yt_video_paused_by_user = false;
								}
								//yt_video_paused_by_user = false;
							} else {
								console.log('YT HAS STOPPED THE PLAY ;D');
								//this.preventDefault();
								/*if (this.paused === true){
									console.log("YTAP: pause by USER PAUSED NOW PLAY");
									this.play();
								} else {
									console.log("YTAP: pause by USER NOT PAUSED NOW PAUSED");
									this.pause();
								}
								console.log("YTAP: pause by SCRIPT NOW PLAY");
								this.play();
								*/

								this.play();
								return false;
							}
							return false;
							
						}, false);



					}
				}
			}
		}
	});
});

const observerConfig = {
	attributes: false,
	childList: true,
	characterData: false,
	subtree: true,
	attributeOldValue: false,
	characterDataOldValue: false//,
	//attributeFilter: ['class']
};

const toObserve = document.querySelector('body');
observer.observe(toObserve, observerConfig);