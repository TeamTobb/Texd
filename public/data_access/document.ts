//Singleton (eager initialization) - achieved through @Component-providers in app.js
import {Http, Headers, Response, RequestOptions} from 'angular2/http';
import {Injectable, bind} from 'angular2/core';
import {Component, ViewChild, Input, Output, Renderer, ElementRef} from 'angular2/core';

import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';
import {Document, Chapter, Paragraph} from "../domain/document.ts"
import {Diff} from "../domain/diff.ts";

@Injectable()
export class DocumentService{
    private _socket;

    private _document: Document = new Document([], [], [], [], [{}, {}, {}]);
    private _current_chapter: number;

    public _senderId : string;
    private _textParser : Parser;
    private _jsonParser : jsonToHtml;

    constructor(private http: Http){
        this._senderId = "" + Math.random();
        this._textParser = new Parser();
        this._jsonParser = new jsonToHtml();

        this._socket = new WebSocket('ws://localhost:3001');
        this._socket.onmessage = message => {
            var parsed = JSON.parse(message.data);
            if(this._senderId != parsed.senderId){
                if(parsed.newDiff){
                    var diff: Diff = new Diff([], [], [], [], [], parsed.newDiff);
                    if(diff.newchapter == true){
                        this.document.chapters.splice(diff.chapter+1, 0, new Chapter("New Chapter", [diff.paragraph]));
                    } else {
                       if(diff.newelement){
                            this.document.chapters[diff.chapter].paragraphs.splice(diff.index+1, 0, diff.paragraph);
                        }else {
                            this.document.chapters[diff.chapter].paragraphs[diff.index] = diff.paragraph;
                        }
                    }
                }
                if(parsed.message){
                    this.document.title = parsed.message;
                }
            }
        }
    }

     public changeName(){
        this._socket.send(JSON.stringify({ name: 'name', message: this._document.title, senderId: "hello" }));
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post('./document',
            JSON.stringify({ documentTitle: this._document.title}),
            {headers: headers}).subscribe(res => {
                console.log(res);
            }
        );
    }

    public sendDiff(diff: Diff){
        this._socket.send(JSON.stringify({senderId: this._senderId, newDiff: diff}));
    }
    //mock implementation
    public getDocument(documentId: number, callback: any){
        // Have to manually assign all of the parameters - TODO:
        this.http.get('./document').map((res: Response) => res.json()).subscribe(res => {
            this.document.title = res._title;
            this.document.documentname = res._documentname;
            this.document.id = res._idTest;
            this.document.authors = res._authors;
            this.document.chapters = res._chapters;

            for(var i = 0; i<this.document.chapters.length; i++){
                this.document.chapters[i].header = res._chapters[i]._header;
                this.document.chapters[i].paragraphs = res._chapters[i]._paragraphs;

                for(var j = 0; j<this.document.chapters[i].paragraphs.length; j++){
                    this.document.chapters[i].paragraphs[j].raw = res._chapters[i]._paragraphs[j]._raw;
                    this.document.chapters[i].paragraphs[j].metadata = res._chapters[i]._paragraphs[j]._metadata;
                }
            }
            callback();
        });
    }

    public getDocumentTest(){
        return this._document;
    }

    get document(): Document{
        return this._document;
    }

    set document(value){
        this._document = value;
    }

    getParsedJSON(rawParagraphs){
        return this._textParser.getParsedJSON(rawParagraphs)
    }
    getParsedHTML(documentJSON){
        return this._jsonParser.getParsedHTML(documentJSON);
    }
}
