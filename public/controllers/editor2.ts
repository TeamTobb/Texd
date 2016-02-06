import {ParseMap} from "../utils/parseMap.ts";
import {Component, ElementRef, Renderer} from 'angular2/core';
import {HTTP_BINDINGS} from 'angular2/http';
import {Injectable,} from 'angular2/core';
import 'rxjs/Rx';

import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';
import {Document, Paragraph, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';

@Component({
  selector: 'my-app',
  templateUrl:'views/editor2.html',
  providers: [DocumentService, HTTP_BINDINGS]
})

export class EditorController2 {
    // Have to do this cause of HTML file expecting multiple chapters on load - error otherwise.
    // TODO: fix this
    private document: Document;
    public current_chapter : number = 0;
    public modifierKeyDown : boolean = false;
    public element : ElementRef;
    public documentHTML : string = "preview";

    // CTRL + P = parse
    // CTRL + N = new paragraph

    constructor(public currElement: ElementRef, private documentService: DocumentService, public renderer: Renderer ) {
        this.document = this.documentService.document;
        this.element = currElement;
        renderer.listenGlobal('document', 'keydown', ($event) => {
            this.globalKeyEvent($event);
        });
        this.documentService.getDocument(2, () => {
            setTimeout( () => {
                var elem = jQuery(this.element.nativeElement).find('[id=para]').toArray();
                for (var i in elem) {
                    this.auto_grow(elem[i]);
                }
            }, 10);
        })
    }

     public createChapter() {
         var p = new Paragraph("Text", []);
        this.document.chapters.splice(this.current_chapter+1, 0, new Chapter("New Chapter", [p]));
        this.documentService.sendDiff(new Diff(this.current_chapter, p, 0, true, true));
        this.current_chapter += 1;
    }

    public gotoChapter($event, text) {
        if($event.which === 13) {
            if(this.document.chapters[text]) {
                this.current_chapter = parseInt(text);
            }
        }
    }

    public changeDocumentTitle($event) {
        if(!($event.target.innerHTML == this.document.title)){
            this.documentService.changeTitle($event.target.innerHTML); 
        } 
    }

    public changeChapter(chapter_number : number) {
        this.current_chapter = chapter_number;
        setTimeout( () => {
            var elem = jQuery(this.element.nativeElement).find('[id=para]').toArray();
            for (var i in elem) {
                this.auto_grow(elem[i]);
            }
        }, 10);
    }

    public globalKeyEvent($event) {
        console.log($event.which);
        var keyMap = {};
        keyMap[80] = () => {
            console.log("ctrl+p");
            this.parseCurrentChapter();
        }
        keyMap[67] = () => {
            console.log("ctrl+c");
            this.createChapter();
        }
        keyMap[82] = () => {
            console.log("ctrl+r");
            // this.document.chapters[this.current_chapter].header =
        }
        if($event.ctrlKey) {
            if (keyMap[$event.which]) {
                keyMap[$event.which]();
            }
        }
    }

    public parseCurrentChapter() {
        console.log("parsing");
        var rawParagraphs = this.document.chapters[this.current_chapter].paragraphs;
        var documentJSON = this.documentService.getParsedJSON(rawParagraphs);
        this.documentHTML = this.documentService.getParsedHTML(documentJSON);
        // update previewFrame
        var doc = jQuery(this.element.nativeElement).find('#previewFrame')[0].contentWindow.document;
        doc.open();
        doc.write(this.documentHTML);
        doc.close();
    }

    public modifierKeyDownPress($event) {
        if($event.which === 17) {
            this.modifierKeyDown = true;
        }
    }

    public changeDocument($event, paragraphIndex : number) {
        this.auto_grow($event.target);
        if ($event.which === 17) {
            this.modifierKeyDown = false;
        }
        else if ($event.which === 80 && this.modifierKeyDown) {
            this.parseCurrentChapter();
        }
        else if ($event.which === 78 && this.modifierKeyDown) {
            this.document.chapters[this.current_chapter].paragraphs.splice(paragraphIndex+1,0, new Paragraph("",[]));
            var diff: Diff = new Diff(this.current_chapter, new Paragraph("", []), paragraphIndex, true, false);
            this.documentService.sendDiff(diff);
        }
        else {
            var para: Paragraph = new Paragraph(this.document.chapters[this.current_chapter].paragraphs[paragraphIndex].raw, []);
            var diff: Diff = new Diff(this.current_chapter, para, paragraphIndex, false, false);
            this.documentService.sendDiff(diff);
        }
    }

    public auto_grow(element) {
        element.style.height = "5px";
        element.style.height = (element.scrollHeight)+"px";
    }
}
