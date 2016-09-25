import http from 'http';
import request from 'request';
import yargs from 'yargs';
import path from 'path';
import fs from 'fs';

const defaultPort = 8000;

const argv = yargs.options({
  'host': {
    type: 'string',
    default: '127.0.0.1'
  },
  'logPath': {
    type: 'string'
  },
  'port': {
    type: 'number',
  },
  'url': {
    type: 'string'
  }
}).argv;

const logPath = argv.logPath && path.join(__dirname, argv.logPath);
const logStream = logPath ? fs.createWriteStream(logPath) : process.stdout;

let scheme = 'http://';
let port = argv.port || (argv.host === '127.0.0.1' ? defaultPort : 80);

const destinationUrl = argv.url || scheme + argv.host + ':' + port;

// Echo server
http.createServer((req, res) => {
    console.log(`\nRequest received at: ${req.url}\n`);

    req.pipe(res);
    for (let header in req.headers) {
        res.setHeader(header, req.headers[header])
    }

}).listen(defaultPort);

// Proxy server
http.createServer((req, res) => {
  let url = req.headers['x-destination-url'] || destinationUrl;

  console.log(`\nProxying request to: ${url + req.url}\n`);

  let options = {
      headers: req.headers,
      url:  url + req.url,
      method: req.method
  };

  let downstreamResponse = req.pipe(request(options));
  logStream.write(`\nRequest headers:\n\n
                  ${JSON.stringify(downstreamResponse.headers, null, 2)} \n`);
  downstreamResponse.pipe(logStream, {end: false});
  downstreamResponse.pipe(res);

}).listen(8001);
