var net = require('net');

var server = net.createServer(function(socket) {
    socket.on('data', function(data) {
        socket.write('Hello World!');
    });

    socket.on('end', function() {
        console.log('server disconnected!')
    });

    socket.write('TCP Server Demo:\r\n');
});

server.listen(8124, function() {
    console.log('server bound');
});

var server2 = net.createServer();

server2.on('connection', function(socket) {
    socket.write('server2');
});

server2.listen(8125);