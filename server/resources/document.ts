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
    
    repository.find({'chapters.paragraphs._id': 'ObjectID(56b5e4ab1e214b7818907c50)'},  (error, document) => {
       console.log("we found " + JSON.stringify(document, null, 2));  
    });
        
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
    
    repository.update({_idTest: 2}, {_title: req.body.documentTitle}, (error, document) => {
        if(error){
            res.send(error); 
        } else { 
            res.jsonp(document); 
        }
    }); 

};

export function updateDocumentText(diff: Diff){
    console.log("documentController.testUpdateDocument()"); 
     
    var query = {$set: {}}; 
    query.$set["_chapters.0._paragraphs." + diff.index] = diff.paragraph
    
    var paraQuery = {$push: {}};
    paraQuery.$push = {"_chapters.0._paragraphs": {$each: [diff.paragraph], $position: diff.index+1}};    
    // paraQuery

    // TODO: This is ugly. 
    repository.findOne({_id: diff.documentId}, (error, document) => {
        if(error){
            //TODO: error handling
        }else{ 
            if(diff.newchapter){
                
            } else if (diff.newelement){  
                repository.update({
                    _id: diff.documentId, '_chapters._id': diff.chapterId}, paraQuery, (error, document2) =>{
                    if(error){
                        console.log(error)
                    }
                    console.log(document2);
                })  
            } else{
                 repository.update({_id: new mongoose.Types.ObjectId(diff.documentId), "_chapters._id": diff.chapterId}, query, (error, document2) => {
                     if(error){
                         
                     }          
                }); 
            }
        }   
    });
}