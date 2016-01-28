import {Component, ViewChild, Input, Output, Renderer} from 'angular2/core';
import {Http, Headers, Response, RequestOptions} from 'angular2/http';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {Injectable, bind} from 'angular2/core';
import 'rxjs/Rx';

import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';

@Component({
  selector: 'my-app',
  templateUrl:'views/editor.html'
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

    public textParser : Parser = new Parser();
    public jsonParser : jsonToHtml = new jsonToHtml();

    constructor(public http: Http) {
    }

    public changeName = function() {
        this.socket.send(JSON.stringify({ name: 'name', message: this.documentName, senderId: "hello" }));
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.http.post('./document',
            JSON.stringify({ documentTitle: this.documentName}),
            {headers: headers}).subscribe(res => {
                console.log(res);
            }
        );
    }

    public changeDocument = function() {
        this.socket.send(JSON.stringify({ name: 'document', message: this.documentText, senderId: this.senderId }));
        this.documentJSON = this.textParser.getParsedJSON(this.documentText);
        this.documentHTML = this.jsonParser.getParsedHTML(this.documentJSON);
    }

    ngAfterViewInit() {
        this.getDocument();
        this.socket.onmessage = message => {
            var parsed = JSON.parse(message.data);
            if (this.senderId != parsed.data.senderId) {
                console.log("You are not the sender");
                if (parsed.data.name == "name") {
                    this.documentName = parsed.data.message;
                }
                if (parsed.data.name == "document") {
                    this.documentText = parsed.data.message;
                }
              }
              else {
                    console.log("You are the sender");
              }
          }
    }

    getDocument(){
        this.http.get('./document').map((res: Response) => res.json()).subscribe(res => {
            this.documentText = res.text;
            this.documentName = res.title;
            this.documentJSON = this.textParser.getParsedJSON(this.documentText);
            this.documentHTML = this.jsonParser.getParsedHTML(this.documentJSON);
        });
    }
}
