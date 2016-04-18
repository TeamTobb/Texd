import {ChapterItem} from "./chapteritem";
import {Component, OnInit, Input, Output, AfterViewInit, ElementRef, OnChanges, SimpleChange} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {Router} from 'angular2/router';
import {Document, Line, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
import {EventEmitter} from "angular2/src/facade/async";
import {Widget, BoldWidget, HeaderWidget, ItalicWidget, UnderlineWidget, ImageWidget, CursorWidget, GeneralSpanWidget} from "./widget.ts";
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
    @Input() current_chapter: number;
    @Output() emitChangeChapter: EventEmitter<any> = new EventEmitter();

    public editor;
    public widgetTest;
    public cursorwidgets = {};
    public selections = {};
    public inside_new_snappet = false;

    constructor(private element: ElementRef, private documentService: DocumentService) {
        this.setupCMAutocomplete();
    }

    cursorActivity(diff) {
        if ("" + this.current_chapter == "" + diff.chapterIndex) {
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
            if (this.current_chapter == diff.chapterIndex) {
                this.editor.getDoc().replaceRange(diff.text, diff.from, diff.to)
            }
        } catch (error) {
            console.log(error)
        }
    }

    getChapter() {
        this.documentService.getChapter(this.current_chapter, (chapter) => {
            var arr = [];
            for (var line of chapter._lines) {
                arr.push(line._raw)
            }
            this.editor.getDoc().replaceRange(arr, { line: 0, ch: 0 }, { line: this.editor.getDoc().lastLine(), ch: 1000 });
        })
    }
    //Parsing on all changes
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        // TODO: Shouldn't be necessary to have both of these change events. Best way would be to
        // only listen to change ["current_chapter"] and get the chapter
        if (changes["current_chapter"] && this.editor !== undefined) {
            this.getChapter()
        }
        if (changes["lines"] && this.editor !== undefined) {
            var arr = [];
            for (var line of this.lines) {
                arr.push(line.raw)
            }
            this.editor.getDoc().replaceRange(arr, { line: 0, ch: 0 }, { line: this.editor.getDoc().lastLine(), ch: 1000 });
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
                        this.parseWidgets(this.editor);
                        break;
                    }
                }
                for (var r in change.text) {
                    if (change.text[r].indexOf("#") != -1) {
                        this.parseWidgets(this.editor);
                        break;
                    }
                }
            }
            if (typeof (change.origin) !== 'undefined') {
                if (change.origin != "setValue" && change.origin != "+onParse") {
                    this.documentService.sendDiff(change, this.current_chapter);
                }
            }
        });

        this.editor.on("keypress", (cm, e) => {
            this.onKeyPressEvent(cm, e);
        });

        this.editor.on("cursorActivity", (cm, change) => {
            this.documentService.sendDiff({
                cursorActivity: this.editor.getCursor(),
            }, this.current_chapter)
        })

        this.editor.on("beforeSelectionChange", (cm, obj) => {
            this.documentService.sendDiff(obj, this.current_chapter)
        })

        // should probably be defined somewhere else
        $("#insertbold").click(() => {
            this.editor.focus();
            new GeneralSpanWidget(this.editor, null, "bold-widget", "#b");
        });
        $("#insertheader").click(() => {
            this.editor.focus();
            new GeneralSpanWidget(this.editor, null, "header-widget", "#h1");
        });
        $("#insertitalic").click(() => {
            this.editor.focus();
            new GeneralSpanWidget(this.editor, null, "italic-widget", "#i");
        });
        $("#insertunderline").click(() => {
            this.editor.focus();
            new GeneralSpanWidget(this.editor, null, "underline-widget", "#u");
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
        this.documentService.changeChapters(from_id, to_id, this.current_chapter);
    }

    public deleteChapterFromDB(nr: number) {
        this.document.chapters.splice(nr, 1);
        this.documentService.sendDiff({ deleteChapter: true }, nr);
    }

    public changeChapter(event, chapter_number: number) {
        this.current_chapter = chapter_number;
        this.changeActiveChapter();
        this.emitChangeChapter.emit(chapter_number)
    }

    public changeActiveChapter() {
        var selectedChapter = document.getElementById('chapter_item_' + this.current_chapter);
        var otherChapters = document.getElementsByClassName('droptarget');
        for (var i = 0; i < otherChapters.length; i++) {
            otherChapters[i].className = "droptarget";
        }
        selectedChapter.className = "droptarget active";
    }

    // move all these into the chapterItem component? // need to inject document etc.
    public createChapter() {
        var l = new Line("...", []);
        this.document.chapters.splice(this.current_chapter + 1, 0, new Chapter("New chapter", [l]));
        this.documentService.sendDiff({ newchapter: true }, this.current_chapter);
    }

    parseWidgets(cm) {
        // stop if new snappet, still a dirty fix
        if(this.inside_new_snappet) return;

        // ... get cursor pos and reset the document before parsing new widgets.
        var cursorPos = this.editor.getCursor();
        this.editor.setValue(this.editor.getValue());

        var parseLines: string[] = [];
        for (var i = 0; i < cm.lineCount(); i++) {
            var text: string = cm.getLine(i);
            parseLines.push(text);
        }
        var widgetMap = [];
        widgetMap["#b"] = true;
        widgetMap["#img"] = true;
        widgetMap["#h1"] = true;
        widgetMap["#i"] = true;
        widgetMap["#u"] = true;
        WidgetParser.searchForWidgets(widgetMap, parseLines, (type, range) => {
            this.insertWidget(type, range);
        });

        // setting back cursor
        this.editor.setCursor(cursorPos);
    }

    // must make a proper register for widget types etc...
    insertWidget(type, range) {
        if (type == "#b") {
            new GeneralSpanWidget(this.editor, range, "bold-widget", "#b");
        }
        else if (type == "#img") {
            new ImageWidget(this.editor, range, true);
        }
        else if (type == "#h1") {
            new GeneralSpanWidget(this.editor, range, "header-widget", "#h1");
        }
        else if (type == "#i") {
            new GeneralSpanWidget(this.editor, range, "italic-widget", "#i");
        }
        else if (type == "#u") {
            new GeneralSpanWidget(this.editor, range, "underline-widget", "#u");
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
            CodeMirror.commands.autocomplete = (cm) => {
                CodeMirror.showHint(cm, (cm) => {
                    this.inside_new_snappet = true;
                    setTimeout( () => {
                        this.inside_new_snappet = false
                        this.parseWidgets(this.editor);
                        // this timer should not just be set static like this.. currently u will have 8 seconds to insert into the widget
                    }, 8000);
                    return CodeMirror.showHint(cm, CodeMirror.ternHint, { async: true });
                });
            }
        })
    }
}
