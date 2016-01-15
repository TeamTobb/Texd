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

checkArgs();

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
