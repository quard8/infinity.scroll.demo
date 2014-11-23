;(function(factory) {
	factory.InfinityScrollTestSink = function() {

		var data = [];


		return {
			get: function(offset, limit) {
				
				return data.slice(offset, offset + limit);
			},
			fetch: function(limit, cb) {				
				for (var i=0; i<limit; i++) {
				    var id = data.length;
				    data.push({
				      id: id,
				      name: "Name " + id,
				      description: "Description " + id
				    });
				}
								
				cb.apply();
			},
			count: function() {
				console.log(data.length);
				return data.length;
			}
		}
	};
})(window);