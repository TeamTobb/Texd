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
        text: {}
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
                }
            }
        }

        this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
            this.parseMap.generateParseMap(res);
            this._textParser = new Parser(this.parseMap.parseMap);
            this._jsonParser = new jsonToHtml(this.parseMap.parseMap);
        });
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
                /* if(res.status==200){
                     this._socket.send(JSON.stringify({chapterHeader: 'name', chapterId: chapterId, documentId: documentId, message: newchapterName, senderId: "hello" }));
                     this.document.chapters[chapterId].header = newchapterName;
                 }*/
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
        var color = localStorage.getItem('id_color')
        if (color != null) {
            diff.color = color;
        } else {
            diff.color = '#' + Math.floor(Math.random() * 16777215).toString(16)
        }
        diff.senderId = this._senderId
        diff.documentId = this.document.id;
        diff.chapterId = chapterId;
        this._socket.send(JSON.stringify(diff))
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
