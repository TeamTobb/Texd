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
    @Input() document: Document;
    @Input() chapterId: string;
    @Input() changeOrderFrom: any;
    @Input() changeOrderTo: any;
    @Input() changeOrderText: any;
    @Input() changeOrderChapterId: any;
    @Output() emitChangeChapter: EventEmitter<any> = new EventEmitter();

    public editor;

    public widgetTest;

    public isInitialized = false;
    private current_chapter;

    constructor(private element: ElementRef, private documentService: DocumentService) {
        this.setupCMAutocomplete();
        console.log("chapterid: " + this.chapterId);
    }

    //Parsing on all changes
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["chapterId"] && this.editor !== undefined) {
            this.documentService.getChapter(this.chapterId, (chapter) => {
                var arr = [];
                for (var line of chapter._lines) {
                    arr.push(line._raw)
                }
                this.editor.getDoc().replaceRange(arr, { line: 0, ch: 0 }, { line: this.editor.getDoc().lastLine(), ch: 1000 });
            })
        }

        if ((changes["changeOrderFrom"] || changes["changeOrderTo"] || changes["changeOrderText"]) && (this.editor != undefined)) {
            console.log("we have changes in changeorder: " + JSON.stringify(changes, null, 2))
            for (var chapter of this.document.chapters) {
                if (this.chapterId == this.changeOrderChapterId) {
                    this.editor.getDoc().replaceRange(this.changeOrderText, this.changeOrderFrom, this.changeOrderTo)
                    break;
                }
            }
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

        // drag events for chapters
        document.addEventListener("dragstart", function(event) {
            event.dataTransfer.setData("dragData", event.target.id);
        });

        document.addEventListener("dragover", function(event) {
            event.preventDefault();
        });

        document.addEventListener("drop", (event ) => {
            event.preventDefault();
            var c0 = event.target.className;
            var par = $(event.target).parent();
            var c1 = par[0].className;
            var grandpar = $(event.target).parent().parent();
            var c2 = grandpar[0].className;
            var grandgrandpar = $(event.target).parent().parent().parent();
            var c3 = grandgrandpar[0].className;
            var d = "droptarget";
            var dragged_id = event.dataTransfer.getData("dragData");
            if ( c0 == d ) this.changeChapterPositions(dragged_id, event.target.id);
            else if (c1 == d) this.changeChapterPositions(dragged_id, par[0].id);
            else if (c2 == d) this.changeChapterPositions(dragged_id, grandpar[0].id);
            else if (c3 == d) this.changeChapterPositions(dragged_id, grandgrandpar[0].id);
        });

    }

    public changeChapterPositions(from, to) {
        if(from == to) return;
        var from_id = from.split("_")[2];
        var to_id = to.split("_")[2];
        this.documentService.changeChapters(from_id, to_id);
    }

    // test
    public deleteChapterFromDB(nr: number) {
        // event.stopPropagation();
        // console.log(event);
        console.log("deleteChapterFromDB(" + nr + ")");
        this.document.chapters.splice(nr, 1);
        this.documentService.sendDiff({ deleteChapter: true, chapterIndex: nr }, this.chapterId)
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
        this.current_chapter = chapter_number;
        console.log("we are emitting: " + chapter_number)
        this.emitChangeChapter.emit(chapter_number)
        // this.document.chapters.splice(current_chapter + 1, 0, new Chapter("New Chapter " + (current_chapter + 1), [l]));
        // this.documentService.sendDiffNewChapter({},this.chapterId, current_chapter);
    }

    // move all these into the chapterItem component? // need to inject document etc.
    public createChapter() {
        console.log("new chapter::");
        var l = new Line("Text", []);
        this.document.chapters.splice(this.current_chapter + 1, 0, new Chapter("New chapter", [l]));
        this.documentService.sendDiff({ newchapter: true, chapterIndex: this.current_chapter }, this.chapterId);
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
