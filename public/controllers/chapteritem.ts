import {Component, Input, Output, OnChanges, SimpleChange} from 'angular2/core';
import {Directive} from "angular2/core";
import {OnInit} from 'angular2/core';
import {EventEmitter} from "angular2/src/facade/async";
import {OnChanges} from "angular2/core";
import {isPropertyUpdated} from "angular2/src/common/forms/directives/shared";

//<docview *ngFor="#document of documents; #i = index" [title]="documents[i].name" [preview]="documents[i].chapters[0].text" />
@Component({
  selector: 'chapteritem',
  templateUrl: 'views/components/chapteritem.html'
  
})
export class ChapterItem implements OnChanges {
  @Input() chapterName: string;
  @Input() delete: {};
  @Input() rename: {};
    
  constructor() {
  }
  
  delete(value: any){
    console.log("delete") 
    console.log(value)
  }
  
  rename($event){
    console.log("rename")     
    console.log($event.target.innerHTML)
  }
   
   ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    console.log("Change +-+-+-+-") 
    
  }

}
