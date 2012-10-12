scrollr
=======

This is a simple javascript scroll bar built for modern browsers.

### Requires
*	jQuery
*	jQueryUI - Draggable Component
*	jquery.mousewheel.js - [https://github.com/brandonaaron/jquery-mousewheel]

### Use
1.	Include the required files
2.	Include scrollr.js and scrollr.css
3.	Run this code for only non touch devices. Use whatever method you want to detect a touch device.
4.	Instantiate the object and run "init".

### Example
	if(!("ontouchstart" in window)) {
		var sb = new Scrollr('body');
		sb.init();
	}