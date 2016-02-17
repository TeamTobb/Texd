import {Component, OnInit, Input, AfterViewInit, ElementRef, OnChanges, SimpleChange} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {Router} from 'angular2/router';
import {Document, Paragraph, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
 
//<docview *ngFor="#document of documents; #i = index" [title]="documents[i].name" [preview]="documents[i].chapters[0].text" />
@Component({
    selector: 'cmcomponent',
    templateUrl: 'views/components/cmcomponent.html'
})
export class CmComponent implements AfterViewInit {
    @Input() paragraph: Paragraph;
    @Input() index: number;
    @Input() chapterId: string;
    @Input() parsedParagraph: string;


    public editable: boolean = false

    constructor(private element: ElementRef, private documentService: DocumentService) {


    }

    ngAfterViewInit() {
        var editor = CodeMirror.fromTextArea(document.getElementById("editor" + this.index), {
            mode: "javascript",
            lineNumbers: true,
            lineWrapping: true
        })
        editor.on("change", (cm, change) => {
            var para = this.paragraph
            para.raw = cm.getValue();
            this.documentService.testDiffSend(new Diff({}, this.chapterId, {}, this.paragraph.id, para, this.index, false, false));
            cm.getValue();


        });

        
        var elements = document.getElementsByClassName("CodeMirror cm-s-default CodeMirror-wrap")
        for (var index = 0; index < elements.length; index++) {
            var cm = elements[index];            
            cm.setAttribute("style", "display: none")
        }

    }
    public showEditablePara() {
        console.log("showEditablePara()")
        this.editable = true;
        var element = document.getElementsByClassName("CodeMirror cm-s-default CodeMirror-wrap")
        element[this.index].setAttribute("style", "display: block");       
    }

    public showParsedPara() {
        console.log("private showParsedPara() ")
        this.editable = false;
    }





}
