import {ChapterItem} from "./chapteritem";
import {Component, OnInit, Input, Output, AfterViewInit, ElementRef, OnChanges, SimpleChange} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {Router} from 'angular2/router';
import {Document, Line, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
import {EventEmitter} from "angular2/src/facade/async";
import {Widget, BoldWidget, HeaderWidget, ItalicWidget, UnderlineWidget, ImageWidget} from "./widget.ts";
import {WidgetParser} from "../utils/widgetParser.ts";

function posEq(a, b) { return a.line == b.line && a.ch == b.ch; }

@Component({
    selector: 'cmcomponent',
    templateUrl: 'views/components/cmcomponent.html',
    directives: [ChapterItem]
})
export class CmComponent implements AfterViewInit, OnChanges {
    @Input() lines: Line[];
    @Input() document : Document;
    @Input() chapterId: string;
    @Input() changeOrderFrom: any;
    @Input() changeOrderTo: any;
    @Input() changeOrderText: any;

    public editor;

    public widgetTest;

    public isInitialized = false;

    constructor(private element: ElementRef, private documentService: DocumentService) {
        this.setupCMAutocomplete();
        console.log("chapterid: " + this.chapterId);
    }

    //Parsing on all changes
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if(!this.isInitialized) {
            if (changes["lines"] && this.editor !== undefined) {
                var arr = [];
                for (var line in this.lines) {
                    arr.push(this.lines[line].raw);
                }
                this.editor.getDoc().replaceRange(arr, { line: 0, ch: 0 });
                this.isInitialized = true;
            }
        }
        if ((changes["changeOrderFrom"] || changes["changeOrderTo"] || changes["changeOrderText"]) && (this.editor != undefined)) {
            console.log("we have changes in changeorder: " + JSON.stringify(changes, null, 2))
            this.editor.getDoc().replaceRange(this.changeOrderText, this.changeOrderFrom, this.changeOrderTo)
        }
    }

    ngAfterViewInit() {
        this.editor = CodeMirror.fromTextArea(document.getElementById("linesEditor"), {
            mode: "hashscript",
            lineNumbers: true,
            lineWrapping: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete"
            }
        })

        this.documentService.cm = this.editor;

        this.editor.on("change", (cm, change) => {
            console.log("CHANGE:: ");
            console.log(change);
            console.log(change.origin);
            if (change.origin != "setValue" && change.origin != "+onParse") {
                for (var r in change.removed) {
                    if (change.removed[r].indexOf("#") != -1) {
                        console.log("Removed a # - parsing widgets");
                        // fetch cursor
                        var cursorPos = this.editor.getCursor();
                        // do this inside the parseWidgets function instead ?
                        this.editor.setValue(this.editor.getValue());
                        this.parseWidgets(this.editor);
                        // need to set cursor back now
                        this.editor.setCursor(cursorPos);
                        break;
                    }
                }
                for (var r in change.text) {
                    if (change.text[r].indexOf("#") != -1) {
                        console.log("added a # - parsing widgets");
                        // fetch cursor
                        var cursorPos = this.editor.getCursor();
                        this.editor.setValue(this.editor.getValue());
                        this.parseWidgets(this.editor);
                        // need to set cursor back now
                        this.editor.setCursor(cursorPos);
                        break;
                    }
                }
            }
            if (typeof (change.origin) !== 'undefined') {
                if (change.origin != "setValue" && change.origin != "+onParse") {
                    this.documentService.sendDiff(change, this.chapterId);
                }
            }
        });

        this.editor.on("keypress", (cm, e) => {
            this.onKeyPressEvent(cm, e);
        });

        // should probably be defined somewhere else
        $("#insertbold").click(() => {
            // what to do about the enter function ?
            this.widgetTest = new BoldWidget(this.editor, null);
            this.editor.widgetEnter = $.proxy(this.widgetTest, 'enterIfDefined', 'left');
        });
        $("#insertheader").click(() => {
            new HeaderWidget(this.editor, null, false);
        });
        $("#insertitalic").click(() => {
            new ItalicWidget(this.editor, null, false);
        });
        $("#insertunderline").click(() => {
            new UnderlineWidget(this.editor, null, false);
        });

        this.editor.on("cursorActivity", function(cm) {
            if (cm.widgetEnter) {
                // check to see if movement is purely navigational, or if it
                // doing something like extending selection
                var cursorHead = cm.getCursor('head');
                var cursorAnchor = cm.getCursor('anchor');
                if (posEq(cursorHead, cursorAnchor)) {
                    cm.widgetEnter();
                }
                cm.widgetEnter = undefined;
            }
        });
    }

    // test
    public deleteChapterFromDB(value: string) {
        // event.stopPropagation();
        // console.log(event);
        console.log("deleteChapterFromDB(" + value + ")");
    }

    // test 2
    public changeChapter(event, chapter_number: number) {
        console.log(event);
        // if($event.target != this) {
        //     console.log("NOT THIS TARGET");
        //     return;
        // }
        console.log("CHANGE CHAPTER:   changeChapter(chapter_number : " + chapter_number + ")")
        // this.documentService.currentChapter = chapter_number;
        // this.current_chapter = chapter_number;
    }

    // move all these into the chapterItem component? // need to inject document etc.
    public createChapter() {
        // var p = new Paragraph("Text", []);
        // this.document.chapters.splice(this.current_chapter + 1, 0, new Chapter("New Chapter", [p]));
        // var diff: Diff = new Diff(this.document.id, this.document.chapters[this.current_chapter].id, this.current_chapter, {}, p, 0, false, true);
        // this.documentService.sendDiff(diff);
        // this.current_chapter += 1;
        console.log("new chapter::");
        var l = new Line("Text", []);
        var current_chapter = this.documentService.currentChapter;
        this.document.chapters.splice(current_chapter + 1, 0, new Chapter("New Chapter", [l]));
    }

    parseWidgets(cm) {
        var parseLines: string[] = [];
        for (var i = 0; i < cm.lineCount(); i++) {
            var text: string = cm.getLine(i);
            parseLines.push(text);
        }
        var widgetMap = [];
        widgetMap["#b"] = true;
        widgetMap["#img"] = true;
        WidgetParser.searchForWidgets(widgetMap, parseLines, (type, range) => {
            this.insertWidget(type, range);
        });
    }

    // must make a proper register for widget types etc...
    insertWidget(type, range) {
        console.log("inserting widget type : " + type + ", range: " + JSON.stringify(range));
        if (type == "#b") {
            new BoldWidget(this.editor, range, true);
        }
        else if (type == "#img") {
            new ImageWidget(this.editor, range, true);
        }
    }

    // Ctrl + J = BOLD
    public onKeyPressEvent(cm, e) {
        console.log("keypress");
        console.log(e);
        if (e.ctrlKey) {
            console.log(e);
            if (e.code === "KeyJ") {
                console.log("test");
                new BoldWidget(this.editor, null, false);
            }
        }
    }

    private setupCMAutocomplete() {
        this.documentService.getSnappets((snappets) => {
            var templates = {
                "name": "hashscript",
                "context": "hashscript",
                "templates": snappets
            }
            CodeMirror.templatesHint.addTemplates(templates);
            CodeMirror.commands.autocomplete = function(cm) {
                CodeMirror.showHint(cm, function(cm) {
                    return CodeMirror.showHint(cm, CodeMirror.ternHint, { async: true });
                });
            }
        })
    }
}
