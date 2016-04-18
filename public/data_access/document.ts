import {Http, Headers, Response, RequestOptions} from 'angular2/http';
import {AuthHttp, AuthConfig, JwtHelper} from "angular2-jwt/angular2-jwt";
import {Injectable, bind} from 'angular2/core';
import {Component, ViewChild, Input, Output, Renderer, ElementRef} from 'angular2/core';
import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';
import {Document, Chapter, Line} from "../domain/document.ts"
import {Observable} from 'rxjs/Observable';
import {Diff} from "../domain/diff.ts";
import {ParseMap} from "../utils/parseMap.ts";
import {SnappetParser} from "../utils/snappetParser.ts";
import {EditorController} from '../controllers/editor.ts'
import {Observer} from 'rxjs/Observer';

@Injectable()
export class DocumentService {
    private _socket: WebSocket;
    public parseMap: ParseMap = new ParseMap();
    private _document: Document = new Document([], [], [], [], [{}, {}, {}]);
    public _senderId: string;
    private _textParser: Parser = null;
    private _jsonParser: jsonToHtml = null;
    private snappetParser: SnappetParser;
    private jwthelper;
    public currentChapter: number;
    public cm: any;
    public diffObserver: Observable<any>;
    private _todosObserver: Observer<any>;
    public diff: any = {};

    constructor(private http: Http, private authHttp: AuthHttp) {
        this.diffObserver = new Observable(observer => this._todosObserver = observer).startWith(this.diff).share();
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


        this.http.get('./wsip').map((res: Response) => res.json()).subscribe(res => {
            this._socket = new WebSocket('ws://' + res.ip + ':3001');
            this._socket.onmessage = message => {
                var parsed = JSON.parse(message.data)
                if (parsed.senderId != this._senderId) {
                    if (parsed.documentId == this.document.id) {
                        this.diff = parsed;
                        this._todosObserver.next(this.diff);
                    }
                    if (parsed.documentStyle) {
                        this.document.style = parsed.documentStyle;
                    }
                }
            }
        })

        this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
            this.parseMap.generateParseMap(res);
            this._textParser = new Parser(this.parseMap.parseMap);
            this._jsonParser = new jsonToHtml(this.parseMap.parseMap);
        });
    }

    public changeChapters(from, to, chapterIndex) {
        var fromChapter = this.document.chapters[from];
        this.document.chapters.splice(from, 1);
        this.document.chapters.splice(to, 0, fromChapter);
        this.sendDiff({ changeChapter: true, fromChapter: from, toChapter: to }, chapterIndex);
    }

    public changeStyle(id: string, newStyle: any) {
        var headers = new Headers();
        this._socket.send(JSON.stringify({ documentId: id, documentStyle: newStyle }));

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

    public parseDocument(callback: (parsedHTML: string) => void) {
        if (this._textParser == null || this._jsonParser == null) callback(null);
        this.getDocument2(this.document.id, (tempDoc: Document) => {
            var totalHTML: string = "";
            for (var c in tempDoc.chapters) {
                var lines: Line[] = tempDoc.chapters[c].lines;
                var parsedJSON = this._textParser.getParsedJSON(lines);
                var parsedHTML: string = this._jsonParser.getParsedHTML(parsedJSON);
                totalHTML += "<h1>" + tempDoc.chapters[c].header + "</h1>";
                totalHTML += parsedHTML;
            }
            callback(totalHTML);
        })
    }

    public parseSpecificDocument(documentId, callback: (parsedHTML: string) => void) {
        this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
            this.parseMap.generateParseMap(res);
            this._textParser = new Parser(this.parseMap.parseMap);
            this._jsonParser = new jsonToHtml(this.parseMap.parseMap);

            this.getDocument2(documentId, (tempDoc: Document) => {
                var totalHTML: string = "";
                for (var c in tempDoc.chapters) {
                    var lines: Line[] = tempDoc.chapters[c].lines;
                    var parsedJSON = this._textParser.getParsedJSON(lines);
                    var parsedHTML: string = this._jsonParser.getParsedHTML(parsedJSON);
                    totalHTML += "<h1>" + tempDoc.chapters[c].header + "</h1>";
                    totalHTML += parsedHTML;
                }
                callback(totalHTML);
            })
        });
    }

    public parseChapter(callback: (parsedHTML: string) => void) {
        if (this._textParser != null && this._jsonParser != null) {
            var lines: Line[] = this.document.chapters[this.currentChapter].lines;
            var parsedJSON = this._textParser.getParsedJSON(lines);
            var parsedHTML: string = this._jsonParser.getParsedHTML(parsedJSON);
            // this.document.style
            callback(parsedHTML);
        }
    }

    public sendDiff(diff: any, chapterIndex: any) {
        if (this._socket !== undefined && this._socket.readyState == this._socket.OPEN){
            var color = localStorage.getItem('id_color')
            if (color != null) {
                diff.color = color;
            } else {
                diff.color = '#' + Math.floor(Math.random() * 16777215).toString(16)
            }
            diff.senderId = this._senderId
            diff.documentId = this.document.id;
            diff.chapterIndex = chapterIndex;
            this._socket.send(JSON.stringify(diff));
        }
    }

    public getDocument2(documentId: string, callback: (document: Document) => any) {
        this.http.get('./document/' + documentId).map((res: Response) => res.json()).subscribe(res => {
            var tempDoc = new Document([], [], [], [], [], res);
            callback(tempDoc);
        })
    }

    public getDocument(documentId: string, callback: (document: Document) => any) {
        this.http.get('./document/' + documentId).map((res: Response) => res.json()).subscribe(res => {
            this.document = new Document([], [], [], [], [], res);
            callback(this.document);
        })
    }

    public getChapter(chapterIndex: number, callback: (chapter: any) => any) {
        console.log("get chapter")
        this.http.get('/documents/' + this.document.id + '/' + chapterIndex).map((res: Response) => res.json()).subscribe(res => {
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
        });
    }

    public getSnappets(callback: (snappets: any) => void) {
        this.http.get('./snappets').map((res: Response) => res.json()).subscribe(res => {
            console.log("we got snappets: " + JSON.stringify(res, null, 2))
            callback(res);
        })
    }
    public parseSingleDocument(documentId, callback: (phtml: string) => any) {
        this.parseSpecificDocument(documentId, (parsedHTML) => {
            callback(parsedHTML)
        })
    }
    
     public getFilesInDir(documentId, callback: (files: any) => void) {
         console.log("2 OK"+documentId)
        this.http.get('./getFilesInDir/'+documentId).map((res: Response) => res.json()).subscribe(res => {            
            console.log("we got files from dir: " + JSON.stringify(res, null, 2))
            callback(res);
        })
    }

}
