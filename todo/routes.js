
var User = require('./route/user');
var Todo = require('./route/todo');

module.exports = function(app) {

    app.get('/', function(req, res){
        res.render('index');
    });

    app.post('/login', User.unauth);
    app.post('/login', User.login);

    app.post('/register', User.unauth);
    app.post('/register', User.register);

    app.get('/logout', User.auth);
    app.get('/logout', User.logout);


    app.get('/todos/get', User.auth);
    app.get('/todos/get', Todo.get);

    app.post('/todos/add', User.auth);
    app.post('/todos/add', Todo.post);

    app.post('/todos/update', User.auth);
    app.post('/todos/update', Todo.put);

    app.get('/todos/delete/:_id', User.auth);
    app.get('/todos/delete/:_id', Todo.delete);


    app.post('/session/save', function(req, res) {
        req.session.user = req.body;
        res.end();
    });

    app.get('/session/get', function(req, res) {
        res.json(req.session.user);
    });
}
