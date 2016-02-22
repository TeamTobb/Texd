//Singleton (eager initialization) - achieved through @Component-providers in app.js
import {Http, Headers, Response, RequestOptions} from 'angular2/http';
import {Injectable, bind} from 'angular2/core';
import {Component, ViewChild, Input, Output, Renderer, ElementRef} from 'angular2/core';

import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';
import {Document, Chapter, Paragraph} from "../domain/document.ts"
import {Diff} from "../domain/diff.ts";
import {ParseMap} from "../utils/parseMap.ts";
import {SnappetParser} from "../utils/snappetParser.ts";

@Injectable()
export class DocumentService {
    private _socket;
    public parseMap: ParseMap = new ParseMap();

    private _document: Document = new Document([], [], [], [], [{}, {}, {}]);

    public _senderId: string;
    private _textParser: Parser;
    private _jsonParser: jsonToHtml;
    private snappetParser: SnappetParser; 

    constructor(private http: Http) {
        this._senderId = "" + Math.random();

        this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
            this.parseMap.generateParseMap(res);
            this._textParser = new Parser(this.parseMap.parseMap);
            this._jsonParser = new jsonToHtml(this.parseMap.parseMap);
        });
    
        // this._textParser = new Parser();
        // this._jsonParser = new jsonToHtml(this.parseMap.parseMap);

        this._socket = new WebSocket('ws://localhost:3001');
        //TODO: Clean this up
        this._socket.onmessage = message => {
            var parsed = JSON.parse(message.data);
                if (parsed.newDiff) {
                    var diff: Diff = new Diff([], [], [], [], [], [], [], [], parsed.newDiff);
                    if(diff.documentId == this.document.id){
                        if (diff.newchapter == true) {
                            if (this._senderId != parsed.senderId) {
                                this.document.chapters.splice(diff.chapterIndex + 1, 0, new Chapter("New Chapter", [diff.paragraph]));
                                this.document.chapters[diff.chapterIndex + 1].id = parsed.elementId;
                            } else {
                                this.document.chapters[diff.chapterIndex + 1].id = parsed.elementId;
                            }
                        } else {
                            if (diff.newelement == true) {
                                if (this._senderId != parsed.senderId) {
                                    this.document.chapters[diff.chapterIndex].paragraphs.splice(diff.index + 1, 0, diff.paragraph);
                                    this.document.chapters[diff.chapterIndex].paragraphs[diff.index + 1].id = parsed.elementId;
                                } else {
                                    this.document.chapters[diff.chapterIndex].paragraphs[diff.index + 1].id = parsed.elementId;
                                }
                            } else if (this._senderId != parsed.senderId) {
                                this.document.chapters[diff.chapterIndex].paragraphs[diff.index] = diff.paragraph;
                            }
                        }
                    }
                } if (parsed.message && parsed.documentId == this.document.id) {
                    this.document.title = parsed.message;
                }
        }
    }

    public changeTitle(id: string, newTitle: string) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post('./document/' + id,
            JSON.stringify({ documentTitle: newTitle }),
            { headers: headers }).subscribe(res => {
                // Only actually change the title and send socket messages if status==OK
                if (res.status == 200) {
                    this._socket.send(JSON.stringify({ name: 'name', documentId: id, message: newTitle, senderId: "hello" }));
                    this.document.title = newTitle;
                }
            }
            );
    }

    //TODO implement changeChapterName()
    //this.documentService.changeChapterName("1", newName, 1);
    public changeChapterName(documentId: string, newchapterName: string, chapterId: number) {
        console.log(documentId)
        console.log(chapterId)

        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post('./document/' + documentId,
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

    public deleteChapter(chapterName: string) {
        console.log(this.document.chapters)
    }


    public sendDiff(diff: Diff) {
        this._socket.send(JSON.stringify({ senderId: this._senderId, newDiff: diff }));
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

    getParsedJSON(rawParagraphs) {
        return this._textParser.getParsedJSON(rawParagraphs)
    }
    getParsedHTML(documentJSON) {
        return this._jsonParser.getParsedHTML(documentJSON);
    }
    public getDocuments(callback: (documents: Document[]) => void) {
        var documents: Document[] = Array<Document>();
        this.http.get('./documents').map((res: Response) => res.json()).subscribe(res => {
            res.forEach((document) => {
                documents.push(new Document([], [], [], [], [], document));
                callback(documents);
            })
            console.log(JSON.stringify(documents,null,2));
        });
    }
    
    public testDiffSend(diff: Diff){
        diff.documentId = this.document.id 
        diff.chapterIndex = 0; 
        this._socket.send(JSON.stringify({ senderId: this._senderId, newDiff: diff }));
    }
}
