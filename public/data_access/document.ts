//Singleton (eager initialization) - achieved through @Component-providers in app.js
import {Http, Headers, Response, RequestOptions} from 'angular2/http';
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

    private _document: Document = new Document([], [], [], [], [{}, {}, {}]);

    public _senderId: string;
    private _textParser: Parser = null;
    private _jsonParser: jsonToHtml = null;
    private snappetParser: SnappetParser;
    public changeOrder: any = {
        from: {},
        to: {},
        text: {}
    }

    constructor(private http: Http) {
        this._senderId = "" + Math.random();

        this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
            this.parseMap.generateParseMap(res);
            this._textParser = new Parser(this.parseMap.parseMap);
            this._jsonParser = new jsonToHtml(this.parseMap.parseMap);
        });

        this._socket = new WebSocket('ws://localhost:3001');
        this._socket.onmessage = message => {
            var parsed = JSON.parse(message.data)
            if(parsed.senderId != this._senderId){
                this.changeOrder.from = parsed.from
                this.changeOrder.to = parsed.to
                this.changeOrder.text = parsed.text
            }


            // var parsed = JSON.parse(message.data);
            // if (parsed.newDiff) {
            //     var diff: Diff = new Diff([], [], [], [], [], [], [], [], parsed.newDiff);

            //     if (diff.documentId == this.document.id) {
            //         if (diff.newchapter == true) {
            //             this.document.chapters[diff.chapterIndex + 1].id = parsed.elementId;
            //             if (this._senderId != parsed.senderId) {
            //                 this.document.chapters.splice(diff.chapterIndex + 1, 0, new Chapter("New Chapter", [diff.paragraph]));
            //             }
            //         } else {
            //             if (diff.newelement == true) {
            //                 this.document.chapters[diff.chapterIndex].paragraphs[diff.index + 1].id = parsed.elementId;
            //                 if (this._senderId != parsed.senderId) {
            //                     this.document.chapters[diff.chapterIndex].paragraphs.splice(diff.index + 1, 0, diff.paragraph);
            //                 }
            //             } else if (this._senderId != parsed.senderId) {
            //                 this._document.chapters.forEach((chapter) => {
            //                     if(chapter.id == diff.chapterId){
            //                         // chapter.paragraphs[diff.index] = diff.paragraph
            //                         chapter.paragraphs[diff.index].raw = diff.paragraph.raw;
            //                         chapter.paragraphs[diff.index].metadata = diff.paragraph.metadata
            //                     }
            //                 })
            //             } else if (this._senderId != parsed.senderId) {
            //                     this.document.chapters[diff.chapterIndex].paragraphs[diff.index].raw = diff.paragraph.raw;
            //                     this.document.chapters[diff.chapterIndex].paragraphs[diff.index].metadata = diff.paragraph.metadata
            //                 }
            //             }
            //         }
            //     }
            //     if (parsed.title && parsed.documentId == this.document.id) {
            //         this.document.title = parsed.title;
            //     }
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
        this.http.post('./document/' + id,
            JSON.stringify({ documentTitle: newTitle }),
            { headers: headers }).subscribe(res => {
                // Only actually change the title and send socket messages if status==OK
                if (res.status == 200) {
                    this._socket.send(JSON.stringify({ name: 'name', documentId: id, title: newTitle, senderId: "hello" }));
                    this.document.title = newTitle;
                }
            }
            );
    }

    //TODO implement changeChapterName() new URL
    public changeChapterName(documentId: string, newchapterName: string, chapterId: number) {
        console.log(documentId)
        console.log(chapterId)

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

    public parseChapter(currentChapter, callback: (parsedHTML : string) => void) {
        if(this._textParser != null && this._jsonParser != null) {
            var lines : Line[] = this.document.chapters[currentChapter].lines;
            var parsedJSON = this._textParser.getParsedJSON(lines);
            var parsedHTML : string = this._jsonParser.getParsedHTML(parsedJSON);
            callback(parsedHTML);
        }
    }

    // public parseChapter(currentChapter, callback: (parsedParagraphs: string[]) => void) {
    //     //TODO its not suppose to be a GET
    //     this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
    //         this.parseMap.generateParseMap(res);
    //         this._textParser = new Parser(this.parseMap.parseMap);
    //         this._jsonParser = new jsonToHtml(this.parseMap.parseMap);
    //
    //         var nonParsedParagraphs: Paragraph[] = this.document.chapters[currentChapter].lines;
    //         var parsedParagraphs: string[] = [];
    //
    //         for (var index = 0; index < nonParsedParagraphs.length; index++) {
    //             var element: Paragraph = nonParsedParagraphs[index];
    //             var parsedElem = this._textParser.getParsedJSONSingle(element)
    //             var html = this._jsonParser.getParsedHTML(parsedElem)
    //             parsedParagraphs.push(html);
    //         }
    //         callback(parsedParagraphs);
    //     });
    // }

    // public parseSingleParagraph(para: Paragraph): string {
    //     var parsedJSON: string = this._textParser.getParsedJSONSingle(para);
    //     return this._jsonParser.getParsedHTML(parsedJSON);
    // }

    public sendDiff(diff: any, chapterId: string) {
        // diff.documentId = this.document.id
        // this._socket.send(JSON.stringify({ senderId: this._senderId, newDiff: diff }));
        diff.senderId = this._senderId;
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
