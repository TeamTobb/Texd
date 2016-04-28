/// <reference path="./typings/tsd.d.ts"/>​

import express = require('express')
var fs = require('fs');
var https = require('https');
var debug = require('debug')('SplineWeb:server');

var key = fs.readFileSync('./key.pem');
var cert = fs.readFileSync('./cert.pem')
var https_options = {
    key: key,
    cert: cert
};

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
var publicIp = require('public-ip');

import uploadRoutes = require('./server/resources/upload');
import routes = require('./server/resources/index');
var pluginsRoutes = require('./server/resources/plugins');
var snippetRoutes = require('./server/resources/snippets');
var loginroutes = require('./server/resources/login');
var documentRoutes = require('./server/resources/document');
var indexroutes = require('./server/resources/index')

var wsPort: number = process.env.PORT || 3001;
var databaseUrl: string = 'localhost';
var httpPort = 3000;

checkArgs();

var WebSocketServer = WebSocket.Server;
var server = new WebSocketServer({ port: wsPort });

import DocumentService = require('./server/services/documentService');

var documentService = new DocumentService.DocumentService();


server.on('connection', ws => {
    ws.on('message', message => {
        var parsedMessage = JSON.parse(message);

       if (parsedMessage.newDocument) {
            documentService.createNew(parsedMessage.document, (doc) => {
                broadcast(JSON.stringify({ newDocument: true, document: doc }))
            })
        } else {
            documentService.updateDocument(parsedMessage);
            broadcast(message)
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

//Parsers + passport
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

//Setting up the uploader "Multer"
var multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var documentID: string = ""
        for (var index = 0; index < req.rawHeaders.length; index++) {
            var element = req.rawHeaders[index];
            if (element == "Referer") {
                documentID = req.rawHeaders[index + 1].slice(req.rawHeaders[index + 1].length - 24, req.rawHeaders[index + 1].length);
            }
        }
        var documentDir = './public/uploads/document/' + documentID.trim()// '/photos'
        var photoDirForDocId = documentDir + '/photos'
        if (!fs.existsSync(documentDir)) {
            fs.mkdirSync(documentDir);
            fs.mkdirSync(photoDirForDocId);
        }
        callback(null, photoDirForDocId);
    },
    filename: function (req, file, callback) {
        var originalName: string = ""
        for (var index = 0; index < req.rawHeaders.length; index++) {
            var element = req.rawHeaders[index];
            if (element == "originalName") {
                originalName = req.rawHeaders[index + 1];
                // replace all whitespace with nothing
                originalName = originalName.replace(/\s/g, "");
            }
        }
        callback(null, originalName);
    }
});

var upload = multer({ storage: storage }).single('photo');


//TODO Change to app.use() Create one upload, with different paths for photo, JSON...
app.post('/upload/photo', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

app.post('/uploadFile', uploadRoutes.upload);

//Routes
app.use('/', loginroutes);
app.get('/plugins', pluginsRoutes.read);
app.post('/plugins', (req, res) => {
    var filename = req.body.plugin.pluginname;
    var body = req.body.plugin.pluginbody;
    fs.writeFile("./server/plugins/" + filename + ".json", JSON.stringify(body, null, 2), (err) => {
        if (err) {
            res.jsonp({ success: false })
        } else {
            broadcast(JSON.stringify({ newplugin: { name: filename, body: body } }))
            res.jsonp({ success: true })
        }
    });
})
app.get('/snippets', snippetRoutes.read);
app.get('/getFilesInDir/:id', documentRoutes.getFilesInDir);
app.get('/document/:id', (req, res) => {
    documentService.getDocument(req, res)
})
app.get('/document/createNew', (req, res) => {
    documentService.createNew(req, res)
})


// app.get('/documents', passport.authenticate('bearer'), documentRoutes.getDocuments);
app.get('/documents', (req, res) => {
    documentService.getDocuments(req, res)
})

app.get('/documents/:documentid/:chapterIndex', (req, res) => {
    documentService.getChapter(req, res)
})

app.get('/wsip', (req, res) => {
    publicIp.v4((err, ip) => {
        res.jsonp({ ip: ip, httpPort: httpPort, wsPort: wsPort })
    });
})

app.get('/*', indexroutes.index);

app.listen(httpPort, function () {
    console.log("Demo Express server listening on port %d", httpPort);
});


// var server = https.createServer(https_options, app).listen(httpPort, function(){

// });

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
