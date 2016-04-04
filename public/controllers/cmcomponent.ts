import {Component, OnInit, Input, Output, AfterViewInit, ElementRef, OnChanges, SimpleChange} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {Router} from 'angular2/router';
import {Document, Line, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
import {EventEmitter} from "angular2/src/facade/async";
import {Widget, BoldWidget, HeaderWidget, ItalicWidget, UnderlineWidget, ImageWidget} from "./widget.ts";
import {WidgetParser} from "../utils/widgetParser.ts";

function posEq(a, b) {return a.line == b.line && a.ch == b.ch;}

@Component({
    selector: 'cmcomponent',
    templateUrl: 'views/components/cmcomponent.html'
})
export class CmComponent implements AfterViewInit, OnChanges {
    @Input() lines: Line[];
    @Input() chapterId: string
    @Input() changeOrderFrom: any;
    @Input() changeOrderTo: any;
    @Input() changeOrderText: any;

    public editor;

    public widgetTest;

    constructor(private element: ElementRef, private documentService: DocumentService) {
        this.setupCMAutocomplete();
        console.log("chapterid: " + this.chapterId);
    }

    //Parsing on all changes
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if (changes["lines"] && this.editor !== undefined) {
            var arr = [];
            for (var line in this.lines) {
                arr.push(this.lines[line].raw)
            }
            console.log("arr: " + JSON.stringify(arr, null, 2))
            this.editor.getDoc().replaceRange(arr, { line: 0, ch: 0 })
        }

        if ((changes["changeOrderFrom"] || changes["changeOrderTo"] || changes["changeOrderText"]) && (this.editor != undefined)) {
            console.log("we have changes in changeorder: " + JSON.stringify(changes, null, 2))
            this.editor.getDoc().replaceRange(this.changeOrderText, this.changeOrderFrom, this.changeOrderTo)
        }
    }

    ngAfterViewInit() {
        this.editor = CodeMirror.fromTextArea(document.getElementById("linesEditor"), {
            mode: "none",
            lineNumbers: true,
            lineWrapping: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete"
            }
        })
        this.editor.on("change", (cm, change) => {
            // console.log("Change: " + JSON.stringify(change, null, 2))
            console.log(change)
            // check if "#" :: if present -> remove all widg"ets and parse ?
            console.log(change.origin);
            if(change.origin != "setValue") {
                // remove widgets with set value
                // this.editor.setValue(this.editor.getValue());
                console.log("Has origin");
                for(var r in change.removed) {
                    if(change.removed[r].indexOf("#") != -1){
                        console.log("Removed a #");
                        this.editor.setValue(this.editor.getValue());
                        this.parseWidgets(this.editor);
                        // need to set cursor back now
                    }
                }
                for(var r in change.text) {
                    if(change.text[r].indexOf("#") != -1){
                        console.log("added a #");
                        this.editor.setValue(this.editor.getValue());
                        this.parseWidgets(this.editor);
                        // need to set cursor back now
                    }
                }
            } else {
                console.log("has no origin !! :!: :!: !: :!: :! ! ");
            }
            if (typeof (change.origin) !== 'undefined' && typeof (change.origin) !== 'setValue') {
                console.log("We hav eorigin")
                this.documentService.sendDiff(change, this.chapterId);
            }
        });

        console.log("setting value");
        // this.editor.setValue(this.editor.getValue());
        // this.editor.setValue(this.editor.getValue());

        this.editor.on("keypress", (cm, e) => {
            this.onKeyPressEvent(cm, e);
        });

        // make this outside of this component with a loop

        // should probably be defined somewhere else
        $("#insertbold").click(() => {
            this.widgetTest = new BoldWidget(this.editor, null);
            this.editor.widgetEnter = $.proxy(this.widgetTest, 'enterIfDefined', 'left');
        });
        $("#insertheader").click(() => {
            new HeaderWidget(this.editor, null);
        });
        $("#insertitalic").click(() => {
            new ItalicWidget(this.editor, null);
        });
        $("#insertunderline").click(() => {
            new UnderlineWidget(this.editor, null);
        });
        $("#insertimagetest").click(() => {
            new ImageWidget(this.editor, null);
        });

        this.editor.on("cursorActivity", function(cm) {
            console.log("heeere 11");
            if (cm.widgetEnter) {
                console.log("okkok");
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

        // parse widgets
        // this.parseWidgets(this.editor, null);
    }

    parseWidgets(cm) {
        // remove all widgets first ?
        // this.editor.setValue(this.editor.getValue());
        // return null;
        // parse
        var lines: string[] = [];
        for (var i = 0; i < cm.lineCount(); i++) {
            var text: string = cm.getLine(i);
            lines.push(text);
        }
        var widgetMap = [];
        widgetMap["#b"] = true;
        widgetMap["#img"] = true;
        WidgetParser.searchForWidgets(widgetMap, lines, (type, range) => {
            console.log("inserting:: " + type);
            this.insertWidget(type, range);
        });
    }

    // must make a proper register for widget types etc...
    insertWidget(type, range) {
        console.log("inserting widget type : " + type + ", range: " + JSON.stringify(range));
        if (type == "#b") {
            new BoldWidget(this.editor, range);
            // this.editor.markText(range.from, range.to, {className: 'bold-widget'});
        }
        else if (type == "#img") {
            console.log("Range is:: " + JSON.stringify(range));
            new ImageWidget(this.editor, range);
            // this.editor.markText(range.from, range.to, {className: 'bold-widget'});
        }
    }

    // Ctrl + J = BOLD
    public onKeyPressEvent(cm, e) {
        if (e.ctrlKey) {
            console.log(e);
            if (e.code === "KeyJ") {
                console.log("test");
                new BoldWidget(this.editor, null);
            }
        }
    }

    private setupCMAutocomplete() {
        CodeMirror.commands.autocomplete = function(cm) {
            CodeMirror.showHint(cm, function(cm) {
                return CodeMirror.showHint(cm, CodeMirror.ternHint, { async: true });
            });
        }
    }

}
