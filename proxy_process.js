var spawn = require('child_process').spawn;
var yargs = require('yargs');
var argv = yargs.argv;

var args = Object.keys(argv).filter(function (key) {
    return key !== '$0' && key !== 'exec' && key !== '_';
}).map(function(arg) {
    return '-' + arg;
});

args.forEach(function(arg) {
    args.push(argv[arg.slice(1)]);
});

var destinationProcess = spawn(argv.exec, argv._.concat(args));


// isTTY tells us whether the script is being piped
if (!process.stdin.isTTY) {
    process.stdin.resume();

    process.stdin.on('data', function(data) {
        destinationProcess.stdin.write(data);
    });

    process.stdin.on('end', function(code) {
        destinationProcess.stdin.end();
    });
}

destinationProcess.stdout.on('data', function(data) {
    process.stdout.write(data);
});

destinationProcess.stderr.on('data', function(data) {
    process.stdout.write(data);
});
