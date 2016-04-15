import {ChapterItem} from "./chapteritem";
import {Component, OnInit, Input, Output, AfterViewInit, ElementRef, OnChanges, SimpleChange} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {Router} from 'angular2/router';
import {Document, Line, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
import {EventEmitter} from "angular2/src/facade/async";
import {Widget, BoldWidget, HeaderWidget, ItalicWidget, UnderlineWidget, ImageWidget, CursorWidget} from "./widget.ts";
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
    @Output() emitChangeChapter: EventEmitter<any> = new EventEmitter();
    
    public editor;
    public widgetTest; 
    private current_chapter;
    public cursorwidgets = {};
    public selections = {}

    constructor(private element: ElementRef, private documentService: DocumentService) {
        this.setupCMAutocomplete();
    }
    
    cursorActivity(diff) {
        if ("" + this.chapterId == "" + diff.chapterId) {
            if (diff.cursorActivity) {
                if (this.cursorwidgets[diff.senderId] != undefined) {
                    this.cursorwidgets[diff.senderId].clear()
                }
                try {
                    if (this.cursorwidgets[diff.senderId] != undefined) {
                        this.cursorwidgets[diff.senderId].clear()
                    }
                    this.cursorwidgets[diff.senderId] = CursorWidget(this.editor, null, false, diff.cursorActivity.line, diff.cursorActivity.ch, diff.color)
                } catch (error) {
                    console.log(error)
                }
                
                var element;
                if (document.getElementById('user' + diff.senderId)) {
                    element = document.getElementById('user' + diff.senderId)
                } else {
                    element = document.createElement('span');
                }

                element.id = "user" + diff.senderId
                element.innerHTML = diff.senderId
                element.style.color = diff.color
                document.getElementById('buttonsContainer').appendChild(element)
            }

            else if (diff.ranges) {
                var from = {
                    line: diff.ranges[0].anchor.line,
                    ch: diff.ranges[0].anchor.ch
                }

                var to = {
                    line: diff.ranges[0].head.line,
                    ch: diff.ranges[0].head.ch
                }

                if (from.line > to.line || (from.line == to.line && from.ch > to.ch)) {
                    //  Oneliner to swap variables
                    to = [from, from = to][0];
                }

                if (this.selections[diff.senderId]) {
                    this.selections[diff.senderId].clear()
                }

                var css = ".selectionRange { background-color: " + diff.color + ";}";
                var htmlDiv = document.createElement('div');
                htmlDiv.innerHTML = '<p>foo</p><style>' + css + '</style>';
                document.getElementsByTagName('head')[0].appendChild(htmlDiv.childNodes[1]);
                
                try {
                    this.selections[diff.senderId] = this.editor.markText(from, to, {
                        className: "selectionRange"
                    })
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }

    public changeOrder(diff) {
        try {
            if (this.chapterId == diff.chapterId) {
                this.editor.getDoc().replaceRange(diff.text, diff.from, diff.to)
            }
        } catch (error) {
            console.log(error)
        }
    }

    //Parsing on all changes
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["chapterId"] && this.editor !== undefined) {
            console.log("changes in chapter")
            this.documentService.getChapter(this.chapterId, (chapter) => {
                var arr = [];
                for (var line of chapter._lines) {
                    arr.push(line._raw)
                }
                this.editor.getDoc().replaceRange(arr, { line: 0, ch: 0 }, { line: this.editor.getDoc().lastLine(), ch: 1000 });
            })
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

        this.editor.on("cursorActivity", (cm, change) => {
            this.documentService.sendDiff({
                cursorActivity: this.editor.getCursor(),
            }, this.chapterId)
        })

        this.editor.on("beforeSelectionChange", (cm, obj) => {
            this.documentService.sendDiff(obj, this.chapterId)
        })

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

        this.editor.on("cursorActivity", function (cm) {
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
        document.addEventListener("dragstart", function (event) {
            event.dataTransfer.setData("dragData", event.target.id);
        });

        document.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        document.addEventListener("drop", (event) => {
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
            if (c0 == d) this.changeChapterPositions(dragged_id, event.target.id);
            else if (c1 == d) this.changeChapterPositions(dragged_id, par[0].id);
            else if (c2 == d) this.changeChapterPositions(dragged_id, grandpar[0].id);
            else if (c3 == d) this.changeChapterPositions(dragged_id, grandgrandpar[0].id);
        });

    }

    public changeChapterPositions(from, to) {
        if (from == to) return;
        var from_id = from.split("_")[2];
        var to_id = to.split("_")[2];
        this.documentService.changeChapters(from_id, to_id, this.chapterId);
    }
    
    public deleteChapterFromDB(nr: number) {
        this.document.chapters.splice(nr, 1);
        this.documentService.sendDiff({ deleteChapter: true, chapterIndex: nr }, this.chapterId)
    }

    public changeChapter(event, chapter_number: number) {
        this.current_chapter = chapter_number;
        this.emitChangeChapter.emit(chapter_number)
    }

    // move all these into the chapterItem component? // need to inject document etc.
    public createChapter() {
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
        if (type == "#b") {
            new BoldWidget(this.editor, range, true);
        }
        else if (type == "#img") {
            new ImageWidget(this.editor, range, true);
        }
    }

    // Ctrl + J = BOLD
    public onKeyPressEvent(cm, e) {
        if (e.ctrlKey) {
            if (e.code === "KeyJ") {
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
            CodeMirror.commands.autocomplete = function (cm) {
                CodeMirror.showHint(cm, function (cm) {
                    return CodeMirror.showHint(cm, CodeMirror.ternHint, { async: true });
                });
            }
        })
    }
}
