var documentRoutes = require('../resources/document');
import express = require('express')
import Document = require("../domain/document");
import Chapter = require('../domain/chapter')
import Line = require('../domain/line')
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
            this.documentIsUpdated[document["id"]] = false
        })

        setInterval(() => {
            for (var key in this.documentIsUpdated) {
                if (this.documentIsUpdated[key]) {
                    documentRoutes.saveDocument(this.documents[key], (error, updatedDocumentId) => {
                        var documentId: string = key;
                        if (error) {
                            console.log(error)
                        } else {
                            this.documentIsUpdated[updatedDocumentId] = false;
                        }
                    })
                }
            }
        }, 5000);
    }

    createNew(newDocument, callback) {
        var lines = [new Line(" ", []), new Line("", []), new Line("", [])];
        var chapters = [new Chapter("Chapter1", lines)];
        var style1 = {}
        style1["fontSize"] = "12px";
        style1["fontFamily"] = "\"Times New Roman\", Times, serif";
        var document = new Document(9, "new", "Name 1", ["nil", "nil2"], chapters, style1);
        documentRoutes.createNewDocument(document, (doc) => {
            this.documents[doc._id] = doc;
            callback(doc)
        })
    }

    getChapter(req: express.Request, res: express.Response) {
        if (this.documents !== undefined) {
            var documentid: string = req.params.documentid;
            var chapterIndex = req.params.chapterIndex;
            var chapter = this.documents[documentid]._chapters[chapterIndex]
            res.jsonp(this.documents[documentid]._chapters[chapterIndex]);
        }
    }

    getDocument(req: express.Request, res: express.Response) {
        if (this.documents !== undefined) {
            var documentid: string = req.params.id;
            res.jsonp(this.documents[documentid]);
        }
    }
    getDocuments(req: express.Request, res: express.Response) {
        if (this.documents !== undefined) {
            res.jsonp(this.documents);
        }
    }

    updateDocument(diff) {
        this.documentIsUpdated[diff.documentId] = true;
        var document = this.documents[diff.documentId + ""];

        if (diff.newchapter) {
            var newChapter = new chapterModel({ _header: "New chapter", _lines: [{ _raw: "...", _metadata: [] }] });
            document._chapters.splice(diff.chapterIndex + 1, 0, newChapter);
        }
        if (diff.newtitle) {
            document._title = diff.newtitle;
        }

        else if (diff.documentStyle) {
            document._style = diff.documentStyle;
        }
        else if (diff.deleteChapter) {
            document._chapters.splice(diff.chapterIndex, 1);
        }

        else if (diff.newchapterName) {
            if (document._chapters[diff.chapterIndex] != undefined) {
                document._chapters[diff.chapterIndex]._header = diff.newchapterName
            }
        }
        else if (diff.changeChapter) {
            if (document._chapters[diff.fromChapter] != undefined && document._chapters[diff.toChapter] != undefined) {
                var fromChapter = document._chapters[diff.fromChapter];
                document._chapters.splice(diff.fromChapter, 1);
                document._chapters.splice(diff.toChapter, 0, fromChapter);
            }
        }
        else if (typeof (diff.from !== 'undefined')) {
            //TODO prevent fake ID
            var lines = []

            if (document._chapters[diff.chapterIndex] != undefined) {
                lines = document._chapters[diff.chapterIndex]._lines;

                if (diff.origin == '+input') {
                    // New line
                    if (diff.text.length == 2 && diff.text[0] == "" && diff.text[1] == "" && diff.from.line == diff.to.line && diff.from.ch == diff.to.ch) {
                        var raw = lines[diff.from.line]._raw.slice(diff.to.ch);
                        var firstRaw = lines[diff.from.line]._raw.slice(0, diff.to.ch);
                        var line = new lineModel({ _raw: raw, metadata: [] })

                        lines[diff.from.line]._raw = firstRaw

                        lines.splice(diff.from.line + 1, 0, line)

                        // Widget or writing over selected text
                    } else if (diff.removed[0] !== "" && diff.text[0] !== "") {
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
                            lines[fromLine]._raw = firstLine.slice(0, fromCh) + diff.text[0];
                            var lastRow = lastLine.slice(toCh);
                            var last_complete = false;
                            for (var i = toLine; i > fromLine; i--) {
                                if (diff.text[i - fromLine]) {
                                    lines[i]._raw = diff.text[i - fromLine];
                                    if (!last_complete) {
                                        lines[i]._raw += lastRow;
                                        last_complete = true;
                                    }
                                } else {
                                    lines.splice(i, 1);
                                }
                            }
                            if (!last_complete) {
                                lines[fromLine]._raw += lastRow;
                            }
                        }

                        // Writing a single letter
                    } else {
                        var raw: any = lines[diff.from.line]["_raw"];
                        lines[diff.from.line]["_raw"] = raw.slice(0, diff.from.ch) + (diff.text[0] || "") + raw.slice(diff.from.ch);
                    }
                } else if (diff.origin == '+delete' || diff.origin == 'cut') {
                    var fromLine = diff.from.line;
                    var fromCh = diff.from.ch;
                    var toLine = diff.to.line;
                    var toCh = diff.to.ch;

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
                    // TODO: Make sure this works 100%
                    var fromLine = diff.from.line;
                    var fromCh = diff.from.ch;
                    var toLine = diff.to.line;
                    var toCh = diff.to.ch;
                    var beginning = lines[fromLine]._raw.slice(0, fromCh);
                    var end = lines[toLine]._raw.slice(toCh);

                    if (fromLine == toLine) {
                        if (diff.text.length == 1) {
                            lines[fromLine]._raw = beginning + diff.text[0] + end;
                        } else {
                            lines[fromLine]._raw = beginning + diff.text[0];
                            for (var i = 1; i < diff.text.length - 1; i++) {
                                lines.splice(fromLine + i, 0, { _raw: diff.text[i], _metadata: [] })
                            }
                            lines.splice(toLine + diff.text.length - 1, 0, { _raw: diff.text[diff.text.length - 1] + end, _metadata: [] })
                        }
                    } else if (fromLine != toLine) {
                        lines.splice(fromLine + 1, (toLine - fromLine));
                        lines[fromLine]._raw = beginning + diff.text[0];
                        for (var i = 1; i < diff.text.length - 1; i++) {
                            lines.splice(i, 0, { _raw: diff.text[i], _metadata: [] })
                        }
                        if (diff.text.length != 1) {
                            lines.splice(fromLine + diff.text.length - 1, 0, { _raw: diff.text[diff.text.length - 1] + end, _metadata: [] })
                        }
                    }
                } else if (diff.origin == '+snappet') {
                    var fromLine = diff.from.line;
                    var fromCh = diff.from.ch;
                    var toLine = diff.to.line;
                    var toCh = diff.to.ch;
                    var beginning = lines[fromLine]._raw.slice(0, fromCh);
                    var end = lines[toLine]._raw.slice(toCh);
                    for (var n in diff.text) {
                        if (Number(n) == 0) {
                            lines[fromLine]._raw = beginning + diff.text[n];
                        } else {
                            lines.splice(fromLine + Number(n), 0, { _raw: diff.text[n] + end, _metadata: [] })
                        }
                    }
                }
            }
        }
    }
}
