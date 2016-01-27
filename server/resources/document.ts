import express = require("express");
import mongoose = require("mongoose");
import documentModel = require("../dao/documentModel");
import IDocument = require('../dao/documentModel');
var bodyParser = require('body-parser');
import repository = documentModel.repository;


export function read(req: express.Request, res: express.Response) {
    console.log("documentController.retrieveDocument()");
    var textParam: String = "This is a really long standard text"
    var idParam: String = "2"
    var titleParam: String = "StandardTitle"
    repository.findOne({idtest: idParam}, (error, document) => {
        if(error){
            res.send(error);
        } else {
            if(!document){
                repository.create({text: textParam, idtest: idParam, title: titleParam}, (error, document) => {
                    if(error){
                        res.send(error);
                    } else {
                        res.jsonp(document);
                    }
                });
            } else {
                res.jsonp(document);
            }
        }
    });
};

export function update(req: express.Request, res: express.Response) {
    console.log("documentController.updateDocument()");
    var textParam: String = req.body.hei
    var idParam: String = "2"
    repository.findOne({idtest: idParam}, (error, document) => {
        if(error){
            res.send(error);
        } else {
            if(document){
                repository.update({title: req.body.documentTitle, idtest: idParam}, (error, document2) => {
                    if(error){
                        res.send(error);
                    } else {
                        res.jsonp(document2);
                    }
                });
            }
        }
    });
};

export function updateDocumentText(updateText: string){
    console.log("documentController.testUpdateDocument()");
    var idParam: String = "2"
    repository.findOne({idtest: idParam}, (error, document) => {
        if(error){
            console.log(error);
        } else {
            if(document){
                repository.update({text: updateText, idtest: idParam}, (error, document2) => {
                    if(error){
                        console.log(error);
                    } else {
                        // no error
                    }
                });
            }
        }
    });
}
