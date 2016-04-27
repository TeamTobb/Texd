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

var style1 = {}
style1["fontSize"] = "12px";
style1["fontFamily"] = "\"Times New Roman\", Times, serif";

var document1 = new Document(1, "Title 1", "Name 1", ["Jorgen", "Borgar"], chapters1, style1);
var document2 = new Document(2, "Title 2", "Name 2", ["Jorgen", "Bjon"], chapters2, style1);
var document3 = new Document(3, "Title 3", "Name 3", ["Bjon", "Borgar"], chapters3, style1);
var document4 = new Document(4, "Title 4", "Name 4", ["Bjon", "Borgar"], chapters4, style1);
var document5 = new Document(5, "Title 5", "Name 5", ["Bjon", "Borgar"], chapters5, style1);
var document6 = new Document(6, "Title 6", "Name 6", ["Bjon", "Borgar"], chapters6, style1);
var document7 = new Document(7, "Title 7", "Name 7", ["Bjon", "Borgar"], chapters7, style1);

var documentArray = [];
documentArray.push(document1, document2, document3, document4, document5, document6, document7);

export function getFilesInDir(req: express.Request, res: express.Response) {
    var docIdDir = {}
    docIdDir["photos"] = {}
    var fs = require('fs');
    var result = fs.readdir("./public/uploads/document/" + req.params.id + "/photos/", (err, files) => {
        if (err) {
            console.log(err)
            res.jsonp(err)
        } else {
            res.jsonp(files);
        }
    })
}

export function getAllDocuments(callback) {
    repository.find({}, (error, document) => {
        if (error) {
            console.log(error)
        } else {
            if (document.length == 0) {
                repository.create((documentArray), (error, document2) => {
                    if (error) {
                        console.log(error);
                    } else {
                        getAllDocuments(callback);
                    }
                });
            } else if (document.length > 0) {
                callback(document);
            }
        }
    })
}


export function createNewDocument(document, callback) {
    repository.create(document, (error, document) => {
        if (error) {
            console.log(error);
        } else {
            callback(document);
        }
    });
}

export function saveDocument(document, callback) {
    repository.update({ _id: document._id }, document, (error, document2) => {
        if (error) {
            console.log(error);
            callback(error, document._id)
        } else {
            callback(null, document._id);

        }
    })
}
