//Singleton (eager initialization) - achieved through @Component-providers in app.js
import {Http, Headers, Response, RequestOptions} from 'angular2/http';
import {AuthHttp, AuthConfig, JwtHelper} from "angular2-jwt/angular2-jwt"; //I am stating it twice
import {Injectable, bind} from 'angular2/core';
import {Component, ViewChild, Input, Output, Renderer, ElementRef} from 'angular2/core';

import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';
import {Document, Chapter, Line} from "../domain/document.ts"
import {Diff} from "../domain/diff.ts";
import {ParseMap} from "../utils/parseMap.ts";
import {SnappetParser} from "../utils/snappetParser.ts";

@Injectable()
export class DocumentService {
    private _socket;
    public parseMap: ParseMap = new ParseMap();

    public cm = null;

    private _document: Document = new Document([], [], [], [], [{}, {}, {}]);

    public _senderId: string;
    private _textParser: Parser = null;
    private _jsonParser: jsonToHtml = null;
    private snappetParser: SnappetParser;
    public currentChapter: number;

    public changeOrder: any = {
        from: {},
        to: {},
        text: {}
    }

    constructor(private http: Http, private authHttp: AuthHttp) {
        this._senderId = "" + Math.random();

        this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
            this.parseMap.generateParseMap(res);
            this._textParser = new Parser(this.parseMap.parseMap);
            this._jsonParser = new jsonToHtml(this.parseMap.parseMap);
        });

        this._socket = new WebSocket('ws://localhost:3001');
        this._socket.onmessage = message => {
            var parsed = JSON.parse(message.data)
            if (parsed.senderId != this._senderId && (parsed.documentId == this.document.id)) {
                if (parsed.from && parsed.to && parsed.text) {
                    this.changeOrder.from = parsed.from
                    this.changeOrder.to = parsed.to
                    this.changeOrder.text = parsed.text
                }

                if (parsed.chapterName) {
                    for (var chapter of this.document.chapters) {
                        if (chapter.id == parsed.chapterId) {
                            chapter.header = parsed.chapterName;
                            break;
                        }
                    }
                }
            }
        }

        this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
            this.parseMap.generateParseMap(res);
            this._textParser = new Parser(this.parseMap.parseMap);
            this._jsonParser = new jsonToHtml(this.parseMap.parseMap);
        });
    }

    public changeChapters(from, to) {
        var fromChapter = this.document.chapters[from];
        this.document.chapters.splice(from, 1);
        this.document.chapters.splice(to, 0, fromChapter);
        console.log("done changing");
        // send diff!
    }

    public changeTitle(id: string, newTitle: string) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post('./document/' + id, JSON.stringify({ documentTitle: newTitle }), { headers: headers }).subscribe(res => {
            // Only actually change the title and send socket messages if status==OK
            if (res.status == 200) {
                this._socket.send(JSON.stringify({ name: 'name', documentId: id, title: newTitle, senderId: "hello" }));
                this.document.title = newTitle;
            }
        });
    }

    public updateLines() {
        if (this.cm == null) return;
        var tempLines: string[] = [];
        for (var i = 0; i < this.cm.lineCount(); i++) {
            var text: string = this.cm.getLine(i);
            tempLines.push(text);
        }
        this._document.chapters[this.currentChapter].lines = [];
        for (var l in tempLines) {
            this._document.chapters[this.currentChapter].lines.push(new Line(tempLines[l], []));
        }
    }

    //TODO implement changeChapterName() new URL
    public changeChapterName(documentId: string, newchapterName: string, chapterId: number) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post('./document/' + documentId, //add chapter number to the URL
            JSON.stringify({
                documentId: documentId,
                newchapterName: newchapterName,
                chapterId: chapterId
            }),
            { headers: headers }).subscribe(res => {
                console.log(res)
                //TODO send out socket change to everyone
                // Only actually change the title and send socket messages if status==OK
                if (res.status == 200) {
                    this._socket.send(JSON.stringify({ documentId: documentId, chapterId: chapterId, chapterName: newchapterName, senderId: this._senderId }));
                }
            }
        );
    }

    public parseChapter(callback: (parsedHTML: string) => void) {
        if (this._textParser != null && this._jsonParser != null) {
            var lines: Line[] = this.document.chapters[this.currentChapter].lines;
            var parsedJSON = this._textParser.getParsedJSON(lines);
            var parsedHTML: string = this._jsonParser.getParsedHTML(parsedJSON);
            callback(parsedHTML);
        }
    }

    public sendDiff(diff: any, chapterId: string) {
        diff.senderId = this._senderId;
        diff.documentId = this.document.id;
        diff.chapterId = chapterId;
        console.log(diff);
        this._socket.send(JSON.stringify(diff));
    }

    public sendDiffNewChapter(diff: any, chapterId: string, chapterIndex: number) {
        diff.senderId = this._senderId;
        diff.documentId = this.document.id;
        diff.chapterId = chapterId;
        diff.chapterIndex = chapterIndex;
        diff.newchapter = true;
        console.log(diff);
        this._socket.send(JSON.stringify(diff));
    }

    public sendDiffDeleteChapter(chapterId: string, chapterIndex: number) {
        var diff: any = {};
        diff.senderId = this._senderId;
        diff.documentId = this.document.id;
        diff.chapterId = chapterId;
        diff.chapterIndex = chapterIndex;
        diff.deleteChapter = true;
        console.log(diff);
        this._socket.send(JSON.stringify(diff));
    }

    public getDocument(documentId: string, callback: (document: Document) => any) {
        this.http.get('./document/' + documentId).map((res: Response) => res.json()).subscribe(res => {
            this.document = new Document([], [], [], [], [], res);
            callback(this.document);
        })
    }

    get document(): Document {
        return this._document;
    }

    set document(value) {
        this._document = value;
    }

    public getDocuments(callback: (documents: Document[]) => void) {
        var documents: Document[] = Array<Document>();
        this.http.get('./documents').map((res: Response) => res.json()).subscribe(res => {
            res.forEach((document) => {
                documents.push(new Document([], [], [], [], [], document));
                callback(documents);
            })
            console.log(JSON.stringify(documents, null, 2));
        });
    }

    public getSnappets(callback: (snappets: any) => void) {
        this.http.get('./snappets').map((res: Response) => res.json()).subscribe(res => {
            console.log("we got snappets: " + JSON.stringify(res, null, 2))
            callback(res);
        })
    }
}
