var spawn = require('child_process').spawn;
var yargs = require('yargs');
var argv = yargs.argv;

// var destinationProcess = spawn(argv.exec, argv._.concat(args));

class ProcessProxy {
    // Takes yargs's argv object and returned a processed argument array
    // I have yet to find an elegant way to do this, as the arguments received
    // from yargs are all mixed up (babel-node's, nodemon's arguments are all
    // received). So for now, these will all simply be excluded. This would not
    // work if any of the arguments used by the proxied process happen to be 
    // in `excludedKeys` array
    getArguments(argv, excludedKeys) {
        var args = Object.keys(argv).filter(function (key) {
            return excludedKeys.indexOf(key) == -1;
        }).map(function(arg) {
            return '-' + arg;
        });

        args.forEach(function(arg) {
            args.push(argv[arg.slice(1)]);
        });

        return args;
    }

    // Takes a spawn process and proxy any data to it
    proxyTo(destinationProcess) {
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
    }
};

export default new ProcessProxy();
