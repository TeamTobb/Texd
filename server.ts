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
import uploadRoutes = require('./server/resources/upload');
import routes = require('./server/resources/index');
import documentRoutes = require('./server/resources/document');

var wsPort: number = process.env.PORT || 3001;
var databaseUrl: string = 'localhost';
var httpPort = 3000;

checkArgs();

var WebSocketServer = WebSocket.Server;
var server = new WebSocketServer({ port: wsPort });

var wrapFunction = function(fn, context, params) {
    return function() {
        fn.apply(context, params);
    };
}

var funqueue = [];
var kanFortsette = true;

server.on('connection', ws => {
    ws.on('message', message => {
        console.log("recived socket message on server");

        var sayStuff = function(message) {
            documentRoutes.updateDocumentText(JSON.parse(message), () => {
                //Done, alt OK
                kanFortsette = true
            })
        }

        //documentRoutes.updateDocumentText(JSON.parse(message), () => {})
        var fun1 = wrapFunction(sayStuff, this, [message]);
        funqueue.push(fun1);

        while (funqueue.length > 0 && kanFortsette==true) {
            kanFortsette = false;
            (funqueue.shift())();
        }
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//Setting up the uploader "Multer"
var multer  = require('multer')

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + req.originalName);
  }
});

var upload = multer({ storage : storage}).single('photo');


//TODO Change to app.use() Create one upload, with different paths for photo, JSON...
app.post('/upload/photo',function(req,res){
    console.log(req)
    console.log("POST POST POST ")
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

app.post('/uploadFile', uploadRoutes.upload);

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
