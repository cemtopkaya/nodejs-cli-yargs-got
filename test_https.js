var url = require('url');
var https = require('https');
var HttpsProxyAgent = require('https-proxy-agent');
 
// HTTP/HTTPS proxy to connect to
var proxy = 'my-vpn-proxy';

var endpoint = 'https://localhost:8009/nrf-settings/v1/general';
var opts = url.parse(endpoint);
 
var agent = new HttpsProxyAgent(proxy);
opts.agent = agent;
 
https.get(opts, function (res) {
  console.log('"response" event!', res.headers);
  res.pipe(process.stdout);
});