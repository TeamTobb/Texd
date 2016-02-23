/// <reference path="./typings/tsd.d.ts"/>​

var express = require('express')
var bodyParser = require('body-parser')

import http = require('http');
import path = require('path');
import mongoose = require('mongoose');
import WebSocket = require('ws');

import Diff = require('./server/domain/diff');
import pluginsRoutes = require('./server/resources/plugins');
import snappetRoutes = require('./server/resources/snappets');
import routes = require('./server/resources/index');
import documentRoutes = require('./server/resources/document');

var wsPort: number = process.env.PORT || 3001;
var databaseUrl: string = 'localhost';
var httpPort = 3000;

checkArgs();

var WebSocketServer = WebSocket.Server;
var server = new WebSocketServer({ port: wsPort });

server.on('connection', ws => {
    ws.on('message', message => {
        try {
            var obj = JSON.parse(message);
            if (obj.newDiff) {
                var diff: Diff = new Diff([], [], [], [], [], [], [], [], obj.newDiff);
                documentRoutes.updateDocumentText(diff, (elementId) => {
                    broadcast(JSON.stringify({ senderId: obj.senderId, elementId: elementId, newDiff: diff }));
                });
            } else {
                broadcast(message);
            }
        } catch (e) {
            console.error(e.message);
        }
    });
});

function broadcast(data: string): void {

    server.clients.forEach(client => {
        client.send(data);
    });
};

if (mongoose.connect('mongodb://' + databaseUrl + '/dbTexd')) {
    console.log("Successfully connected to the database: " + databaseUrl);
} else {
    console.log("Not able to connect to the database: " + databaseUrl);
}

var app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/node_modules')));
app.use(express.static(path.join(__dirname, '/typings')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/plugins', pluginsRoutes.read);
app.get('/snappets', snappetRoutes.read);
app.get('/document/:id', documentRoutes.read);
app.get('/documents', documentRoutes.getDocuments);
app.post('/document/:id', documentRoutes.update);
app.get('/*', routes.index);

app.listen(httpPort, function() {
    console.log("Demo Express server listening on port %d", httpPort);
});

export var App = app;

function checkArgs() {
    var next;
    process.argv.forEach((val, index, array) => {
        if (index < 2) {
            return;
        }

        switch (next) {
            case '--db':
                databaseUrl = val;
                console.log("setting: --db = " + val);
                next = ""
                break;
            case '--httpPort':
                httpPort = Number(val);
                console.log("setting: --httpPort = " + val);
                next = ""
                break;
            case '--wsPort':
                wsPort = Number(val);
                console.log("setting: --wsPort = " + val);
                next = ""
                break;
            case '--socketUrl':
                console.log("not implementet");
                next = ""
                break;

            default:
                if (val == "--db") {
                    next = val;
                } else if (val == "--httpPort") {
                    next = val;
                } else if (val == "--wsPort") {
                    next = val;
                } else if (val == "--help") {
                    next = "";
                    console.log("example: \n--db hoxmark.xyz \n--httpPort 3000 \n--wsPort 3001 \n\n--db to change database URL, \n--httpPort to change portnumber to access the express server \n--wsPort to change the portnumber of the socket ");
                    process.exit();
                } else {
                    next = "";
                }
        }
    });
}
