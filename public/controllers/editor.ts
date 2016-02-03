import {ParseMap} from "../utils/parseMap.ts";
import {Component, ViewChild, Input, Output, Renderer} from 'angular2/core';
import {Http, Headers, Response, RequestOptions} from 'angular2/http';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {Injectable, bind} from 'angular2/core';


import {DocumentService} from '../data_access/document.ts';
import {Diff} from '../domain/diff.ts';
import {Document, Chapter, Paragraph} from '../domain/document.ts';
import 'rxjs/Rx';

import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';

@Component({
  selector: 'my-app',
  templateUrl:'views/editor.html', 
  providers: [DocumentService]
})

@Injectable()
export class EditorController{
    public socket = new WebSocket('ws://localhost:3001');
    public title = 'MEAN skeleton with typescript';
    public documentName = "Name of document";
    public documentText = "This is a standard text";
    public documentJSON = "This is a standard text";
    public documentHTML = "This is a standard text";
    public senderId : string = "" + Math.random;
    private parseMap = new ParseMap();
    private textParser : Parser = new Parser();
    private jsonParser : jsonToHtml = new jsonToHtml();

    constructor(public http: Http, private documentService: DocumentService) {
        this.getPlugins();
        
        var para = new Paragraph("#b this is a new paragraph#", []);
        
        // console.log(documentService.getDocument(0));  
        documentService.updateParagraph(0, new Diff(0, para, 2, true)); 
        // console.log(documentService.getDocument(0));
    }

    public changeName() {
        this.socket.send(JSON.stringify({ name: 'name', message: this.documentName, senderId: "hello" }));
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post('./document',
            JSON.stringify({ documentTitle: this.documentName}),
            {headers: headers}).subscribe(res => {
                console.log(res); 
                // this.documentName = re
            }
        );
    }

    public changeDocument(){
        var para = new Paragraph(this.documentText, []);
        var diff: Diff = new Diff(0, para, 2, true); 
        this.socket.send(JSON.stringify({senderId: this.senderId, newDiff: diff}));
        // this.documentJSON = this.textParser.getParsedJSON(this.documentText);
        this.documentHTML = this.jsonParser.getParsedHTML(this.documentJSON);
    }

    ngAfterViewInit() {
        this.getDocument();
        this.socket.onmessage = message => {
            var parsed = JSON.parse(message.data);
            if(this.senderId != parsed.senderId){
                if(parsed.newDiff){
                    this.documentText = parsed.newDiff._paragraph._raw;    
                } 
                
                if(parsed.message){
                    this.documentName = parsed.message; 
                }   
            }
             
            
            // console.log(JSON.stringify(parsed)); 

          /*  if (parsed.data.name == "name") {
                this.documentName = parsed.data.message;
            }
            if (parsed.data.name == "document") {
                this.documentText = parsed.data.message;
            }*/
        }
    }

    getDocument(){
        this.http.get('./document').map((res: Response) => res.json()).subscribe(res => {
            this.documentText = res._chapters[0]._paragraphs[0]._raw; 
            this.documentName = res._title;
            // this.documentJSON = this.textParser.getParsedJSON(this.documentText);
            this.documentHTML = this.jsonParser.getParsedHTML(this.documentJSON);
        });
    }

    getPlugins(){
        this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
            this.parseMap.generateParseMap(res);
        });
    }
}
