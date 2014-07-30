var db = require('../config').db,
    msg = require('../common/message'),
    utils = require('../common/utils');

exports.login = function(req, res){
    var username = req.body.username,
        password = req.body.password;

    password = utils.md5(password);

    db.collection('users').findAndModify({ username: username, password: password }, null, { $set: { lastLoginTime: Date.now() } }, { new: true }, function(err, user) {
        var result;

        if(err) {
            result = { _error: msg.error.DB_ERROR };
        }
        else if(!user) {
            result = { _warning: msg.warning.USERNAME_OR_PASSWORD_ERROR };
        }
        else {
            result = user;
            req.session.user = result;
        }

        res.json(result);
    });
};

exports.register = function(req, res){
    var user = {
        username: req.body.username,
        password: req.body.password,
        lastLoginTime: Date.now()
    }

    user.password = utils.md5(user.password);
    user.createTime = user.lastLoginTime;

    db.collection('users').findOne({ username: user.username }, function(err, exist) {
        var result;

        if(err) {
            result = { _error: msg.error.DB_ERROR };
        }
        else if(exist) {
            result = { _warning: msg.warning.USER_ALREADY_EXISTS };
        }
        if(result) {
            res.json(result);
        }
        else {
            db.collection('users').insert(user, function(err, users) {
                if(err) {
                    result = { _error: msg.error.DB_ERROR };
                }
                else if(users.length == 0) {
                    result = { _warning: msg.warning.USER_REGISTER_FAILED };
                }
                else {
                    result = users[0];
                    req.session.user = result;
                }

                res.json(result);
            });
        }
    });
};

exports.logout = function(req, res) {
    req.session.user = null;
    res.redirect('/');
}


exports.auth = function(req, res, next) {
    if(!req.session.user) {
        res.json({ _auth: false });
    }
    else {
        next();
    }
}

exports.unauth = function(req, res, next) {
    if(req.session.user) {
        res.json({ _auth: true });
    }
    else {
        next();
    }
}