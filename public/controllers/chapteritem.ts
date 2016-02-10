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
    
  constructor(private documentService: DocumentService) {
  }
  //Implement this
  delete(value: any){
    //Make this alert, sure you want to delete this chapter? 
    var chapters: Chapter[] = this.documentService.document.chapters;
    
    for (var index = 0; index < chapters.length; index++) {
        var element = chapters[index];
        if (element.id==value){
            chapters.splice(index, 1);
            break;
        }
    }            
  }
  //TODO Implmentent this
  rename($event){
    console.log("rename")     
    var newName: string = $event.target.innerHTML
    this.documentService.changeChapterName("1", newName, 1);
  }
   
   ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    console.log("Something has Changed in chapterItem") 
    
  }

}
