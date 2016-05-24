import {Http, Headers, Response, RequestOptions} from 'angular2/http';
import {AuthHttp, AuthConfig, JwtHelper} from "angular2-jwt/angular2-jwt";
import {Injectable, bind} from 'angular2/core';
import {Component, ViewChild, Input, Output, Renderer, ElementRef} from 'angular2/core';
import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';
import {Document, Chapter, Line} from "../domain/document.ts"
import {Observable} from 'rxjs/Observable';
import {ParseMap} from "../utils/parseMap.ts";
import {EditorController} from '../controllers/editor/editor.ts'
import {Observer} from 'rxjs/Observer';

@Injectable()
export class DocumentService {
    private _socket: WebSocket;
    public parseMap: ParseMap = new ParseMap();
    private _document: Document = new Document([], [], [], [], [{}, {}, {}]);
    public _senderId: string;
    private _textParser: Parser = null;
    private _jsonParser: jsonToHtml = null;
    private jwthelper;
    public cm: any;
    public diffObserver: Observable<any>;
    private _todosObserver: Observer<any>;
    public newDocObserver: Observable<any>;
    private _newDocObserver: Observer<any>;
    public deleteDocObserver: Observable<any>;
    private _deleteDocObserver: Observer<any>;
    private refreshDocuments = false
    public diff: any = {};
    public ip: string;
    public port: string;


