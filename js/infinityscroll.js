/* global $, window */

;(function(factory) {

    var ScrollItem = function(item, i, h) {

        var height = h,
            y = i * height,
            data = item,
            index = i;
        return {
            y: function() {
                return y;
            },
            height: function() {
                return height;
            },
            getData: function() {
                return data;
            },
            index: function() {
                return index;
            }
        }
    };

    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    var InfinityScroll = function(options) {
        var $el = options.el,
            $innerScroll = null,
            sink = options.sink,
            template = options.template,
            loading = false,
            itemHeight = options.itemHeight,

            visibleIndex = 0,
            data = [],
            visibleCount = Math.ceil($el.height() / itemHeight),
            limit = 100, //to be sure we have enought data
            cb = options.positionUpdated,
            scrollTop = 0;



        (function() {
            var vendors = ['webkit', 'moz'];
            for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
                var vp = vendors[i];
                window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
                window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                || window[vp+'CancelRequestAnimationFrame']);
            }
            if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
                var lastTime = 0;
                window.requestAnimationFrame = function(callback) {
                    var now = new Date().getTime();
                    var nextTime = Math.max(lastTime + 16, now);
                    return setTimeout(function() { callback(lastTime = nextTime); },
                        nextTime - now);
                };
                window.cancelAnimationFrame = clearTimeout;
            }
        }());

        var checkPoint = 100;

        function scrollHandler() {
            scrollTop = $el.scrollTop();
            visibleIndex = Math.ceil(scrollTop / itemHeight);

            if( !loading && scrollTop + $el.height() + checkPoint > $el[0].scrollHeight ) {
                fetch()
            }
            window.requestAnimationFrame(render)

        }



        function fetch() {
            loading = true;
            sink.fetch(data.length, limit, function(items) {
                for (var i = 0; i < items.length; i++) {
                    data.push(new ScrollItem(items[i], data.length, itemHeight));
                }
                $innerScroll.height(data.length * itemHeight);
                loading = false;
            });
        }

        var cache = [];

        function prerender()
        {
            for (var i = 0; i < visibleCount * 3; i++) {
                var e = $('<div/>').addClass('row');
                cache.push(e[0]);
                $innerScroll.append(e);
            }
            render()
        }


        function render() {

            var v = visibleIndex - visibleCount <= 0 ? 0 : visibleIndex - visibleCount, item, ci = 0;

            for (var i = v; i < v + visibleCount * 2 + 10; i++) {
                if (i < data.length) {
                    item = data[i];
                    var cached_row = cache[ci],
                        top = item.y();

                        cached_row.style.top = top + 'px';
                        cached_row.innerHTML = template(item.getData());

                    ci++;
                }
            }


            if (cb) {
                //we always see 1 row less
                cb(visibleIndex, visibleCount + visibleIndex - 1, data.length);
            }
        }



        function init() {
            $innerScroll = $('<div class="innerscroll"></div>');
            $el.append($innerScroll);
            $el.on('scroll', scrollHandler);
            //load data for first time
            fetch();
            prerender();
        }

        init();

        return {
            position: function() {

            }
        };
    };
    factory.InfinityScroll = InfinityScroll;
})(window);