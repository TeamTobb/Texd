import {Component, Input, Output, OnChanges, SimpleChange} from 'angular2/core';
import {Directive} from "angular2/core";
import {OnInit} from 'angular2/core';
import {EventEmitter} from "angular2/src/facade/async";
import {isPropertyUpdated} from "angular2/src/common/forms/directives/shared";
import {DocumentService} from '../data_access/document.ts';
import {Document, Paragraph, Chapter} from '../domain/document.ts';


@Component({
  selector: 'chapteritem',
  templateUrl: 'views/components/chapteritem.html'
  
})
export class ChapterItem implements OnChanges {
  @Input() chapterName: string;
  @Input() chapterId: string; 
  @Input() documentId: string; 
  @Output() toBeDeleted : EventEmitter<any> = new EventEmitter();
  
  
  constructor(private documentService: DocumentService) {

  }
    // TODO Make alert, sure you want to delete this chapter? 
  delete(value: any){
    console.log("Delete()")
    this.toBeDeleted.emit(value)    
  }
  
    rename($event, chapterId, documentId){       
         //this.toBeDeleted.emit("event")  
        var newName: string = $event.target.innerHTML
        this.documentService.changeChapterName(documentId, newName, chapterId);
        $event.target.setAttribute("contenteditable", "false");
    }

    ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
     //console.log("Something has Changed in chapterItem") 

    }

    ondblclickChapter($event){
        console.log("ondblclickChapter")  
        $event.target.setAttribute("contenteditable", "true");
    }
}
