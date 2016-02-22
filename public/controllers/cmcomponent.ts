import {Component, OnInit, Input, Output, AfterViewInit, ElementRef, OnChanges, SimpleChange} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {Router} from 'angular2/router';
import {Document, Paragraph, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
import {EventEmitter} from "angular2/src/facade/async";
import {Widget, BoldWidget, HeaderWidget, ItalicWidget, UnderlineWidget} from "./widget.ts";

//<docview *ngFor="#document of documents; #i = index" [title]="documents[i].name" [preview]="documents[i].chapters[0].text" />
@Component({
    selector: 'cmcomponent',
    templateUrl: 'views/components/cmcomponent.html'
})
export class CmComponent implements AfterViewInit, OnChanges {
    @Input() paragraph: Paragraph;
    @Input() index: number;
    @Input() chapterId: string;
    @Input() parsedParagraph: string;
    @Input() isFocusedList: boolean[];
    @Input() isFocused: boolean;
    @Output() outdatedParsedParagraph: EventEmitter<any> = new EventEmitter();

    @Output() onFocusEmit: EventEmitter<any> = new EventEmitter();

    public editable: boolean = false
    public editor;
    public widgets : any[];
    // public isFocused : boolean = false;

    constructor(private element: ElementRef, private documentService: DocumentService) {
        this.setupCMAutocomplete();
    }

    //Parsing on all changes
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
        if(changes["isFocused"]) {
            if(!changes["isFocused"].currentValue) {
                this.showParsedPara();
            }
        }
        if(changes["parsedParagraph"]) {
            this.outdatedParsedParagraph.emit(this.index);
        }
    }

    ngAfterViewInit() {
        this.editor = CodeMirror.fromTextArea(document.getElementById("editor" + this.index), {
             mode: "javascript",
            lineNumbers: true,
            lineWrapping: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete"
            }
        })
        this.editor.on("change", (cm, change) => {
            var para = this.paragraph
            para.raw = cm.getValue();
            this.documentService.testDiffSend(new Diff({}, this.chapterId, {}, this.paragraph.id, para, this.index, false, false));
            cm.getValue();
        });
        this.editor.on("focus", (cm, change) => {
            this.isFocusedList[this.index] = true;
            this.onFocusEmit.emit(this.index);
        });
        this.editor.on("keypress", (cm, e) => {
            this.onKeyPressEvent(cm, e);
        });

        // make this outside of this component with a loop
        var elements = document.getElementsByClassName("CodeMirror cm-s-default CodeMirror-wrap")
        for (var index = 0; index < elements.length; index++) {
            this.hideParagraph(index)
            console.log("way too many calls? from each and loop");
        }

        // should probably be defined somewhere else
        $("#insertbold").click( () => {
            if(this.isFocused) {
                new BoldWidget(this.editor);
            }
        });
        $("#insertheader").click( () => {
            if(this.isFocused) {
                new HeaderWidget(this.editor);
            }
        });
        $("#insertitalic").click( () => {
            if(this.isFocused) {
                new ItalicWidget(this.editor);
            }
        });
        $("#insertunderline").click( () => {
            if(this.isFocused) {
                new UnderlineWidget(this.editor);
            }
        });
    }

    // Ctrl + J = BOLD
    public onKeyPressEvent(cm, e) {
        if(e.ctrlKey) {
            console.log(e);
            if(e.code==="KeyJ") {
                console.log("test");
                new BoldWidget(this.editor);
            }
        }
    }

    public showEditablePara() {
        this.editable = true;
        this.showParagraph(this.index)
        this.editor.focus()
    }

    public showParsedPara() {
        console.log("showparsed");
        this.outdatedParsedParagraph.emit(this.index)
        this.editable = false;
        this.hideParagraph(this.index)
    }

    private hideParagraph(index) {
        var element = document.getElementsByClassName("CodeMirror cm-s-default CodeMirror-wrap")
        if(element[index]) {
            element[index].setAttribute("style", "display: none");
        }
    }

    private showParagraph(index) {
        var element = document.getElementsByClassName("CodeMirror cm-s-default CodeMirror-wrap")
        element[index].setAttribute("style", "display: block");
    }

    private setupCMAutocomplete(){
        CodeMirror.commands.autocomplete = function(cm) {
            CodeMirror.showHint(cm, function(cm){
                return CodeMirror.showHint(cm, CodeMirror.ternHint, {async: true});
            });
        }
    }

}
