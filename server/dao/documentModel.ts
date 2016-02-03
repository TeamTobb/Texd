import mongoose = require("mongoose");
import document = require('../../public/domain/document');

var paragraphSchema = new mongoose.Schema({
    _raw: String,
    _metadata: []
});

var chapterSchema = new mongoose.Schema({
     _header: String,
     _paragraphs:[paragraphSchema]
});

export var documentSchema = new mongoose.Schema({
     _idTest: Number,
     _title: String,
     _documentname: String,
     _authors: [],
     _chapters:[chapterSchema]
})

export var repository = mongoose.model("document", documentSchema); 