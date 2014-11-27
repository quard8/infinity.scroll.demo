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

        this.$el = options.el;
        this.template = options.template;
        this.sink = options.sink;

        this.itemHeight = options.itemHeight;
        this.itemClass = options.itemClass;
        this.cb = options.positionUpdated;



        this.init.apply(this);
    };

    InfinityScroll.prototype = {


        scrollHandler: function() {
            this.scrollTop = this.$el.scrollTop();
            this.visibleIndex = Math.ceil(this.scrollTop / this.itemHeight);

            if( !this.loading && this.scrollTop + this.$el.height() + this.checkPoint > this.$el[0].scrollHeight ) {
                this.fetch()
            }
            window.requestAnimationFrame($.proxy(this.render, this))

        },


        fetch: function() {
            this.loading = true;
            var ctx = this;
            this.sink.fetch(this.data.length, this.limit, function(items) {
                for (var i = 0; i < items.length; i++) {
                    ctx.data.push(new ScrollItem(items[i], ctx.data.length, ctx.itemHeight));
                }
                ctx.$innerScroll.height(ctx.data.length * ctx.itemHeight);
                ctx.loading = false;
                ctx.render()
            });
        },



        prerender: function()
        {
            for (var i = 0; i <  this.visibleCount * 3; i++) {
                var e = $('<div/>').addClass(this.itemClass);
                this.cache.push(e[0]);
                this.$innerScroll.append(e);
            }

        },


        render: function() {

            var v = this.visibleIndex - this.visibleCount <= 0 ? 0 : this.visibleIndex - this.visibleCount, item, ci = 0;

            for (var i = v; i < v + this.visibleCount * 2 + 10; i++) {
                if (i < this.data.length) {
                    item = this.data[i];
                    var cached_row = this.cache[ci],
                        top = item.y();
                    cached_row.style.top = top + 'px';
                    cached_row.innerHTML = this.template(item.getData());



                    ci++;
                }
            }


            if (this.cb) {
                //we always see 1 row less
                this.cb(this.visibleIndex, this.visibleCount + this.visibleIndex - 1, this.data.length);
            }
        },


        init: function() {

            this.$innerScroll = $('<div class="innerscroll"></div>');


            this.loading = false;

            this.visibleIndex = 0;
            this.data = [];
            this.visibleCount = Math.ceil(this.$el.height() / this.itemHeight);
            this.limit = 100; //to be sure we have enought data

            this.scrollTop = 0;
            this.cache = [];

            this.checkPoint = 100;
            this.$el.append(this.$innerScroll);
            this.$el.on('scroll', $.proxy(this.scrollHandler, this));
            //load data for first time
            this.prerender();
            this.fetch();


        }
    };
    factory.InfinityScroll = InfinityScroll;
})(window);