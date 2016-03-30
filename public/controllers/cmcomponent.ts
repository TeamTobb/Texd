import {Component, OnInit, Input, Output, AfterViewInit, ElementRef, OnChanges, SimpleChange} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {Router} from 'angular2/router';
import {Document, Paragraph, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
import {EventEmitter} from "angular2/src/facade/async";
import {Widget, BoldWidget, HeaderWidget, ItalicWidget, UnderlineWidget} from "./widget.ts";

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
    }

    ngAfterViewInit() {
        this.editor = CodeMirror.fromTextArea(document.getElementById("linesEditor"), {
            mode: "javascript",
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
            if (this.isFocused) {
                new BoldWidget(this.editor);
            }
        });
        $("#insertheader").click(() => {
            if (this.isFocused) {
                new HeaderWidget(this.editor);
            }
        });
        $("#insertitalic").click(() => {
            if (this.isFocused) {
                new ItalicWidget(this.editor);
            }
        });
        $("#insertunderline").click(() => {
            if (this.isFocused) {
                new UnderlineWidget(this.editor);
            }
        });
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
