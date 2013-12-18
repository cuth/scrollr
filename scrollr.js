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

(function (w, $) {
    "use strict";
    var defaults = {
            debounceTime: 300,
            animationDuration: 400,
            animationEasing: 'swing'
        },
        setFrameScrollY = function (barTop) {
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
                this.frameHeight = $(w).height();
                this.frameWidth = $(w).width();
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
        debounce = function (func, wait, immediate) {
            var timeout, args, context, timestamp, result;
            return function () {
                context = this;
                args = arguments;
                timestamp = new Date();
                var later = function () {
                    var last = (new Date()) - timestamp;
                    if (last < wait) {
                        timeout = setTimeout(later, wait - last);
                    } else {
                        timeout = null;
                        if (!immediate) result = func.apply(context, args);
                    }
                };
                var callNow = immediate && !timeout;
                if (!timeout) {
                    timeout = setTimeout(later, wait);
                }
                if (callNow) result = func.apply(context, args);
                return result;
            };
        },
        resize = function () {
            setBarSize.call(this);
            setBarYPos.call(this);
            setBarXPos.call(this);
        },
        animateScrollY = function (scrollTop) {
            var self = this,
                properties = {
                    scrollTop: scrollTop
                },
                options = {
                    duration: this.opts.animationDuration,
                    easing: this.opts.animationEasing,
                    queue: false,
                    progress: function () {
                        setBarYPos.call(self);
                    }
                };
            this.$wrap.stop(true).animate(properties, options);
        },
        animateScrollX = function (scrollLeft) {
            var self = this,
                properties = {
                    scrollLeft: scrollLeft
                },
                options = {
                    duration: this.opts.animationDuration,
                    easing: this.opts.animationEasing,
                    queue: false,
                    progress: function () {
                        setBarXPos.call(self);
                    }
                };
            this.$wrap.stop(true).animate(properties, options);
        },
        adjustMarkup = function () {
            this.$frame.css({ overflow: 'hidden' });
            this.$frame.wrapInner('<div class="scrollyWrap"/>');
            this.$wrap = this.$frame.find('div.scrollyWrap');
            this.$frame.append('<div class="scrollyBarY"></div><div class="scrollyBarX"></div>');
            this.$barY = this.$frame.find('div.scrollyBarY');
            this.$barX = this.$frame.find('div.scrollyBarX');
        },
        bindEvents = function () {
            var self = this;
            $(w).on('resize', debounce(function () {
                resize.call(self);
            }, this.opts.debounceTime));
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
            if ($.event.special.mousewheel) {
                this.$frame.bind('mousewheel', function (event, delta, deltaX, deltaY) {
                    if (self.inUse) {
                        event.stopPropagation();
                        if (deltaY && deltaY !== 0) {
                            setFrameWheelY.call(self, deltaY);
                            setBarYPos.call(self);
                        }
                        if (deltaX && deltaX !== 0) {
                            setFrameWheelX.call(self, deltaX);
                            setBarXPos.call(self);
                        }
                    }
                });
            }
        },
        init = function (frame, options) {
            this.$frame = $(frame);
            this.frameHeight = 0;
            this.frameWidth = 0;
            this.scrollHeight = 0;
            this.scrollWidth = 0;
            this.barYHeight = 0;
            this.barXWidth = 0;
            this.inUse = false;
            this.opts = $.extend({}, defaults, options);
            adjustMarkup.call(this);
            bindEvents.call(this);
            setBarSize.call(this);
            return true;
        };
    w.Scrollr = function (frame, options) {
        this.result = init.call(this, frame, options);
    };
    w.Scrollr.prototype.resize = resize;
    w.Scrollr.prototype.setBarSize = setBarSize;
    w.Scrollr.prototype.setBarYPos = setBarYPos;
    w.Scrollr.prototype.setBarXPos = setBarXPos;
    w.Scrollr.prototype.animateScrollY = animateScrollY;
    w.Scrollr.prototype.animateScrollX = animateScrollX;
}(window, jQuery));