import express = require("express");
import mongoose = require("mongoose");
import documentModel = require("../dao/documentModel");
import IDocument = require('../dao/documentModel');
import document = require("../../public/domain/document");
import diff = require("../../public/domain/diff");
var bodyParser = require('body-parser');
import repository = documentModel.repository;


export function read(req: express.Request, res: express.Response) {
    console.log("documentController.retrieveDocument()");
    
    var rawStart: String = "hei #b bloggen #h1 dette er megatsort # # ";
    var para = new document.Paragraph(rawStart, []);
    
    var chapterHeaderStart: string = "Kapittel header"; 
    var paras = []; 
    paras.push(para); 
    
    var chapter = new document.Chapter(chapterHeaderStart, paras);
    var chapters = []; 
    chapters.push(chapter);  
    var documentStart = new document.Document(2, "This is document title", "documentName", ["Borgar", "jorg", "Bjon", "thomasbassen"], chapters);
    
    repository.findOne({_idTest: 2}, (error, document) => {
        if(error){

            res.send(error);
        } else {
            if(!document){
                repository.create(documentStart, (error, document) => {
                    if(error){
                        res.send(error);
                    } else {
                        console.log("we are creating document")
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
    var title = "This is document title"; 
    
    // repository.update()
    repository.update({_idTest: 2}, {_title: req.body.documentTitle}, (error, document) => {
        if(error){
            res.send(error); 
        } else {
            console.log("we have updated the document"); 
            res.jsonp(document); 
        }
    }); 
    // var textParam: String = req.body.hei
    // var idParam: String = "2"
    /*repository.findOne({title: title}, (error, document) => {
        if(error){
            res.send(error);
        } else {
            if(document){
                repository.update({title: req.body.documentTitle}, (error, document2) => {
                    if(error){
                        res.send(error);
                    } else {
                        res.jsonp(document2);
                    }
                });
            }
        }
    });*/
};

export function updateDocumentText(diff: diff.Diff){
    console.log("documentController.testUpdateDocument()");
    var title = "This is document title";

    // TODO: This is ugly. 
    repository.findOne({_idTest: 2}, (error, document) => {
        if(error){
            //TODO: error handling
        }else{ 
            document["_chapters"][diff.chapter]["_paragraphs"][0] = diff.paragraph;
            console.log(JSON.stringify(document, null, 2)); 
            var doc = document; 
            // document.save;
            repository.findOneAndUpdate({_idTest: 2}, {_chapters: document["_chapters"]}, (error, document2) => {
                if(error){
                    console.log("error: " + error)
                    //error handling 
                } else {
                    console.log("it works) ")
                  
                }
            }); 
        }   
    });
  
}
