rwdResize
==========

A responsive resize helper module; assign breakpoints and listen for breakpoint changes.

<p>Pass in a series of breakpoints, and the resize module will return what the current layout is based on those breakpoints.</p>
<p>Use RwdResize.subscribe method, passing in a callback function and on every window resize or focus, that callback will fire with the current layout, width of the wrapper element, and if a layoutChange has occurred.</p>  
<h2>Usage</h2>
    <script src="http://code.jquery.com/jquery-1.7.2.min.js"></script>
    <script src="pubSub.js"></script>
    <script src="rwdResize.js"></script>
    
    <script>
    // need to make sure the dom is ready before we initially measure 
    // the width of the body or element passed into RwdResize.initialize
    $(document).ready(function(){
    
		// init RwdResize passing in an object of breakpoint name/value pairs, 
		// and an optional element RwdResize will use to check the outerWidth of to determine
		// current layout being used and if a layoutChange has occurred.
		// if none is passed in, RwdResize will use the body element
		var layoutData = RwdResize.initialize({
			small: 640,
			medium: 1024,
			large: 1140
		});

		// this callback will fire on window resize of focus events 
		var rwdCallback = function(data) {
			var currLayout = data.layout;
			var currLayoutWidth = data.width; 
			var layoutJustChanged = data.layoutChanged
			// do stuff based on this data
		}
		
		// subscribe rwdCallback to a window resize/focus events
		// could also pass in a 2nd param to reference an object instance
		var rwdResize_uid = RwdResize.subscribe(rwdCallback);
		
		// unsubscribe rwdCallback from window resize/focus events
		RwdResize.unsubscribe(rwdResize_uid);
		
	});
	</script>
