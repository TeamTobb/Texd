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
    public diffSenderId = {
        id: ""
    }
    private _textParser: Parser = null;
    private _jsonParser: jsonToHtml = null;
    private snappetParser: SnappetParser;
    private jwthelper;
    public currentChapter: number;

    public changeOrder: any = {
        from: {},
        to: {},
        text: {},
        chapterId: {}
    }

    public cursorActivity: any = {
        cursorActivity: {
            "line": 0,
            "ch": 0,
            "xRel": 0,
            "outside": true
        },
        color: {}
    }

    public selectionRangeAnchor: any = {
        line: "",
        ch: ""
    }
    public selectionRangeHead: any = {
        line: {},
        ch: {}
    }

    constructor(private http: Http, private authHttp: AuthHttp) {

        this.jwthelper = new JwtHelper()
        var token = localStorage.getItem('id_token')

        if (token != null && typeof (token) != 'undefined') {
            var decoded = this.jwthelper.decodeToken(token)
            this._senderId = decoded.username
        } else {
            this._senderId = "" + Math.random();
        }
        this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
            this.parseMap.generateParseMap(res);
            this._textParser = new Parser(this.parseMap.parseMap);
            this._jsonParser = new jsonToHtml(this.parseMap.parseMap);
        });

        this._socket = new WebSocket('ws://localhost:3001');
        this._socket.onmessage = message => {
            var parsed = JSON.parse(message.data)
            if (parsed.senderId != this._senderId) {
                if (parsed.documentId == this.document.id) {
                    this.changeOrder.from = parsed.from
                    this.changeOrder.to = parsed.to
                    this.changeOrder.text = parsed.text

                    if (parsed.cursorActivity) {
                        this.diffSenderId.id = parsed.senderId
                        this.cursorActivity.cursorActivity.line = parsed.cursorActivity.line;
                        this.cursorActivity.cursorActivity.ch = parsed.cursorActivity.ch;
                        this.cursorActivity.color = parsed.color;
                    }

                    if (parsed.ranges) {
                        this.diffSenderId.id = parsed.senderId
                        this.selectionRangeAnchor.line = parsed.ranges[0].anchor.line;
                        this.selectionRangeAnchor.ch = parsed.ranges[0].anchor.ch;
                        this.selectionRangeHead.line = parsed.ranges[0].head.line;
                        this.selectionRangeHead.ch = parsed.ranges[0].head.ch;
                    }
                    if (parsed.from && parsed.to && parsed.text) {
                        this.changeOrder.from = parsed.from
                        this.changeOrder.to = parsed.to
                        this.changeOrder.text = parsed.text
                        this.changeOrder.chapterId = parsed.chapterId
                    }

                    if (parsed.newchapterName) {
                        for (var chapter of this.document.chapters) {
                            if (chapter.id == parsed.chapterId) {
                                chapter.header = parsed.newchapterName;
                                break;
                            }
                        }
                    }

                    if (parsed.newchapter) {
                        var l = new Line("Text", []);
                        this.document.chapters.splice(parsed.chapterindex + 1, 0, new Chapter("New chapter", [l]))
                    }

                    if (parsed.deleteChapter) {
                        this.document.chapters.splice(parsed.chapterIndex, 1);
                    }

                    if (parsed.changeChapter) {
                        var fromChapter = this.document.chapters[parsed.fromChapter];
                        this.document.chapters.splice(parsed.fromChapter, 1);
                        this.document.chapters.splice(parsed.toChapter, 0, fromChapter);
                        // here is a bug, if you are currently editing one of the moved chapters,
                        // u will automaticly also change chapter, as the index u are in is now a different chapter
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

    public changeChapters(from, to, chapterId) {
        var fromChapter = this.document.chapters[from];
        this.document.chapters.splice(from, 1);
        this.document.chapters.splice(to, 0, fromChapter);
        this.sendDiff({ changeChapter: true, fromChapter: from, toChapter: to }, chapterId);
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
    
    public changeStyle(id: string, newStyle: any) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post('./document/' + id, JSON.stringify({ documentStyle: newStyle }), { headers: headers }).subscribe(res => {
            // Only actually change the title and send socket messages if status==OK
            if (res.status == 200) {
                /*this._socket.send(JSON.stringify({ name: 'name', documentId: id, title: newTitle, senderId: "hello" }));
                this.document.title = newTitle;*/
                console.log("Style saved successfully ")
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

    public parseChapter(callback: (parsedHTML: string) => void) {
        if (this._textParser != null && this._jsonParser != null) {
            
            var lines: Line[] = this.document.chapters[this.currentChapter].lines;
            var parsedJSON = this._textParser.getParsedJSON(lines);
            var parsedHTML: string = this._jsonParser.getParsedHTML(parsedJSON);
            this.document.style
            callback(parsedHTML);
        }
    }

    public sendDiff(diff: any, chapterId: string) {
        var color = localStorage.getItem('id_color')
        if (color != null) {
            diff.color = color;
        } else {
            diff.color = '#' + Math.floor(Math.random() * 16777215).toString(16)
        }
        diff.senderId = this._senderId
        diff.documentId = this.document.id;
        diff.chapterId = chapterId;
        console.log(diff);
        this._socket.send(JSON.stringify(diff));
    }

    public getDocument(documentId: string, callback: (document: Document) => any) {
        this.http.get('./document/' + documentId).map((res: Response) => res.json()).subscribe(res => {
            this.document = new Document([], [], [], [], [], res);
            callback(this.document);
        })
    }

    public getChapter(chapterId: string, callback: (chapter: any) => any) {
        console.log("get chapter")
        this.http.get('/documents/' + this.document.id + '/' + chapterId).map((res: Response) => res.json()).subscribe(res => {
            callback(res);
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
