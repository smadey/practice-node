var tls = require('tls'),
    fs = require('fs');

var options = {
    key: fs.readFileSync('./keys/client.key'),
    cert: fs.readFileSync('./keys/client.crt'),
    ca: [ fs.readFileSync('./keys/ca.crt') ]
};

var stream = tls.connect(8000, options, function() {
    console.log('client connected', stream.authorized ? 'authorized' : 'unauthorized');
    process.stdin.pipe(stream);
    process.stdin.resume();
});

stream.setEncoding('utf8');
stream.on('data', function(data) {
    console.log(data);
})
stream.on('end', function() {
    server.close();
});
