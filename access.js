module.exports.saveMessage = function (db,message,  callback) {
    db.collection('message').save({
        message: message
    }, callback);
 console.log('saving',message);
};

module.exports.findMessage = function (db, message, callback) {
    db.collection('message').findOne({
        message: message
    }, function (err, doc) {
        if (err || !doc) callback(null);
        else callback(doc.message);
    });
};


module.exports.findMessageByCachedTitle = function (db, redis, title, callback) {
    redis.get(title, function (err, reply) {
        if (err) callback(null);
        else if (reply)
        callback(JSON.parse(reply));
        else {
            db.collection('message').findOne({
                message: title
            }, function (err, doc) {
                if (err || !doc) callback(null);
                else {
                    redis.set(message, JSON.stringify(doc), function () {
                        callback(doc);
                    });
                }
            });
        }
    });
};