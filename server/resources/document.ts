import express = require("express");
import mongoose = require("mongoose");
import documentModel = require("../dao/documentModel");
import IDocument = require('../dao/documentModel');
import Document = require("../../server/domain/document");
import Chapter = require('../../server/domain/chapter')
import Line = require('../../server/domain/line')
import Diff = require("../../server/domain/diff");
var bodyParser = require('body-parser');
import repository = documentModel.repository;
import chapterModel = documentModel.chapterModel;
import lineModel = documentModel.lineModel; 


export function read(req: express.Request, res: express.Response) {
    console.log("documentController.retrieveDocument()");
    repository.findOne({_id: req.params.id}, (error, document) => {
        if(error){
            res.send(error);
        } else {
            res.jsonp(document);
        }
    });
}

export function getDocuments(req: express.Request, res: express.Response){
    console.log("getDocuments()"); 
    var lines1 = [new Line("Doc1 line1", []), new Line("Doc1 line2", []), new Line("Doc1 line3", [])];
    var lines2 = [new Line("Doc2 line1", []), new Line("Doc2 line2", []), new Line("Doc2 line3", [])];
    var lines3 = [new Line("Doc3 line1", []), new Line("Doc3 line2", []), new Line("Doc3 line3", [])];
    var lines4 = [new Line("Doc4 line1", []), new Line("Doc4 line2", []), new Line("Doc3 line3", [])];
    var lines5 = [new Line("Doc5 line1", []), new Line("Doc5 line2", []), new Line("Doc3 line3", [])];
    var lines6 = [new Line("Doc6 line1", []), new Line("Doc6 line2", []), new Line("Doc3 line3", [])];
    var lines7 = [new Line("Doc7 line1", []), new Line("Doc7 line2", []), new Line("Doc3 line3", [])];
    
    var chapters1 = [new Chapter("Doc1 chapter1", lines1)];
    var chapters2 = [new Chapter("Doc2 chapter1", lines2)];
    var chapters3 = [new Chapter("Doc3 chapter1", lines3)];
    var chapters4 = [new Chapter("Doc4 chapter1", lines4)];
    var chapters5 = [new Chapter("Doc5 chapter1", lines5)];
    var chapters6 = [new Chapter("Doc6 chapter1", lines6)];
    var chapters7 = [new Chapter("Doc7 chapter1", lines7)];
    
    var document1 = new Document(1, "Title 1", "Name 1", ["Jorgen", "Borgar"], chapters1);
    var document2 = new Document(2, "Title 2", "Name 2", ["Jorgen", "Bjon"], chapters2);
    var document3 = new Document(3, "Title 3", "Name 3", ["Bjon", "Borgar"], chapters3);
    var document4 = new Document(4, "Title 4", "Name 4", ["Bjon", "Borgar"], chapters4);
    var document5 = new Document(5, "Title 5", "Name 5", ["Bjon", "Borgar"], chapters5);
    var document6 = new Document(6, "Title 6", "Name 6", ["Bjon", "Borgar"], chapters6);
    var document7 = new Document(7, "Title 7", "Name 7", ["Bjon", "Borgar"], chapters7);
    
    var documentArray = []; 
    documentArray.push(document1, document2, document3, document4, document5, document6, document7); 
    
    repository.find({}, (error, documents) => {
       if(error){
           console.log(error); 
           res.jsonp(error);
       } else if(!documents.length){
           console.log("No documents found");
            repository.create((documentArray), (error, document2) => {
                if(error){
                    console.log(error); 
                }else{
                    getDocuments(req, res);    
                }
            });     
       } else{
           console.log("We found documents"); 
           res.jsonp(documents); 
       }
    });
}

export function update(req: express.Request, res: express.Response) {
    console.log("documentController.updateDocument()");
    if(req.body.documentTitle != null){
        repository.update({_id: req.params.id}, {_title: req.body.documentTitle}, (error, document) => {
            if(error){
                res.send(error);
            } else {
                res.jsonp(document);
            }
    	});        
    }
            
    if(req.body.newchapterName != null){
        var query = {$set: {}};
        query.$set["_chapters.$._header"] = req.body.newchapterName
        
        repository.update({
            _id: new mongoose.Types.ObjectId(req.params.id),
            "_chapters._id": new mongoose.Types.ObjectId(req.body.chapterId)
        }, query, (error, document) => {
            if(error){             
                res.send(error);
            } else {
                res.jsonp(document);
            }
        });
       
    }
}
    	
export function updateDocumentText(diff, callback){ 
    console.log("updateDocumentText: " + JSON.stringify(diff, null, 2))
//     console.log("documentController.testUpdateDocument()"); 
//     var chaptersIndex = "_chapters.$._paragraphs"
//     var chaptersIndexWithDot = "_chapters.$._paragraphs."
// ​
//     var query = {$set: {}};
//     query.$set[chaptersIndexWithDot + diff.index] = diff.paragraph
    
//     var newLine = new lineModel({_raw: "...", _metadata: []});
// ​
//     var paraQuery = {$push: {}};
//     paraQuery.$push[chaptersIndex] = {$each: [newLine], $position: diff.index+1};
    if(diff.newchapter){
        
        var newChapter = new chapterModel({_header: "New Chapter "+(diff.chapterIndex+1), _lines: [{_raw: "...", _metadata: []}]});
        repository.update(
            {_id: diff.documentId},
            { $push:
                {_chapters:
                    {
                        $each: [newChapter],
                        $position: diff.chapterIndex+1
                    }
                }
            }, (error, document) => {
                if (error){
                    console.log(error);
                } else { 
                    callback(newChapter._id);
                }
            });
    } 
    else if (typeof (diff.from !== 'undefined')){
        if(diff.origin == '+input'){
            var query = {$set: {}};
            var paragraphset = "_chapters.0._lines." + diff.from.line
            
            repository.find({_id: new mongoose.Types.ObjectId(diff.documentId), "_chapters._id": new mongoose.Types.ObjectId(diff.chapterId)}, (error, document) => {
                if(error){
                    console.log(error)
                } else{
                    var raw: string = document[0]["_chapters"][0]["_lines"][diff.from.line]["_raw"];
                    var newraw: string = raw.slice(0, diff.from.ch) + (diff.text[0] || "") + raw.slice(diff.from.ch);
                    var newLine = {_raw: newraw, _metadata: []}
                    query.$set[paragraphset] = newLine
                    repository.update({_id: new mongoose.Types.ObjectId(diff.documentId), "_chapters._id": new mongoose.Types.ObjectId(diff.chapterId)}, query, (error, document2) => {
                        if(error){
                            console.log(error)
                        } else{
                            console.log("successfully updated line")
                        }
                    })                
                }
            })
        }
        else if (diff.origin == '+delete'){
            
        } else if (diff.origin == 'cut'){
            
        } else if (diff.origin == 'paste'){
            
        }
    }
    
    // else if (diff.newelement){
    //     repository.update({
    //         _id: diff.documentId, '_chapters._id': diff.chapterId}, paraQuery, (error, document2) =>{
    //         if(error){
    //             console.log(error)
    //         }else{
    //             callback(newLine._id)
    //         }
    //     })
    // } else{
    //         repository.update({_id: new mongoose.Types.ObjectId(diff.documentId), "_chapters._id": diff.chapterId}, query, (error, document2) => {
    //             if(error){
    //             } else {
    //                 callback("");
    //             }
    //     });
    // }
}