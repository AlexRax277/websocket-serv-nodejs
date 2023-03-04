const WS = require('ws');
const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const path = require('path');
const fs = require('fs');

const port = 8080;
const app = new Koa();
const chat = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data.json')));
const usersOnline = JSON.parse(fs.readFileSync(path.resolve(__dirname, './usersOnline.json')));

app.use(cors());

app.use(ctx => {
    ctx.response.body = 'i\'m serv';
});

const server = http.createServer(app.callback());

const wsServ = new WS.Server({
    server
});

wsServ.on('connection', (ws) => {
    ws.on('message', e => {
        const inputData = JSON.parse(e);
        if(inputData['type'] === 'userEnter') {
            usersOnline.push(inputData['data']);
            fs.writeFileSync(path.resolve(__dirname, './usersOnline.json'), JSON.stringify(usersOnline));
        } else if(inputData['type'] === 'newMsg') {
            chat.forEach(e => {
                if(e['id'] === inputData['data']['id']){
                    return;
                };
            })
            chat.push(inputData['data']);
            fs.writeFileSync(path.resolve(__dirname, './data.json'), JSON.stringify(chat));
        } else if(inputData['type'] === 'userOut') {
            usersOnline.forEach((el) => {
                if (el === inputData['data']) {
                    usersOnline.splice(usersOnline.indexOf(el), 1);
                }
              });
            fs.writeFileSync(path.resolve(__dirname, './usersOnline.json'), JSON.stringify(usersOnline));
        } else {
            throw Error('incorrect typo of data')
        };
        

    });

    ws.send(JSON.stringify({ "chat": chat, "usersOnline": usersOnline }));
    
})

server.listen(port);
