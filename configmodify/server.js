var WebSocketServer = require('ws').Server;
const Xml2js = require('xml2js');
const Parser = new Xml2js.Parser({explicitArray: false, ignoreAttrs: false});
wss = new WebSocketServer({ port: 8000 });

const fs = require('fs');
var path = require('path');

var configPath = path.join(__dirname, '1.xml');

wss.on('connection', function (ws) {
    var configString = fs.readFileSync(configPath, 'utf8');
    var presetConfig;
    var res;
    Parser.parseString(configString , function (err, result) {
        res = result;
        presetConfig = result['Lut'];
        ws.send(JSON.stringify(presetConfig))
    });
    ws.on('message', function (message) {
        let data = JSON.parse(message);
        let Opacity = [];
        let Color = [];
        data.forEach(point => {
            Opacity.push({
                'Index' : `${parseInt(point['index'])}`,
                'A' :`${parseInt(point['A'])}`
            });
            Color.push({
                'Index' : `${parseInt(point['index'])}`,
                'R' : `${parseInt(point['R'])}`,
                'G' : `${parseInt(point['G'])}`,
                'B' : `${parseInt(point['B'])}`,
            })
        });
        presetConfig['Opacity']['Point'] = Opacity;
        presetConfig['Color']['Point'] = Color;
        res['Lut'] = presetConfig;
        // console.log(presetConfig['Opacity'],presetConfig['Color']);
        // console.log(JSON.parse(message));
        var builder = new Xml2js.Builder();
        var xml = builder.buildObject(res);



        fs.writeFile('./1.xml', xml.toString(), function (error) {
            if (error) {
                console.log('写入失败')
            } else {
                console.log('写入成功了')
            }
        })

    });
});