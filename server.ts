/// <reference path="./typings/tsd.d.ts"/>​

var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var jwt = require('jwt-simple')
var passport = require('passport');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http');
var WebSocket = require('ws');

import Diff = require('./server/domain/diff');
var pluginsRoutes = require('./server/resources/plugins');
var snappetRoutes = require('./server/resources/snappets');
var loginroutes = require('./server/resources/login');
var documentRoutes = require('./server/resources/document');
var indexroutes = require('./server/resources/index')

var wsPort: number = process.env.PORT || 3001;
var databaseUrl: string = 'localhost';
var httpPort = 3000;

checkArgs();

var WebSocketServer = WebSocket.Server;
var server = new WebSocketServer({ port: wsPort });


server.on('connection', ws => {
    ws.on('message', message => {
        console.log("recived socket message on server");
        documentRoutes.updateDocumentText(JSON.parse(message), () => {      
                
        })
        broadcast(message)
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

//Parsers + passport
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

//Routes
app.use('/', loginroutes);
app.get('/plugins', pluginsRoutes.read);
app.get('/snappets', snappetRoutes.read);
app.get('/document/:id', documentRoutes.read);
// app.get('/documents', passport.authenticate('bearer'), documentRoutes.getDocuments);
app.get('/documents', documentRoutes.getDocuments);
app.post('/document/:id', documentRoutes.update);
app.get('/*', indexroutes.index);

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
