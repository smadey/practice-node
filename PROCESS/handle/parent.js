var cp = require('child_process'),
    server = require('net').createServer();

var child1 = cp.fork(__dirname + '/child.js'),
    child2 = cp.fork(__dirname + '/child.js');

server.on('connection', function(socket) {
    socket.end('handled by parent\n');
});

server.listen(1337, function() {
    child1.send('server', server);
    child2.send('server', server);

    server.close();
});