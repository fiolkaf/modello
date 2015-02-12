var Observer = {
    mixin: function(target) {
        target.listenTo = function(obj, topic, callback) {
            if (typeof obj === 'string') {
                callback = topic;
                topic = obj;
                obj = this;
            }
            var unsubscribe = obj.on(topic, callback);
            target.addDisposer(unsubscribe);
            return unsubscribe;
        };
    }
};

module.exports = Observer;
