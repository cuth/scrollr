/*	
	Scrollr - by Jon Cuthbert
	This is a simple javascript scroll bar built for modern browsers.
	
	https://github.com/cuth/scrollr
	
	Version: 1.0
	
	Requires:
		jQuery
		jQueryUI - Draggable Component
		jquery.mousewheel.js - https://github.com/brandonaaron/jquery-mousewheel
*/

var Scrollr = function (frame) {
	'use strict';
	this.$frame = $(frame);
	this.$wrap = null;
	this.$barY = null;
	this.$barX = null;
	this.frameHeight = 0;
	this.frameWidth = 0;
	this.scrollHeight = 0;
	this.scrollWidth = 0;
	this.barYHeight = 0;
	this.barXWidth = 0;
	this.inUse = false;
};
Scrollr.prototype = (function () {
	'use strict';
	var setFrameScrollY = function (barTop) {
			var percentage = barTop / (this.frameHeight - this.barYHeight);
			this.$wrap[0].scrollTop = percentage * (this.scrollHeight - this.frameHeight);
		},
		setFrameScrollX = function (barLeft) {
			var percentage = barLeft / (this.frameWidth - this.barXWidth);
			this.$wrap[0].scrollLeft = percentage * (this.scrollWidth - this.frameWidth);
		},
		setFrameWheelY = function (delta) {
			this.$wrap[0].scrollTop = Math.min(Math.max(0, this.$wrap[0].scrollTop + delta * -100), (this.scrollHeight - this.frameHeight));
		},
		setFrameWheelX = function (delta) {
			this.$wrap[0].scrollLeft = Math.min(Math.max(0, this.$wrap[0].scrollLeft + delta * -100), (this.scrollWidth - this.frameWidth));
		},
		setBarYPos = function () {
			var percentage = this.$wrap[0].scrollTop / (this.scrollHeight - this.frameHeight);
			this.$barY.css({ top: percentage * (this.frameHeight - this.barYHeight) });
		},
		setBarXPos = function () {
			var percentage = this.$wrap[0].scrollLeft / (this.scrollWidth - this.frameWidth);
			this.$barX.css({ left: percentage * (this.frameWidth - this.barXWidth) });
		},
		setBarSize = function () {
			this.inUse = false;
			this.$wrap.css({ height: 'auto', width: 'auto' });
			if (this.$frame[0].tagName === 'BODY') {
				this.frameHeight = $(window).height();
				this.frameWidth = $(window).width();
			} else {
				this.frameHeight = this.$frame[0].clientHeight;
				this.frameWidth = this.$frame[0].clientWidth;
			}
			this.scrollHeight = this.$wrap[0].scrollHeight;
			this.scrollWidth = this.$wrap[0].scrollWidth;

			// adjust vertical scroll if necessary
			if (this.scrollHeight > this.frameHeight + 2) {
				this.inUse = true;
				this.$wrap.css({ height: this.frameHeight });
				this.barYHeight = Math.max(10, (this.frameHeight / this.scrollHeight) * this.frameHeight);
				this.$barY.css({ height: this.barYHeight, display: 'block' });
			} else {
				this.$barY.css({ display: 'none' });
			}

			// adjust horizontal scroll if necessary
			if (this.scrollWidth > this.frameWidth + 2) {
				this.inUse = true;
				this.$wrap.css({ width: this.frameWidth });
				this.barXWidth = Math.max(10, (this.frameWidth / this.scrollWidth) * this.frameWidth);
				this.$barX.css({ width: this.barXWidth, display: 'block' });
			} else {
				this.$barX.css({ display: 'none' });
			}
		},
		init = function () {
			var self = this;

			// adjust the markup
			this.$frame.css({ overflow: 'hidden' });
			this.$frame.wrapInner('<div class="scrollyWrap"/>');
			this.$wrap = this.$frame.find('div.scrollyWrap');
			this.$frame.append('<div class="scrollyBarY"></div><div class="scrollyBarX"></div>');
			this.$barY = this.$frame.find('div.scrollyBarY');
			this.$barX = this.$frame.find('div.scrollyBarX');

			// initialize the scrollbars
			setBarSize.call(this);

			// attach events
			$(window).resize(function () {
				setBarSize.call(self);
				setBarYPos.call(self);
				setBarXPos.call(self);
			});
			this.$barY.draggable({
				axis: 'y',
				containment: self.$frame,
				cursor: 'default',
				drag: function (e, ui) {
					setFrameScrollY.call(self, ui.position.top);
				}
			});
			this.$barX.draggable({
				axis: 'x',
				containment: self.$frame,
				cursor: 'default',
				drag: function (e, ui) {
					setFrameScrollX.call(self, ui.position.left);
				}
			});
			this.$frame.bind('mousewheel', function (event, delta, deltaX, deltaY) {
				if (self.inUse) {
					event.stopPropagation();
					if (deltaY !== 0) {
						setFrameWheelY.call(self, deltaY);
						setBarYPos.call(self);
					}
					if (deltaX !== 0) {
						setFrameWheelX.call(self, deltaX);
						setBarXPos.call(self);
					}
				}
			});
		};

	return {
		init: init,
		setBarSize: setBarSize
	};
}());