;(function(factory) {
    factory.InfinityScrollTestSink = function() {

        return {
            fetch: function(offset, limit, cb) {
                var data = [];
                for (var i=0; i<limit; i++) {
                    var id = i + offset;
                    data.push({
                      id: id,
                      name: "Name " + id,
                      description: "Description " + id
                    });
                }

                cb(data);
            }
        }
    };
})(window);