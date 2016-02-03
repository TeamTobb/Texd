import mongoose = require("mongoose");
import document = require('../../public/domain/document');

// export var documentSchema = new mongoose.Schema({
//     title: String,
//     text: String,
//     idtest: String
// });

// export interface IDocument extends mongoose.Document {
//     title: String;
//     text: String;
//     idtest: String;
// }

// export var repository = mongoose.model<IDocument>("document", documentSchema);

// export var documentSchema = new mongoose.Schema(document.Document);


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