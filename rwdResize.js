/**
 * @fileOverview Responsive Framework Resize Module
 * @author <a href="mailto:brianfegan@gmail.com">Brian Fegan</a>
 * @version 1.0
 */

// we only want to use rAF in this module if its native and not the setTimeout fallback
(function() {
    if (!window.requestAnimationFrame) {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
			window.cancelAnimationFrame = 
			  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
		}
	}
}());

/**
 * @name RwdResize
 * @namespace A module that provides extra functionality on top of resize events for responsive applications.
 * @description A module that provides extra functionality on top of resize events for responsive applications.
 * @requires <a href="https://github.com/akqany/AKQA_NY_Internal/tree/master/js-utils/pubsub">PubSub.js</a>
 */
window.RwdResize = (function(self, PubSub, window, undefined){

	/**
	 * @name RwdResize-_getLayoutByWidth
	 * @function
	 * @description Determine page layout based on self.parent_width.
	 * @returns {string} The current layout of the site
	 */
	var _getLayoutByWidth = function() {
		for (var i=0; i<self.breakpoints.length; i++) {
			if (self.win_width <= self.breakpoints[i]) {
				return self.breakpointsByPx[self.breakpoints[i]];
			}
		}
		return self.breakpointsByPx[self.breakpoints[self.breakpoints.length-1]];
	},
	
	/**
	 * @name RwdResize-_doResizeUpdate
	 * @function
	 * @description Use this to distribute the resize event as needed. Using the width of the wrapper element, 
	 * check and see if the layout has changed, and pass on the current layout, the wrapper width, and whether 
	 * a layoutChange has occurred to any resize subscribers.
	 */
	_doResizeUpdate = function() {
		
		self.ticking = false;
		
		// get the wrapper width and the old layout
		var oLayout = self.layout,
			layoutChange;
		
		// set the layout based on new width
		self.layout = _getLayoutByWidth();
		layoutChange = (oLayout !== self.layout) ? true : false;
		
		// pass those on to any subclass resize methods which subscribed to this event
		PubSub.publish('rwdResize', {layout:self.layout, width:self.win_width, layoutChange:layoutChange});
		
	},
	
	/**
	 * @name RwdResize-_requestResizeTick
	 * @function
	 * @description Used to monitor whether a user is resizing and if we should use a rAF callback.
	 */
	_requestResizeTick = function() {
		if (!self.ticking) {
			window.requestAnimationFrame(_doResizeUpdate);
		}
		self.ticking = true;
	},

	/**
	 * @name RwdResize-_resize
	 * @function
	 * @description When a user has resized, if the browser supports native requestFrameAnimations,
	 * use them to notify resize subscribers. If not, notify subscribers immediately via _doResizeUpdate. 
	 * We also need to make sure the window width has actually changed as IE8 <i>sometimes</i> fires resize event when 
	 * any asset on the page is resized.
	 */
	_resize = function() {
		
		var winWidth = _getWinWidth(),
			winHeight = _getWinHeight(); 
		
		if (winWidth !== self.win_width || winHeight !== self.win_height) {
			self.win_width = winWidth;
			self.win_height = winHeight;
			if (window.requestAnimationFrame) {
				_requestResizeTick();
			} else {
				_doResizeUpdate();
			}
		}
		
	},
	
	/**
	 * @name RwdResize-_unsubscribe
	 * @exports RwdResize-_unsubscribe as RwdResize.unsubscribe
	 * @function
	 * @description Remove a subscriber from the rwdResize list.
	 * @param {number} uid
	 */
	_unsubscribe = function(uid) {
		if (typeof uid === 'number') {
			PubSub.unsubscribe('rwdResize', uid);
		}
	},
	
	/**
	 * @name RwdResize-_subscribe
	 * @exports RwdResize-_subscribe as RwdResize.subscribe
	 * @function
	 * @description Used to proxy the subscribe method of the PubSub module.
	 * @param {function} fn The callback for a resize event.
	 * @param {object} [instance] Optional instance to be used in callback.
	 */
	_subscribe = function(fn, instance) {
		if (typeof fn === 'function') {
			return PubSub.subscribe('rwdResize', fn, instance);
		}
	},
	
	/**
	 * @name RwdResize-_getWinWidth
	 * @function
	 * @description Get the width of the viewport.
	 */
	_getWinWidth = function() {
		return ((window.innerWidth !== undefined) ? window.innerWidth : document.documentElement.clientWidth);
	},
	
	/**
	 * @name RwdResize-_getWinHeight
	 * @function
	 * @description Get the height of the viewport.
	 */
	_getWinHeight = function() {
		return ((window.innerHeight !== undefined) ? window.innerHeight : document.documentElement.clientHeight);
	},
	
	/**
	 * @name RwdResize-_isEmptyObject
	 * @function
	 * @description Determines if an object is empty.
	 * @param {object} obj
	 * @returns {boolean}
	 */
	_isEmptyObject = function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},
	
	/**
	 * @name RwdResize-_initialize
	 * @exports RwdResize-_initialize as RwdResize.initialize
	 * @function
	 * @description The initialize method that kicks off all Resize functionality
	 */
	_initialize = function(breakpoints) {
	
		// only proceed if we have PubSub, breakpoints, and we only init once
		if (!PubSub || !breakpoints || _isEmptyObject(breakpoints) || self.initialized) {
			return;
		}
			
		// loop through breakpoints and add them to a new array we can sort
		// create a new object that maps the px value to a key
		self.breakpointsByPx = {};
		var sorted = [], i, breakpoint, key, px;
		for (var key in breakpoints) {
			if (breakpoints.hasOwnProperty(key)) {
				px = breakpoints[key];
				sorted.push(px);
				self.breakpointsByPx[px] = key;
			}
		}
				
		// sort the breakpoints so we can check against them in order later
		self.breakpoints = sorted.sort(function(a, b) {
			return a - b;
		});
		
		// save a window reference 
		// lastly set up the resize listener
		self.win_width = _getWinWidth();
		self.win_height = _getWinHeight();
		if (window.attachEvent) {
			window.attachEvent('onresize', _resize);
			window.attachEvent('onfocus', _resize);
		} else if (window.addEventListener) {
			window.addEventListener('resize', _resize, true);
			window.addEventListener('focus', _resize, true);
		}
		
		// get the layout on page load
		self.layout = _getLayoutByWidth();
		
		self.initialized = true;
		
		// return the width and layout on page load
		return {layout:self.layout, width:self.win_width};
	
	};
	
	// Resize public variables & methods
	return {
		initialize: _initialize,
		subscribe: _subscribe,
		unsubscribe: _unsubscribe
	};
	
}({}, PubSub, window, undefined));