var WebSocketServer = require('ws').Server;
const Parser = new Xml2js.Parser({explicitArray: false, ignoreAttrs: false});
wss = new WebSocketServer({ port: 8181 });

const fs = require('fs');
var path = require('path');

var configPath = path.join(__dirname, 'test.xml');
var configString = fs.readFileSync(configPath, 'utf8');
var presetConfig;

var reader = new FileReader();
