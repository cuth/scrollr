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
4.	Instantiate the object on an element that has `overflow: scroll`
6.	Run `setBarSize` when you have initalized all of you scroll objects. This should be run after every initialize because changing the overflow property can change the size of the element.

### Example

```javascript
if(!("ontouchstart" in window)) {
	var sb = new Scrollr('body');
}
```