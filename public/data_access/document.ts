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
        
        //TODO: Clean this up
        this._socket.onmessage = message => {
            var parsed = JSON.parse(message.data);  
                if(parsed.newDiff){
                    
                    var diff: Diff = new Diff([], [], [], [], [], [], [], [], parsed.newDiff); 
                    if(diff.newchapter == true){
                        if(this._senderId != parsed.senderId){
                            this.document.chapters.splice(diff.chapterIndex+1, 0, new Chapter("New Chapter", [diff.paragraph]));
                            this.document.chapters[diff.chapterIndex+1].id = parsed.elementId;    
                        } else{
                            this.document.chapters[diff.chapterIndex+1].id = parsed.elementId;
                        }
                    } else {
                       if(diff.newelement==true){
                            if(this._senderId != parsed.senderId){
                                this.document.chapters[diff.chapterIndex].paragraphs.splice(diff.index+1, 0, diff.paragraph);
                                this.document.chapters[diff.chapterIndex].paragraphs[diff.index+1].id = parsed.elementId;
                            } else {
                                this.document.chapters[diff.chapterIndex].paragraphs[diff.index+1].id = parsed.elementId;
                            }
                        }else if(this._senderId != parsed.senderId){
                            this.document.chapters[diff.chapterIndex].paragraphs[diff.index] = diff.paragraph;
                        }
                    }
                }
                if(parsed.message){
                    this.document.title = parsed.message;
                }
            }
             
        // }
    }

     public changeTitle(newTitle: string){
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post('./document',
            JSON.stringify({ documentTitle: newTitle}),
            {headers: headers}).subscribe(res => {
                // Only actually change the title and send socket messages if status==OK
                if(res.status==200){
                    this._socket.send(JSON.stringify({ name: 'name', message: newTitle, senderId: "hello" }));
                    this.document.title = newTitle; 
                }
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
            this.document.id = res._id; 
            this.document.title = res._title;
            this.document.documentname = res._documentname;
            this.document.idTest = res._idTest;
            this.document.authors = res._authors;
            this.document.chapters = res._chapters;

            for(var i = 0; i<this.document.chapters.length; i++){
                this.document.chapters[i].id = res._chapters[i]._id; 
                this.document.chapters[i].header = res._chapters[i]._header;
                this.document.chapters[i].paragraphs = []; 
                var paragraphLength = res._chapters[i]._paragraphs.length;  
                
                for(var j = 0; j<paragraphLength; j++){
                    this.document.chapters[i].paragraphs[j] = new Paragraph(res._chapters[i]._paragraphs[j]._raw, res._chapters[i]._paragraphs[j]._metadata);
                    this.document.chapters[i].paragraphs[j].id = res._chapters[i]._paragraphs[j]._id;
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
    public getDocuments() : Document[]{
        var documents: Document[] = [];
        var rawStart: String = "Hei #b bloggen #h1 dette er megastort # # ";
        var para = new Paragraph(rawStart, []);      
        var paras = [];
        paras.push(para);
        var chapters = [];

        chapters.push(new Chapter("Header kap 2", paras));
        chapters.push(new Chapter("Header kap 3", paras));
        var documentStart = new Document(1, "document1 ", "documentName", ["Borgar", "jorg", "Bjon", "thomasbassen"], chapters);
        var documentStart2 = new Document(2, "document2", "documentName", ["Bjon", "thomasbassen"], chapters);
        var documentStart3 = new Document(3, "document3", "documentName", ["Borgar", "jorg"], chapters);
                 
        documents.push(documentStart);
        documents.push(documentStart2);
        documents.push(documentStart3);
        return documents;   
        
    }
}
