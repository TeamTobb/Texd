import {Component, OnInit, Input, Output, AfterViewInit} from 'angular2/core';
import {Router} from 'angular2/router';
import {Document, Line, Chapter} from '../domain/document.ts';
import {DocumentService} from '../data_access/document.ts';
import {EventEmitter} from "angular2/src/facade/async";


//<docview *ngFor="#document of documents; #i = index" [title]="documents[i].name" [preview]="documents[i].chapters[0].text" />
@Component({
  selector: 'docview',
  templateUrl: 'views/components/docview.html'
})
export class DocView implements AfterViewInit {
  @Input() title: string;
  @Input() preview: any;
  @Output() deleteThisDocument: EventEmitter<any> = new EventEmitter();
  @Input() normalDoc = false;

  constructor(public documentService: DocumentService) {

  }

  ngAfterViewInit() {
    if (this.preview._id == "newDocument") {
      document.getElementById('previewframenewDocument').innerHTML = "<div ><br><h1> + </h1><br> <h3> Click to get a new document</h3></div>";
    } else {
      this.documentService.parseSingleDocument(this.preview._id, (parsedHTML) => {
        document.getElementById('previewframe' + this.preview._id).innerHTML = parsedHTML;

        for (var key in this.preview.style) {
          var value = this.preview.style[key];
          document.getElementById('previewframe' + this.preview._id).style[key] = value;
        }
      })
    }
  }
  
  deleteThisDoc($event){
    $event.stopPropagation();
    this.deleteThisDocument.emit(this.preview._id);
  }

}



