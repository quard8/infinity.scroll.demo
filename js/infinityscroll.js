;(function(factory) {
	
	var InfinityScroll = function(options) {
		var $el = options.el,
			$innerScroll = null,
			sink = options.sink,
			itemClass = options.itemClass,
			template = options.template,
			loading = false,
			data = [],
			proximityItemHeight = 0,
			itemHeight = options.itemHeight,
			visibleIndex = 0,
			loadedIndex = 0,			
			visibleCount = Math.ceil($el.height() / itemHeight) + 1;

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
	        	fetch(40);
	        } else {
	        	loadData();
	        }
	    }

	    function fetch(limit) {
	    	loading = true;
	    	sink.fetch(limit, function() {
	    		$innerScroll.height(sink.count() * itemHeight);
	    		loadData();
	    		loading = false;
	    	});
	    }	

	    function loadData() {
	    	data = sink.get(visibleIndex, visibleCount);
	    	render();
	    }

	    function render() {

	    	




	    	$innerScroll.html('');
	    	var offsetTop = $el[0].offsetTop;
    		for (var i = 0; i < data.length; i++) {
    			var top = (visibleIndex + i - 1) * itemHeight; 
    			var item = $(template(data[i])).css({
    				top: top + 'px'
    			});
    			$innerScroll.append(item);
    			
    		};	
    				    		

	    }
	    
		function init() {
			$innerScroll = $('<div class="innerscroll"></div>');

			$el.append($innerScroll);
			$el.on('scroll', throttle(scrollHandler, 200));
			//load data for first time
			fetch(40);
		}

		init();

		return {
			position: function() {

			}
		};
	};
	factory.InfinityScroll = InfinityScroll;
})(window);