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
import chapterModel = documentModel.chapterModel;
import paragraphModel = documentModel.paragraphModel; 


export function read(req: express.Request, res: express.Response) {
    console.log("documentController.retrieveDocument()");
    // console.log("here is req: " + JSON.stringify(req.params, null, 2));  
    


    // var rawStart: String = "Hei #b bloggen #h1 dette er megastort # # ";
    // var para = new Document(rawStart, []);
    
    // var chapterHeaderStart: string = "Kapittel header";
    // var paras = [];
    // paras.push(para);

    // var chapter = new Chapter(chapterHeaderStart, paras);
    // var chapters = [];
    // chapters.push(chapter);
    // chapters.push(new Chapter("Header kap 2", paras));
    // chapters.push(new Chapter("Header kap 3", paras));
    // var documentStart = new Document(2, "This is document title", "documentName", ["Borgar", "jorg", "Bjon", "thomasbassen"], chapters);

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
    var paragraphs1 = [new Paragraph("Doc1 paragraph1", []), new Paragraph("Doc1 paragraph2", []), new Paragraph("Doc1 paragraph3", [])];
    var paragraphs2 = [new Paragraph("Doc2 paragraph1", []), new Paragraph("Doc2 paragraph2", []), new Paragraph("Doc2 paragraph3", [])];
    var paragraphs3 = [new Paragraph("Doc3 paragraph1", []), new Paragraph("Doc3 paragraph2", []), new Paragraph("Doc3 paragraph3", [])];
    
    var chapters1 = [new Chapter("Doc1 chapter1", paragraphs1)];
    var chapters2 = [new Chapter("Doc2 chapter1", paragraphs2)];
    var chapters3 = [new Chapter("Doc3 chapter1", paragraphs3)];
    
    var document1 = new Document(1, "Title 1", "Name 1", ["Jorgen", "Borgar"], chapters1);
    var document2 = new Document(2, "Title 2", "Name 2", ["Jorgen", "Bjon"], chapters2);
    var document3 = new Document(3, "Title 3", "Name 3", ["Bjon", "Borgar"], chapters3);
    
    var documentArray = []; 
    documentArray.push(document1, document2, document3); 
    
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

    repository.update({_id: req.params.id}, {_title: req.body.documentTitle}, (error, document) => {
        if(error){
            res.send(error);
        } else {
            res.jsonp(document);
        }
    });

};

export function updateDocumentText(diff: Diff, callback){ 
    console.log("documentController.testUpdateDocument()");
    var chaptersIndex = "_chapters."+diff.chapterIndex+"._paragraphs"
    var chaptersIndexWithDot = "_chapters."+diff.chapterIndex+"._paragraphs."

    var query = {$set: {}};
    query.$set[chaptersIndexWithDot + diff.index] = diff.paragraph
    
    var newParagraph = new paragraphModel({_raw: "...", _metadata: []});

    var paraQuery = {$push: {}};
    paraQuery.$push[chaptersIndex] = {$each: [newParagraph], $position: diff.index+1};
    if(diff.newchapter){
        var newChapter = new chapterModel({_header: "New Chapter "+(diff.chapterIndex+1), _paragraphs: [{_raw: "...", _metadata: []}]});
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
    } else if (diff.newelement){
        repository.update({
            _id: diff.documentId, '_chapters._id': diff.chapterId}, paraQuery, (error, document2) =>{
            if(error){
                console.log(error)
            }else{
                callback(newParagraph._id)
            }
        })
    } else{
            repository.update({_id: new mongoose.Types.ObjectId(diff.documentId), "_chapters._id": diff.chapterId}, query, (error, document2) => {
                if(error){
                } else {
                    callback("");
                }
        });
    }
}
