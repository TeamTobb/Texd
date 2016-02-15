import mongoose = require("mongoose");
import document = require('../../public/domain/document');

var paragraphSchema = new mongoose.Schema({
    _raw: String,
    _metadata: []
});

var chapterSchema = new mongoose.Schema({
    _header: String,
    _paragraphs: [paragraphSchema]
});

var documentSchema = new mongoose.Schema({
    _idTest: Number,
    _title: String,
    _documentname: String,
    _authors: [],
    _chapters: [chapterSchema]
})
export var paragraphModel = mongoose.model("paragraph", paragraphSchema);
export var chapterModel = mongoose.model("chapter", chapterSchema);
export var repository = mongoose.model("document", documentSchema); 

