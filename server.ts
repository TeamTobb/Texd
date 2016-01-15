/// <reference path="./typings/tsd.d.ts"/>​

var express = require('express')
var bodyParser = require('body-parser')

import http = require('http');
import path = require('path');
import mongoose = require('mongoose');
import WebSocket = require('ws');

import routes = require('./app/routes/indexRoutes');
import documentRoutes = require('./app/routes/documentRoutes');
import documentController = require('./app/controllers/documentController');
import models = require('./app/models/messageModel');

var wsPort: number = process.env.PORT || 3001;
var databaseUrl: string = 'localhost';
var httpPort = 3000;


var WebSocketServer = WebSocket.Server;
var server = new WebSocketServer({ port: wsPort });

server.on('connection', ws => {
	ws.on('message', message => {
		try {
			var userMessage: models.UserMessage = new models.UserMessage(message);
			broadcast(JSON.stringify(userMessage));
			if (userMessage.name == "document") {
					documentController.updateDocumentText(userMessage.message);
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
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.get('/', routes.index);
app.get('/document', documentRoutes.read);
app.post('/document', documentRoutes.update);

app.listen(httpPort, function(){
    console.log("Demo Express server listening on port %d", httpPort);
});

export var App = app;
