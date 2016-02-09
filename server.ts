/// <reference path="./typings/tsd.d.ts"/>​

var express = require('express')
var bodyParser = require('body-parser')

import http = require('http');
import path = require('path');
import mongoose = require('mongoose');
import WebSocket = require('ws');


import models = require('./server/dao/messageModel');
import Diff = require('./server/domain/diff');

import pluginsRoutes = require('./server/resources/plugins');
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
            if(obj.newDiff){
                // var difftest = new Diff({}, {}, 0, false, false, obj.newDiff);
                var difftest: Diff = new Diff([], [], [], [], [], [], [], [], obj.newDiff);  
                documentRoutes.updateDocumentText(difftest, (elementId) => {
                    broadcast(JSON.stringify({senderId: obj.senderId, elementId: elementId, newDiff: difftest}));    
                });
            }else{
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

if (mongoose.connect('mongodb://'+databaseUrl+'/dbTexd')){
	console.log("Successfully connected to the database: "+databaseUrl);
} else {
	console.log("Not able to connect to the database: "+databaseUrl);
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
app.get('/document', documentRoutes.read);
app.post('/document', documentRoutes.update);
app.get('/*', routes.index);

// app.post('/document/:documentid', documentRoutes.update)
// app.put('/document/:documentid', documentRoutes.update)

// app.post('/document/:documentid/:chapterid', documentRoutes.update)
// app.put('/document/:documentid/:chapterid', documentRoutes.update)

// app.post('/document/:documentid/:chapterid/:paragraphid', documentRoutes.update)
// app.put('/document/:documentid/:chapterid/:paragraphid', documentRoutes.update)

app.listen(httpPort, function(){
    console.log("Demo Express server listening on port %d", httpPort);
});

export var App = app;

function checkArgs(){
	var next;
	process.argv.forEach((val, index, array) => {
		if (index<2){
			return;
		}

	    switch (next){
		    case'--db':
				databaseUrl=val;
		    	console.log("setting: --db = "+val);
				next = ""
			break;
		    case'--httpPort':
				httpPort = Number(val);
		    	console.log("setting: --httpPort = "+val);
				next = ""
		    break;
		    case'--wsPort':
				wsPort = Number(val);
		    	console.log("setting: --wsPort = "+val);
				next = ""
		    break;
			case'--socketUrl':
		    	console.log("not implementet");
				next = ""
		    break;

	    	default:
				if (val=="--db"){
					next = val;
				} else if (val == "--httpPort"){
					next = val;
				} else if (val == "--wsPort"){
					next = val;
				} else if (val =="--help") {
					next = "";
					console.log("example: \n--db hoxmark.xyz \n--httpPort 3000 \n--wsPort 3001 \n\n--db to change database URL, \n--httpPort to change portnumber to access the express server \n--wsPort to change the portnumber of the socket ");
					process.exit();
				} else {
					next = "";
				}
	  	}
		});
}
