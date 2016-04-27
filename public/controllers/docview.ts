import {Component, OnInit, Input, AfterViewInit} from 'angular2/core';
import {Router} from 'angular2/router';
import {Document, Line, Chapter} from '../domain/document.ts';
import {DocumentService} from '../data_access/document.ts';

//<docview *ngFor="#document of documents; #i = index" [title]="documents[i].name" [preview]="documents[i].chapters[0].text" />
@Component({
  selector: 'docview',
  templateUrl: 'views/components/docview.html',
  providers: [DocumentService]
})
export class DocView implements AfterViewInit {
  @Input() title: string;
  @Input() preview: any;

  constructor(public documentService: DocumentService) {

  }

  ngAfterViewInit() {
    this.documentService.parseSingleDocument(this.preview._id, (parsedHTML) => {
      document.getElementById('previewframe' + this.preview._id).innerHTML = parsedHTML;

      for (var key in this.preview.style) {
        var value = this.preview.style[key];
        document.getElementById('previewframe' + this.preview._id).style[key] = value;
      }
    })
  }
  
}



