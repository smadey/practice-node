var db = require('../config').db,
    msg = require('../common/message');

exports.get = function(req, res){
    db.collection('todos').find({ creator: req.session.user.username }, { sort: { createTime: 1 } }).toArray(function(err, todos) {
        var result;

        if(err) {
            result = { _error: msg.error.DB_ERROR };
        }
        else {
            result = todos;
        }

        res.json(result);
    });
};

exports.post = function(req, res){
    var todo = {
        text: req.body.text,
        done: req.body.done,
        creator: req.session.user.username,
        updateTime: Date.now()
    };

    todo.createTime = todo.updateTime;

    db.collection('todos').insert(todo, function(err, todos) {
        var result;

        if(err) {
            result = { _error: msg.error.DB_ERROR };
        }
        else if(todos.length == 0) {
            result = { _warning: msg.warning.TODO_INSERT_FAILED };
        }
        else {
            result = todos[0];
        }

        res.json(result);
    });
};

exports.put = function(req, res){
    var _id = db.toObjectID(req.body._id),
        todo = {
            text: req.body.text,
            done: req.body.done,
            updateTime: Date.now()
        };

    db.collection('todos').findAndModify({ _id: _id }, null, { $set: todo }, { new: true }, function(err, todo) {
        var result;

        if(err) {
            result = { _error: msg.error.DB_ERROR };
        }
        else if(todo === null) {
            result = { _warning: msg.warning.TODO_NOT_EXISTS };
        }
        else {
            result = todo;
        }

        res.json(result);
    });
};

exports.delete = function(req, res){
    var _id = db.toObjectID(req.params._id);

    db.collection('todos').findAndRemove({ _id: _id }, function(err, todo) {
        var result;

        if(err) {
            result = { _error: msg.error.DB_ERROR };
        }
        else if(todo === null) {
            result = { _warning: msg.warning.TODO_NOT_EXISTS };
        }
        else {
            result = todo;
        }

        res.json(result);
    });
};