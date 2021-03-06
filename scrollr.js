/*    
    Scrollr
    This is a simple javascript scroll bar built for modern browsers.
    
    https://github.com/cuth/scrollr
    
    Version: 2.0.2
    
    Requires:
        jQuery
        dragger - https://github.com/cuth/dragger
        http://stackoverflow.com/questions/8189840/get-mouse-wheel-events-in-jquery
*/
/*global Dragger, addWheelListener */

;(function (exports, $) {
    'use strict';
    var defaults = {
            debounceTime: 300,
            animationDuration: 400,
            animationEasing: 'swing',
            wrapClass: 'scrollyWrap',
            xBarClass: 'scrollyBarX',
            yBarClass: 'scrollyBarY'
        },
        $window = $(window),
        setFrameScrollY = function (barTop) {
            var percentage = barTop / (this.frameHeight - this.barYHeight);
            this.$wrap[0].scrollTop = percentage * (this.scrollHeight - this.frameHeight);
            this.$barY.css({ top: barTop });
        },
        setFrameScrollX = function (barLeft) {
            var percentage = barLeft / (this.frameWidth - this.barXWidth);
            this.$wrap[0].scrollLeft = percentage * (this.scrollWidth - this.frameWidth);
            this.$barX.css({ left: barLeft });
        },
        setFrameWheelY = function (delta) {
            this.$wrap[0].scrollTop = Math.min(Math.max(0, this.$wrap[0].scrollTop + delta), (this.scrollHeight - this.frameHeight));
        },
        setFrameWheelX = function (delta) {
            this.$wrap[0].scrollLeft = Math.min(Math.max(0, this.$wrap[0].scrollLeft + delta), (this.scrollWidth - this.frameWidth));
        },
        setBarYPos = function () {
            var percentage = this.$wrap[0].scrollTop / (this.scrollHeight - this.frameHeight),
                top = percentage * (this.frameHeight - this.barYHeight);
            this.$barY.css({ 'top': top });
            this.dragY.setPosition({ y: top });
        },
        setBarXPos = function () {
            var percentage = this.$wrap[0].scrollLeft / (this.scrollWidth - this.frameWidth),
                left = percentage * (this.frameWidth - this.barXWidth);
            this.$barX.css({ 'left': left });
            this.dragX.setPosition({ x: left });
        },
        setBarSize = function () {
            this.inUse = false;
            this.$wrap.css({ height: 'auto', width: 'auto' });
            if (this.$frame[0].tagName === 'BODY') {
                this.frameHeight = $window.height();
                this.frameWidth = $window.width();
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
                this.dragY.setBounds({
                    minY: 0,
                    maxY: this.frameHeight - this.barYHeight
                });
            } else {
                this.$barY.css({ display: 'none' });
            }
            // adjust horizontal scroll if necessary
            if (this.scrollWidth > this.frameWidth + 2) {
                this.inUse = true;
                this.$wrap.css({ width: this.frameWidth });
                this.barXWidth = Math.max(10, (this.frameWidth / this.scrollWidth) * this.frameWidth);
                this.$barX.css({ width: this.barXWidth, display: 'block' });
                this.dragX.setBounds({
                    minX: 0,
                    maxX: this.frameWidth - this.barXWidth
                });
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

            // building the wrapper div first doesn't seem to work
            //this.$wrap = $('<div/>', {
            //    'class': this.opts.wrapClass
            //});
            //this.$frame.wrapInner(this.$wrap);

            this.$frame.wrapInner('<div class="' + this.opts.wrapClass + '"/>');
            this.$wrap = this.$frame.children('div.scrollyWrap');

            this.$barY = $('<div/>', {
                'class': this.opts.yBarClass
            });
            this.$barX = $('<div/>', {
                'class': this.opts.xBarClass
            });
            this.$frame.append(this.$barY, this.$barX);
        },
        bindEvents = function () {
            var self = this;
            $window
                .on('resize', debounce(function () {
                    resize.call(self);
                }, this.opts.debounceTime))
                .on('load', function () {
                    resize.call(self);
                });
            this.dragY = new Dragger(this.$barY, {
                'drag': function (pos) {
                    setFrameScrollY.call(self, pos.y);
                }
            });
            this.dragX = new Dragger(this.$barX, {
                'drag': function (pos) {
                    setFrameScrollX.call(self, pos.x);
                }
            });
            this.$frame.on('mousewheel', function (e) {
                if (!self.inUse) return;
                e.stopPropagation();
                e.preventDefault();
                if (e.deltaY && e.deltaY !== 0) {
                    setFrameWheelY.call(self, e.deltaY * -60);
                    setBarYPos.call(self);
                }
                if (e.deltaX && e.deltaX !== 0) {
                    setFrameWheelX.call(self, e.deltaX * -60);
                    setBarXPos.call(self);
                }
            });
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
    exports.Scrollr = function (frame, options) {
        this.result = init.call(this, frame, options);
    };
    exports.Scrollr.prototype.resize = resize;
    exports.Scrollr.prototype.setBarSize = setBarSize;
    exports.Scrollr.prototype.setBarYPos = setBarYPos;
    exports.Scrollr.prototype.setBarXPos = setBarXPos;
    exports.Scrollr.prototype.animateScrollY = animateScrollY;
    exports.Scrollr.prototype.animateScrollX = animateScrollX;
}(this, jQuery));