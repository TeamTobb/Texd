import mongoose = require("mongoose");
import document = require('../../public/domain/document');

var lineSchema = new mongoose.Schema({
    _raw: String,
    _metadata: []
});

var chapterSchema = new mongoose.Schema({
    _header: String,
    _lines: [lineSchema]
});

var documentSchema = new mongoose.Schema({
    _idTest: Number,
    _title: String,
    _documentname: String,
    _authors: [],
    _chapters: [chapterSchema],
    _style: mongoose.Schema.Types.Mixed
})
export var lineModel = mongoose.model("line", lineSchema);
export var chapterModel = mongoose.model("chapter", chapterSchema);
export var repository = mongoose.model("document", documentSchema); 

