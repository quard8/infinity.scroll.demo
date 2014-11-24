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
            prefetchCount = 10,
            visibleCount = Math.ceil($el.height() / itemHeight),
            limit = visibleCount * 6, //to be sure we have enought data
            cb = options.positionUpdated,
            scrollTop = 0;


        var throttle = function(func, wait, options) {
            var context, args, result;
            var timeout = null;
            var previous = 0;
            options || (options = {});
            var later = function() {
              previous = new Date;
              timeout = null;
              result = func.apply(context, args);
            };
            return function() {
              var now = new Date;
              if (!previous && options.leading === false) previous = now;
              var remaining = wait - (now - previous);
              context = this;
              args = arguments;
              if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
              } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
              }
              return result;
            };
        };

        var checkPoint = 100;

        function scrollHandler() {
            scrollTop = $el.scrollTop();
            visibleIndex = Math.ceil(scrollTop / itemHeight);

            if( !loading && scrollTop + $el.height() + checkPoint > $el[0].scrollHeight ) {
                fetch()
            }
            render();
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

        var current = [];

        function actual_render() {
            //window.requestAnimFrame(function() {

              //  actual_render();
            //})
        }
        var lastScrollTop = 1;
        function render() {
            //dont render if nothing happens

            if (Math.abs(scrollTop - lastScrollTop) === 0) return;
            var old = current;
            current = [];

            var v = visibleIndex - prefetchCount <= 0 ? 0 : visibleIndex - prefetchCount,
                html = '', item;
            for (var i = v; i < v + visibleCount + prefetchCount * 1.5; i++) {
                if (i < data.length) {
                    item = data[i];
                    if ($innerScroll.find('div.idx' + item.index()).length === 0) {
                        var top = item.y();
                        html += '<div class="row idx' + i + '" style="top: ' + top + 'px">' + template(item.getData()) + '</div>'
                    }

                    current.push(item);
                }

            }

            $innerScroll[0].innerHTML += html;
                 var remove = [];
                for (i = 0; i < old.length; i++) {
                    item = old[i];
                    if (current.indexOf(item) == -1) {
                        remove.push($innerScroll.find('div.idx' + item.index()));
                    }
                }

                if (remove.length) {
                    var $stuff = $();
                    for (i = 0; i < remove.length; i++) {
                        $stuff = $stuff.add(remove[i]);
                    }
                    $stuff.remove();
                }


                if (cb) {
                    //we always see 1 row less
                    cb(visibleIndex, visibleCount + visibleIndex - 1, data.length);
                }

            lastScrollTop = scrollTop;
        }



        function init() {
            $innerScroll = $('<div class="innerscroll"></div>');
            $el.append($innerScroll);
            $el.on('scroll', throttle(scrollHandler, 100));
            //load data for first time
            fetch();
            render()
        }

        init();

        return {
            position: function() {

            }
        };
    };
    factory.InfinityScroll = InfinityScroll;
})(window);