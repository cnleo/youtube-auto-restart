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

// @version	3.0.0

// @run-at document-start
// ==/UserScript==

(function () {



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
					// console.log(`AAA mutation added Nodes: ${addedNode.nodeName}`);
					
					if (addedNode.nodeName === 'DIV') {
						// console.log('addedNode:',addedNode);
					}


					// YT-NEXT-CONTINUATION is the last elemnt on the first bunch of recommend and suggested videolist. It exist only once and it will be something after loaded some other stuff, so it is a good point to hook in and to recheck for changes. MAYBE it will be too late for the first video to autoplay.
					if (addedNode.nodeName === 'YT-NEXT-CONTINUATION') {

						let yt_video_element = document.querySelector('video');


						
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

						yt_video_element.addEventListener('ended', (event) => {
						  console.log('Video stopped either because 1) it was over, or 2) no further data is available.');
						});

						yt_video_element.addEventListener('emptied', (event) => {

							console.log('Uh oh. The media is empty. Did you call load()?');
							timeoutID = window.setTimeout(function(){
								console.log('TIMER FIRE!!!');
								if (yt_video_element.currentSrc === '' || yt_video_element.buffered.length === 0) {
									console.log('CURRENT NO SRC');
									yt_play_button = document.querySelector('button.ytp-large-play-button[aria-label="Play"]');
									if(!!yt_play_button){
										console.log('PLY BUTTION YT FOUND!');
										//yt_video_element.play();
										yt_play_button.click();
									}
								}
							
							},2200); // in modern times, never ever use less than 2 seconds. Is good for browser inactivity, Is good for youtube, is good for everything ― IMHO;

						});


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

document.addEventListener("DOMContentLoaded", function () {

	let yt_video_paused_by_user = false;
	let yt_video_paused_currentTime = 0;
	let yt_video_paused_duration = 0;


	let yt_video_element = document.querySelector('video');

		
	//yt_video_element.load();

		//yt_video_paused_by_user = false;					
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

		yt_video_paused_currentTime = this.currentTime;
		yt_video_paused_duration = this.duration;
		
		console.log('currentTime', this.currentTime);
		console.log('duration', this.duration);

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
		}
		return false;
		
	}, false);

	yt_video_element.addEventListener('ended', (event) => {
		event.preventDefault();
		console.log('Video stopped either because 1) it was over, or 2) no further data is available.');
		console.log('duration', this.duration);
		if (yt_video_paused_currentTime === yt_video_paused_duration) {
			let yt_autoplay_toggle_active = document.querySelector('#items #head #autoplay ~ paper-toggle-button[active]');
			if (!!yt_autoplay_toggle_active){
				console.log('autoplay button active');
				let yt_next_video = document.querySelector('#contents > [lockup] #dismissable a#thumbnail[href]');
				if (!!yt_next_video) {
					yt_next_video.click();
				}

			}
		}

		return false;
	});

	//<paper-toggle-button id="toggle" noink="" class="style-scope ytd-compact-autoplay-renderer" role="button" aria-pressed="true" tabindex="0" toggles="" aria-disabled="false" checked="" active="" aria-label="Autoplay" style="touch-action: pan-y;"><!--css-build:shady--><div class="toggle-container style-scope paper-toggle-button"><div id="toggleBar" class="toggle-bar style-scope paper-toggle-button"></div><div id="toggleButton" class="toggle-button style-scope paper-toggle-button"></div></div><div class="toggle-label style-scope paper-toggle-button">
 //     </div></paper-toggle-button>

	yt_video_element.addEventListener('emptied', (event) => {
		event.preventDefault();
		console.log('Uh oh. The media is empty. Did you call load()?');
		timeoutID = window.setTimeout(function(){
			console.log('TIMER FIRE!!!');
			if (yt_video_element.currentSrc === '' || yt_video_element.buffered.length === 0) {
				console.log('CURRENT NO SRC');
				yt_play_button = document.querySelector('button.ytp-large-play-button[aria-label="Play"]');
				if(!!yt_play_button){
					console.log('PLY BUTTION YT FOUND!');
					//yt_video_element.play();
					yt_play_button.click();
				}
			}
			
		},10); // in modern times, never ever use less than 2 seconds. Is good for browser inactivity, Is good for youtube, is good for everything ― IMHO;
		return false;
	});



	//const toObserve = document.querySelector('body');
	//observer.observe(toObserve, observerConfig);

});





})();