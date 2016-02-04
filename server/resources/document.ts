import express = require("express");
import mongoose = require("mongoose");
import documentModel = require("../dao/documentModel");
import IDocument = require('../dao/documentModel');
import Document = require("../../server/domain/document");
import Chapter = require('../../server/domain/chapter')
import Paragraph = require('../../server/domain/paragraph')
import Diff = require("../../server/domain/diff");
var bodyParser = require('body-parser');
import repository = documentModel.repository;


export function read(req: express.Request, res: express.Response) {
    console.log("documentController.retrieveDocument()");
    
    var rawStart: String = "Hei #b bloggen #h1 dette er megastort # # ";
    var para = new Document(rawStart, []);
    
    var chapterHeaderStart: string = "Kapittel header"; 
    var paras = []; 
    paras.push(para); 
    
    var chapter = new Chapter(chapterHeaderStart, paras);
    var chapters = []; 
    chapters.push(chapter);
    chapters.push(new Chapter("Header kap 2", paras));
    chapters.push(new Chapter("Header kap 3", paras));  
    var documentStart = new Document(2, "This is document title", "documentName", ["Borgar", "jorg", "Bjon", "thomasbassen"], chapters);
    
    repository.findOne({_idTest: 2}, (error, document) => {
        if(error){
            res.send(error);
        } else {
            if(!document){
                repository.create(documentStart, (error, document2) => {
                    if(error){
                        res.send(error);
                    } else {
                        res.jsonp(document2);
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
    var title = "This is document title"; 
    
    repository.update({_idTest: 2}, {title: req.body.documentTitle}, (error, document) => {
        if(error){
            res.send(error); 
        } else {
            res.jsonp(document); 
        }
    }); 

};

export function updateDocumentText(diff: Diff){
    console.log("documentController.testUpdateDocument()");
    var title = "This is document title";

    // TODO: This is ugly. 
    repository.findOne({_idTest: 2}, (error, document) => {
        if(error){
            //TODO: error handling
        }else{ 
            if(diff.newchapter){
                document["_chapters"].splice(diff.chapter+1, 0, new Chapter("New Chapter", [new Paragraph("Text", [])]));
                // [diff.chapter+1] = new Chapter("New Chapter", [new Paragraph("Text", [])]); 
            // } else if(diff.newchapter == false{
            //     document["_chapters"][diff.chapter+1] = new Chapter("New Chapter", [new Paragraph("Text", [])]);
            // }
            } else{
                document["_chapters"][diff.chapter]["_paragraphs"][diff.index] = diff.paragraph;    
            }
            
            var doc = document; 
            repository.findOneAndUpdate({_idTest: 2}, {_chapters: document["_chapters"]}, (error, document2) => {
                if(error){
                    console.log("error: " + error)
                } else {
                }
            }); 
        }   
    });
}