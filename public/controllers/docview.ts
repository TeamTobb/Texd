import {Component, OnInit, Input} from 'angular2/core';
import {Router} from 'angular2/router';
 
//<docview *ngFor="#document of documents; #i = index" [title]="documents[i].name" [preview]="documents[i].chapters[0].text" />
@Component({
  selector: 'docview',
  templateUrl: 'views/components/docview.html'
})
export class DocView {
  @Input() title: string; 
  @Input() preview: string;
 
  constructor() {
      
  }
}
