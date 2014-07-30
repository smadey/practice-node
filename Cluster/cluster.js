var cluster = require('cluster');
var cpus = require('os').cpus();

cluster.setupMaster({
    exec: 'worker.js'
});

for(var i = 0; i < cpus.length; i++) {
    cluster.fork();
}