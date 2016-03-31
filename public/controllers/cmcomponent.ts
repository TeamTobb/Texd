import {Component, OnInit, Input, Output, AfterViewInit, ElementRef, OnChanges, SimpleChange} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {Router} from 'angular2/router';
import {Document, Paragraph, Chapter} from '../domain/document.ts';
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
    @Input() paragraph: Paragraph;
    @Input() chapterId: string
    @Input() changeOrderFrom: any;
    @Input() changeOrderTo: any;
    @Input() changeOrderText: any;

    public editor;

    public widgetTest;

    constructor(private element: ElementRef, private documentService: DocumentService) {
        this.setupCMAutocomplete();
        console.log("para: "+JSON.stringify(this.paragraph, null, 2))
        console.log("chapterid: "+ this.chapterId);
    }

    //Parsing on all changes
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if ((changes["changeOrderFrom"] || changes["changeOrderTo"] || changes["changeOrderText"]) && (this.editor != undefined)) {
            console.log("we have changes in changeorder: " + JSON.stringify(changes, null, 2))
            this.editor.getDoc().replaceRange(this.changeOrderText, this.changeOrderFrom, this.changeOrderTo)
        }
        // parse widgets
        if (this.editor != undefined) {
            // parse widgets
            console.log("what?");
            // this.parseWidgets(this.editor);
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
            if (typeof(change.origin) !== 'undefined'){
                console.log("We hav eorigin")
                this.paragraph.raw = cm.getValue();
                this.documentService.sendDiff(change)
            }
        });

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
        // this.parseWidgets(this.editor);
    }

    parseWidgets(cm) {
        var lines : string[] = [];
        for (var i = 0; i < cm.lineCount(); i++) {
            var text : string = cm.getLine(i);
            lines.push(text);
        }
        var widgetMap = [];
        widgetMap["#b"] = true;
        WidgetParser.searchForWidgets(widgetMap, lines, (type, range) => {
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
    }

    // Ctrl + J = BOLD
    public onKeyPressEvent(cm, e) {
        if (e.ctrlKey) {
            console.log(e);
            if (e.code === "KeyJ") {
                console.log("test");
                new BoldWidget(this.editor);
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
