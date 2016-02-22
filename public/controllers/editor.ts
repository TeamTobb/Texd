import {ParseMap} from "../utils/parseMap.ts";
import {Component, ElementRef, Renderer, Input, AfterViewInit, OnChanges, SimpleChange} from 'angular2/core';
import {Http, HTTP_BINDINGS, Response} from 'angular2/http';
import {Injectable, } from 'angular2/core';
import {RouteParams} from 'angular2/router';
import 'rxjs/Rx';

import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';
import {Document, Paragraph, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
import {ChapterItem} from './chapteritem.ts'
import {CmComponent} from './cmcomponent.ts'
import {SnappetParser} from "../utils/snappetParser.ts";

import {CORE_DIRECTIVES} from 'angular2/common';
import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';


@Component({
    selector: 'my-app',
    templateUrl: 'views/editor.html',
    providers: [DocumentService, HTTP_BINDINGS],
    directives: [ChapterItem, CmComponent, DROPDOWN_DIRECTIVES, CORE_DIRECTIVES]
})

export class EditorController {
    private document: Document = new Document([], [], [], [], [{}, {}, {}]);
    // @Input() document;
    public current_chapter: number = 0;
    public current_paragraph: number = 0; 
    public modifierKeyDown: boolean = false;
    public element: ElementRef;
    public documentHTML: string = "preview";
    private snappetParser: SnappetParser;
    public parsedParagraph: string[] = [];
    public parseMap: ParseMap = new ParseMap();
    private _textParser: Parser;
    private _jsonParser: jsonToHtml;
    private cmFocused : boolean[] = [];

    // CTRL + P = parse
    // CTRL + N = new paragraph

    constructor(private http: Http, public currElement: ElementRef, private documentService: DocumentService, public renderer: Renderer, private _routeParams: RouteParams) {
        this.element = currElement;
        renderer.listenGlobal('document', 'keydown', ($event) => {
            this.globalKeyEvent($event);
        });
        if (this._routeParams.get('id')) {
            this.documentService.getDocument(this._routeParams.get('id'), (document2) => {
                this.document = document2;
                this.parseAllPara()
            })
        }

        this.http.get('./snappets').map((res: Response) => res.json()).subscribe(res => {
            console.log(JSON.stringify(res, null, 2));
            var snappets: any[] = [];
            // JSON.parse(res);
            // res.forEach((snappet) => {
            //     snappets.push(snappet);
            // })
            this.snappetParser = new SnappetParser(this.element, res);

            // this.parseMap.generateParseMap(res);
            // this._textParser = new Parser(this.parseMap.parseMap);
            // this._jsonParser = new jsonToHtml(this.parseMap.parseMap);
        });
    }

    public cmOnFocusEmit(index) {
        for(var i = 0; i < this.document.chapters[this.current_chapter].paragraphs.length; i++) {
            if(i != index) {
                this.cmFocused[i] = false;
            } else{
                this.cmFocused[i] = true; 
                this.current_paragraph = index; 
            }
        }
     }

    public parseAllPara() {
        this.http.get('./plugins').map((res: Response) => res.json()).subscribe(res => {
            this.parseMap.generateParseMap(res);
            this._textParser = new Parser(this.parseMap.parseMap);
            this._jsonParser = new jsonToHtml(this.parseMap.parseMap);

            var nonParsedParagraphs: Paragraph[] = this.document.chapters[this.current_chapter].paragraphs

            for (var index = 0; index < nonParsedParagraphs.length; index++) {
                var element: Paragraph = nonParsedParagraphs[index];
                var parsedElem = this._textParser.getParsedJSONSingle(element)
                var html = this._jsonParser.getParsedHTML(parsedElem)
                this.parsedParagraph.push(html);
            }
        });
    }

    public outdatedParsedParagraph(paragraphIndex: number) {
        var element: Paragraph = this.document.chapters[this.current_chapter].paragraphs[paragraphIndex]
        if(this._textParser) {
            var parsedElem = this._textParser.getParsedJSONSingle(element)
            var html = this._jsonParser.getParsedHTML(parsedElem)
            // console.log("Old: " + this.parsedParagraph[paragraphIndex])
            // console.log("new: " + html)
            this.parsedParagraph[paragraphIndex] = html
        }
    }


    //TODO implement this, to be deleted in DB
    public deleteChapterFromDB(value: string) {
        console.log("deleteChapterFromDB(" + value + ")");

        var chapters: Chapter[] = this.documentService.document.chapters;

        for (var index = 0; index < chapters.length; index++) {
            var element = chapters[index];
            if (element.id == value) {
                chapters.splice(index, 1);
                break;
            }
        }

    }

    public createChapter() {
        var p = new Paragraph("Text", []);
        this.document.chapters.splice(this.current_chapter + 1, 0, new Chapter("New Chapter", [p]));
        var diff: Diff = new Diff(this.document.id, this.document.chapters[this.current_chapter].id, this.current_chapter, {}, p, 0, false, true);
        this.documentService.sendDiff(diff);
        this.current_chapter += 1;
    }

    public gotoChapter($event, text) {
        if ($event.which === 13) {
            if (this.document.chapters[text]) {
                this.current_chapter = parseInt(text);
            }
        }
    }

    public changeDocumentTitle($event) {
        if (!($event.target.innerHTML == this.document.title)) {
            this.documentService.changeTitle(this.document.id, $event.target.innerHTML);
        }
    }

    public changeChapter(chapter_number: number) {
        console.log("CHANGE CHAPTER:   changeChapter(chapter_number : " + chapter_number + ")")
        this.current_chapter = chapter_number;
    }

    public globalKeyEvent($event) {
        console.log($event.which);
        var keyMap = {};
        keyMap[69] = () => {
            var next = 10;
            var node = document.getSelection().anchorNode;
            if (node.nodeType == 3) {
                console.log("sending node: " + node.parentNode)
                this.snappetParser.nextPlaceholder(node.parentNode);
            } else {
                this.snappetParser.nextPlaceholder(node);
                console.log("sending node: " + node)
            }
        }
        keyMap[78] = () => {
            this.document.chapters[this.current_chapter].paragraphs.splice(this.current_paragraph + 1, 0, new Paragraph("...", []));
            var diff: Diff = new Diff(this.document.id, this.document.chapters[this.current_chapter].id, this.current_chapter, "", new Paragraph("...", []), this.current_paragraph, true, false)
            this.documentService.sendDiff(diff);
        }
        keyMap[80] = () => {
            console.log("ctrl+p");
            this.parseCurrentChapter();
        }
        keyMap[67] = () => {
            console.log("ctrl+c");
            this.createChapter();
        }
        
        if ($event.ctrlKey) {
            if (keyMap[$event.which]) {
                $event.preventDefault();
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
        if ($event.which === 17) {
            this.modifierKeyDown = true;
        }
    }

    public changeDocument($event, paragraphIndex: number) {
        console.log("changedocument");
        // this.auto_grow($event.target);
        if ($event.which === 17) {
            this.modifierKeyDown = false;
        }
        else if ($event.which === 80 && this.modifierKeyDown) {
            this.parseCurrentChapter();
        }
        else if ($event.which === 78 && this.modifierKeyDown) {
            this.document.chapters[this.current_chapter].paragraphs.splice(paragraphIndex + 1, 0, new Paragraph("", []));
            var diff: Diff = new Diff(this.document.id, this.document.chapters[this.current_chapter].id, this.current_chapter, "", new Paragraph("", []), paragraphIndex, true, false)
            this.documentService.sendDiff(diff);
        }
        else {
            var para: Paragraph = this.document.chapters[this.current_chapter].paragraphs[paragraphIndex];
            var diff: Diff = new Diff(this.document.id, this.document.chapters[this.current_chapter].id, this.current_chapter, para.id, para, paragraphIndex, false, false)
            this.documentService.sendDiff(diff);
        }
    }
}

export class DropdownDemo {
  private disabled:boolean = false;
  private status:{isopen:boolean} = {isopen: false};
  private items:Array<string> = ['The first choice!', 'And another choice for you.', 'but wait! A third!'];

  private toggled(open:boolean):void {
    console.log('Dropdown is now: ', open);
  }

  private toggleDropdown($event:MouseEvent):void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }
}
