var cp = require('child_process');
var n = cp.fork(__dirname + '/sub.js');

n.on('message', function(m) {
    console.log('parent got message: ', m);
});

n.send({ hello: 'World' });