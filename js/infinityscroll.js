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

    var InfinityScroll = function(options) {
        var $el = options.el,
            $innerScroll = null,
            sink = options.sink,
            template = options.template,
            loading = false,
            itemHeight = options.itemHeight,
            limit = options.limit || 30,
            visibleIndex = 0,
            data = [],
            prefetchCount = 6,
            visibleCount = Math.ceil($el.height() / itemHeight),
            cb = options.positionUpdated;


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

        function scrollHandler() {
            var checkPoint = 100,
                scrollTop = $el.scrollTop();
                visibleIndex = Math.ceil(scrollTop / itemHeight);

            if( !loading && scrollTop + $el.height() + checkPoint > $el[0].scrollHeight ) {
                fetch()
            } else {
                render();
            }
        }

        function fetch() {
            loading = true;
            sink.fetch(data.length, limit, function(items) {
                for (var i = 0; i < items.length; i++) {
                    data.push(new ScrollItem(items[i], data.length, itemHeight));
                }

                $innerScroll.height(data.length * itemHeight);
                render();
                loading = false;
            });
        }

        var current = [];

        function render() {

            var old = current;
            current = [];

            var v = visibleIndex - prefetchCount <= 0 ? 0 : visibleIndex - prefetchCount,
                html = '', item;
            for (var i = v; i < v + visibleCount + prefetchCount * 2; i++) {
                if (i < data.length) {
                    item = data[i];
                    if ($innerScroll.find('div[data-idx="' + item.index() + '"]').length === 0) {
                        var top = item.y();
                        html += '<div class="row" data-idx="' + i + '" style="top: ' + top + 'px">' + template(item.getData()) + '</div>'
                    }

                    current.push(item);
                }

            }

            $innerScroll.append(html);
            var remove = [];
            for (i = 0; i < old.length; i++) {
                item = old[i];
                if (current.indexOf(item) == -1) {
                    remove.push($innerScroll.find('div[data-idx="' + item.index() + '"]'));
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
        }



        function init() {
            $innerScroll = $('<div class="innerscroll"></div>');
            $el.append($innerScroll);
            $el.on('scroll', throttle(scrollHandler, 100));
            //load data for first time
            fetch();
        }

        init();

        return {
            position: function() {

            }
        };
    };
    factory.InfinityScroll = InfinityScroll;
})(window);