    constructor(private http: Http, private authHttp: AuthHttp) {
        this.diffObserver = new Observable(observer => this._todosObserver = observer).startWith(this.diff).share();
        this.newDocObserver = new Observable(observer => this._newDocObserver = observer).startWith().share();
        this.deleteDocObserver = new Observable(observer => this._deleteDocObserver = observer).startWith().share();
        this.jwthelper = new JwtHelper()
        var token = localStorage.getItem('id_token')

        if (token != null && typeof (token) != 'undefined') {
            var decoded = this.jwthelper.decodeToken(token)
            this._senderId = decoded.username
        } else {
            this._senderId = "" + Math.random();
        }

        this.http.get('./wsip').map((res: Response) => res.json()).subscribe(res => {
            this.ip = res.ip;
            this.port = res.httpPort;
            // getting plugins after getting ip and port
            this.getPlugins(() => {
            });
            this._socket = new WebSocket('ws://' + res.ip + ':' + res.wsPort);
            this._socket.onmessage = message => {
                var parsed = JSON.parse(message.data)

                if (parsed.newDocument) {
                    this._newDocObserver.next(parsed.document);
                } else if (parsed.deleteDocument){
                    this._deleteDocObserver.next(parsed.documentid);                             
                } else if (parsed.newplugin) {
                    this.getPlugins(() => { });
                } else if (parsed.senderId != this._senderId) {
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
    }

    public getPlugins(callback) {
        this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
            this.parseMap.generateParseMap(res);
            this._textParser = new Parser(this.parseMap.parseMap, this.ip, this.port);
            this._jsonParser = new jsonToHtml(this.parseMap.parseMap);
            callback();
        });
    }

    public postPlugin(plugin, callback) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post('./plugins', JSON.stringify({ plugin: plugin }), { headers: headers }).map((res: Response) => res.json()).subscribe(
            (res) => {
                if (res.success == true) {
                    this.getPlugins(() => { });
                    callback();
                }
            }, (err) => {
                console.log(err);
            })
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

    public parseDocument(callback: (parsedHTML: string) => void) {
        if (this._textParser == null || this._jsonParser == null) callback(null);
        this.getDocument2(this.document.id, (tempDoc: Document) => {
            var totalHTML: string = "";
            for (var c in tempDoc.chapters) {
                if (c == "0") {
                    totalHTML += "<h1 id='firstpage'>" + tempDoc.chapters[c].header + "</h1>";
                } else if(c == "1"){
                    totalHTML += "<div class=\"toc\"></div>";
                    totalHTML += "<h1 id=\"" + tempDoc.chapters[c].header.replace(/\s+/g, '-').toLowerCase() + "\">" + tempDoc.chapters[c].header + "</h1>";
                }
                else {
                    totalHTML += "<h1 id=\"" + tempDoc.chapters[c].header.replace(/\s+/g, '-').toLowerCase() + "\">" + tempDoc.chapters[c].header + "</h1>";
                }
                var lines: Line[] = tempDoc.chapters[c].lines;
                var parsedJSON = this._textParser.getParsedJSON(lines, this.ip, this.port);
                var parsedHTML: string = this._jsonParser.getParsedHTML(parsedJSON);
                totalHTML += parsedHTML;
            }
            var el = document.createElement('html');
            el.innerHTML = totalHTML;
            var contentHTML = "";
            contentHTML += "<ol>";
            for (var i = 0; i < el.children[1].children.length; i++) {
                if (el.children[1].children[i].tagName == "H1") {
                    contentHTML += "<li><a href=\"#" + el.children[1].children[i].textContent.replace(/\s+/g, '-').toLowerCase() + "\">" + el.children[1].children[i].textContent + "</a></li>";
                    contentHTML += "<ol>";
                    for (var j = i + 1; j < el.children[1].children.length; ++j) {
                        if (el.children[1].children[j].tagName == "H2") {
                            el.children[1].children[j].id = el.children[1].children[j].textContent.replace(/\s+/g, '-').toLowerCase();
                            contentHTML += "<li><a href=\"#" + el.children[1].children[j].textContent.replace(/\s+/g, '-').toLowerCase() + "\">" + el.children[1].children[j].textContent + "</a></li>";
                        }
                        if (el.children[1].children[j].tagName == "H1") {
                            i = j - 1;
                            break;
                        }
                    }
                    contentHTML += "</ol>";
                }
            }
            contentHTML += "</ol>"
            if (tempDoc.chapters.length > 1) {
                el.getElementsByClassName('toc')[0].innerHTML = contentHTML;
            }
            callback(el.innerHTML);
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
                    var parsedJSON = this._textParser.getParsedJSON(lines, this.ip, this.port);
                    var parsedHTML: string = this._jsonParser.getParsedHTML(parsedJSON);
                    totalHTML += "<h1>" + tempDoc.chapters[c].header + "</h1>";
                    totalHTML += parsedHTML;
                }
                callback(totalHTML);
            })
        });
    }

    public getCurrentChapterLines(): Line[] {
        if (this.cm == null) return;
        var lineList: Line[] = [];
        for (var i = 0; i < this.cm.lineCount(); i++) {
            var text: string = this.cm.getLine(i);
            lineList.push(new Line(text, []));
        }
        return lineList;
    }

    public parseChapter(callback: (parsedHTML: string) => void) {
        if (this._textParser != null && this._jsonParser != null) {
            var lines: Line[] = this.getCurrentChapterLines();
            var parsedJSON = this._textParser.getParsedJSON(lines, this.ip, this.port);
            var parsedHTML: string = this._jsonParser.getParsedHTML(parsedJSON);
            callback(parsedHTML);
        }
    }

    public sendDiff(diff: any, chapterIndex: any) {
        if (this._socket !== undefined && this._socket.readyState == this._socket.OPEN) {
            var color = localStorage.getItem('id_color') == null ? sessionStorage.getItem('id_color') : localStorage.getItem('id_color')
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
    
    public deleteDocument(documentId: string, callback: () => any) {
        console.log("Delte doc in Document Serverice ");        
        this.http.delete('./document/' + documentId).map((res: Response) => res.json()).subscribe(res => {
            callback();
        })
    }

    public getChapter(chapterIndex: number, callback: (chapter: any) => any) {
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
            for (var doc in res) {
                documents.push(new Document([], [], [], [], [], res[doc]))
            }
            callback(documents);
        });
    }

    public getSnippets(callback: (snippets: any) => void) {
        this.http.get('./snippets').map((res: Response) => res.json()).subscribe(res => {
            callback(res);
        })
    }
    public parseSingleDocument(documentId, callback: (phtml: string) => any) {
        this.parseSpecificDocument(documentId, (parsedHTML) => {
            callback(parsedHTML)
        })
    }

    public getFilesInDir(documentId, callback: (files: any) => void) {
        this.http.get('./getFilesInDir/' + documentId).map((res: Response) => res.json()).subscribe(res => {
            callback(res);
        })
    }

    public createNewDocument(callback: (files: any) => void) {
        if (this._socket !== undefined && this._socket.readyState == this._socket.OPEN) {
            this._socket.send(JSON.stringify({ newDocument: true }));
        }
    }
}
