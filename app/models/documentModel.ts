import mongoose = require("mongoose");

export var documentSchema = new mongoose.Schema({
    title: String,
    text: String,
    idtest: String
});

export interface IDocument extends mongoose.Document {
    title: String;
    text: String;
    idtest: String;
}

export var repository = mongoose.model<IDocument>("document", documentSchema);
