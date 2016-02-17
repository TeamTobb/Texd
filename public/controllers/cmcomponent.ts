import {Component, OnInit, Input, AfterViewInit, ElementRef, OnChanges, SimpleChange} from 'angular2/core';
import {Router} from 'angular2/router';
import {Document, Paragraph, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
 
//<docview *ngFor="#document of documents; #i = index" [title]="documents[i].name" [preview]="documents[i].chapters[0].text" />
@Component({
  selector: 'cmcomponent',
  templateUrl: 'views/components/cmcomponent.html'
})
export class CmComponent implements AfterViewInit{
  @Input() paragraph: Paragraph; 
  @Input() index: number;
  @Input() chapterId: string; 
   
  constructor(private element: ElementRef, private documentService: DocumentService) {
  }
  
  ngAfterViewInit(){
        var editor = CodeMirror.fromTextArea(document.getElementById("editor" + this.index), {
            mode: "javascript",
            lineNumbers: true,
            lineWrapping: true
        })
        editor.on("change", (cm, change) =>{
            var para = this.paragraph
            para.raw = cm.getValue(); 
            this.documentService.testDiffSend(new Diff({}, this.chapterId, {}, this.paragraph.id, para, this.index, false, false));
            cm.getValue(); 
            
        });  
  }
  
  
  
  
  
}
