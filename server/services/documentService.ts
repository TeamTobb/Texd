var documentRoutes = require('../resources/document');
import Document = require("../domain/document");
import Chapter = require('../domain/chapter')
import Line = require('../domain/line')
import Diff = require("../domain/diff");
import documentModel = require("../dao/documentModel");
import repository = documentModel.repository;
import chapterModel = documentModel.chapterModel;
import lineModel = documentModel.lineModel;

export class DocumentService {
    documents = {};
    documentIsUpdated = {};

    constructor() {
        documentRoutes.getAllDocuments((documents) => {
            for (var document of documents) {
                this.documents[document["id"]] = document;
            }
            console.log(JSON.stringify(this.documents, null, 2));
            this.documentIsUpdated[document["id"]] = false
        })

        setInterval(() => {
            console.log("DB tick")
            for (var key in this.documentIsUpdated) {
                if (this.documentIsUpdated[key]) {
                    console.log(key + "is getting updated...: ");
                    documentRoutes.saveDocument(this.documents[key], (error, updatedDocumentId) => {
                        var documentId: string = key;
                        if (error) {
                            console.log(error)
                        } else {
                            console.log("just updated doc: " + updatedDocumentId + " to Databse")
                            this.documentIsUpdated[updatedDocumentId] = false;
                        }

                    })


                }
            }
        }, 5000);
    }

    updateDocument(diff2) {
        console.log("updateDocument(diff) START")
        var diff = JSON.parse(diff2);
        this.documentIsUpdated[diff.documentId] = true;
        var document = this.documents[diff.documentId + ""];

        console.log("WTJWEUIRH WIUEHRUI WEHRIU WEHRU WEHRI UWEHRIU HWERIUH WEIUR ");

        if (diff.newchapter) {
            console.log("NEW CHAPTER...");
            var newChapter = new chapterModel({ _header: "New Chapter " + (diff.chapterIndex + 1), _lines: [{ _raw: "...", _metadata: [] }] });
            document._chapters.splice(diff.chapterIndex + 1, 0, newChapter);
        }
        else if (diff.deleteChapter) {
            console.log("deleting chapter");
            document._chapters.splice(diff.chapterIndex, 1);
        }
        else if (typeof (diff.from !== 'undefined')) {
            //TODO prevent fake ID
            var lines = []

            for (var chapter of document._chapters) {
                if (chapter._id == diff.chapterId) {
                    lines = chapter._lines;
                    break;
                }
            }

            console.log("trying to update: " + JSON.stringify(diff, null, 2));
            if (diff.origin == '+input') {
                if (diff.text.length == 2 && diff.text[0] == "" && diff.text[1] == "" && diff.from.line == diff.to.line && diff.from.ch == diff.to.ch) {
                    var raw = lines[diff.from.line]._raw.slice(diff.to.ch);
                    var firstRaw = lines[diff.from.line]._raw.slice(0, diff.to.ch);
                    var line = new lineModel({ _raw: raw, metadata: [] })

                    lines[diff.from.line]._raw = firstRaw

                    lines.splice(diff.from.line + 1, 0, line)
                } else if (diff.removed[0] !== "" && diff.text[0] !== "") {
                    console.log("Tekst erstattet med bokstaver")

                    var fromLine = diff.from.line;
                    var fromCh = diff.from.ch;
                    var toLine = diff.to.line;
                    var toCh = diff.to.ch;

                    var firstLine: String = lines[fromLine]._raw;
                    var lastLine: String = lines[toLine]._raw;

                    if (fromLine == toLine) {
                        var newraw: string = firstLine.slice(0, fromCh) + diff.text[0] + firstLine.slice(toCh);
                        lines[fromLine]._raw = newraw;
                    } else if (fromLine != toLine) {
                        var firstRow = firstLine.slice(0, fromCh) + diff.text[0];
                        var lastRow = lastLine.slice(toCh);
                        lines[fromLine]._raw = firstRow + lastRow;
                        lines.splice(fromLine + 1, diff.removed.length - 1);
                    }
                } else {  //ny bokstav
                    var raw: any = lines[diff.from.line]["_raw"];
                    lines[diff.from.line]["_raw"] = raw.slice(0, diff.from.ch) + (diff.text[0] || "") + raw.slice(diff.from.ch);
                }
            } else if (diff.origin == '+delete' || diff.origin == 'cut') {
                var fromLine = diff.from.line;
                var fromCh = diff.from.ch;
                var toLine = diff.to.line;
                var toCh = diff.to.ch;

                var query = { $set: {} };
                var paragraphset = "_chapters.0._lines." + fromLine;


                if (diff.text.length == 2 && diff.text[0] == "" && diff.text[1] == "") {
                    var endraw = lines[diff.to.line]._raw.slice(0);
                    lines[diff.from.line]._raw += endraw;
                    lines.splice(diff.to.line, 1)
                } else {
                    var firstLine: String = lines[fromLine]._raw;
                    var lastLine: String = lines[toLine]._raw;
                    if (fromLine == toLine) {
                        var newraw: string = firstLine.slice(0, fromCh) + firstLine.slice(toCh);
                        lines[fromLine]._raw = newraw;
                    } else if (fromLine != toLine) {
                        var firstRaw: any = firstLine.slice(0, fromCh);
                        var lastRaw = lastLine.slice(toCh);
                        lines[fromLine]._raw = firstRaw + lastRaw;
                        lines.splice(fromLine + 1, diff.removed.length - 1);
                    }
                }
            } else if (diff.origin == 'paste') {
                var fromLine = diff.from.line;
                var fromCh = diff.from.ch;
                var toLine = diff.to.line;
                var toCh = diff.to.ch;

                if (diff.text.length == 2 && diff.text[0] == "" && diff.text[1] == "") {
                    var endraw = lines[diff.to.line]._raw.slice(0);
                    lines[diff.from.line]._raw += endraw;
                    lines.splice(diff.to.line, 1)
                } else if (diff.text.length > 1) {
                    console.log("diff.text.length>1 = True")
                } else {
                    var firstLine: String = lines[fromLine]._raw;
                    var lastLine: String = lines[toLine]._raw;
                    if (fromLine == toLine) {
                        var newraw: string = firstLine.slice(0, fromCh) + diff.text + firstLine.slice(toCh);
                        lines[fromLine]._raw = newraw;
                    } else if (fromLine != toLine) {
                        var firstRaw: any = firstLine.slice(0, fromCh);
                        var lastRaw = lastLine.slice(toCh);
                        lines[fromLine]._raw = firstRaw + diff.text + lastRaw;
                        lines.splice(fromLine + 1, diff.removed.length - 1);
                    }
                }
            }
        }
    }
}