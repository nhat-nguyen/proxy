import { destinationServer, proxyServer } from './proxy_server';
import { spawn } from 'child_process';
import processProxy from './proxy_process';
import yargs from 'yargs';
import path from 'path';
import fs from 'fs';

const argv = yargs.options({
  'host': {
    type: 'string',
    default: '127.0.0.1',
    describe: 'Specify a forwarding host',
    alias: 'x'
  },
  'logPath': {
    type: 'string',
    descibe: 'Specify a output log file',
    alias: 'l'
  },
  'port': {
    type: 'number',
    describe: 'Specify a port number',
    alias: 'p'
  },
  'url': {
    type: 'string',
    describe: 'Specify a destination url',
    alias: 'u'
  },
  'exec': {
    describe: 'Specify a process to proxy instead',
    alias: 'e'
  }
}).help('h').alias('help', 'h')
.usage('Usage: babel-node index.js --presets es2015,stage-2 [options]')
.epilogue('Thank you CoderSchool for giving me a chance to attend a bound-to-be awesome bootcamp!').argv;


if (!argv.exec) {
  console.log('Proxy server mode...\n');

  const defaultPort = 8000;

  const logPath = argv.logPath && path.join(__dirname, argv.logPath),
        logStream = logPath ? fs.createWriteStream(logPath) : process.stdout,

        port = argv.port || (argv.host === '127.0.0.1' ? defaultPort : 80),
        destinationUrl = argv.url || 'http://' + argv.host + ':' + port;

  destinationServer.listen(defaultPort);
  proxyServer(destinationUrl, logStream).listen(8001);
}

else {
  // Process proxy mode
  let excludedArguments = ['host', 'x', 'logPath', 'l', 'port', 'p', 'url', 'u',
                           'exec', 'e', 'help', 'h', 'presets', '$0', '_'],

      args = processProxy.getArguments(argv, excludedArguments),
      destinationProcess = spawn(argv.exec, args.concat(argv._));

  processProxy.proxyTo(destinationProcess);
}
