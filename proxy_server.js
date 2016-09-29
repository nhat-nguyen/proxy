import http from 'http';
import request from 'request';

// Echo server
export const destinationServer = http.createServer((req, res) => {
    console.log(`\nRequest received at: ${req.url}\n`);

    req.pipe(res);
    for (let header in req.headers) {
        res.setHeader(header, req.headers[header])
    }

});

// Proxy server
export const proxyServer = (destinationUrl, logStream) => {
  return http.createServer((req, res) => {
    let url = req.headers['x-destination-url'] || destinationUrl;

    console.log(`\nProxying request to: ${url + req.url}\n`);

    let options = {
        headers: req.headers,
        url: url + req.url,
        method: req.method
    };

    let downstreamResponse = req.pipe(request(options));
    logStream.write(`\nRequest headers:\n\n
                    ${JSON.stringify(downstreamResponse.headers, null, 2)} \n`);
    downstreamResponse.pipe(logStream, {end: false});
    downstreamResponse.pipe(res);

  });
};
