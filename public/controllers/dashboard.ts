import {Component, OnInit} from 'angular2/core';
import {Router} from 'angular2/router';
import {HTTP_BINDINGS} from 'angular2/http';
import {Document} from '../domain/document';
import {DocumentService} from '../data_access/document.ts';
import {DocView} from './docview';
 
//<docview *ngFor="#document of documents; #i = index" [title]="documents[i].name" [preview]="documents[i].chapters[0].text" />
@Component({
  selector: 'dashboard',
  templateUrl: 'views/documents.html',
  providers: [DocumentService, HTTP_BINDINGS], 
  directives: [DocView]
})
export class DashboardComponent {
  public text: string = "test string in dashboard";
  private documents : Document[];
  
  constructor(private _router: Router, private _documentService : DocumentService) {
        this.documents = this._documentService.getDocuments();
        console.log(this.documents);
  }

  public goToDocument(documentId : number) {
      this._router.navigate(['Editor', {id : documentId}]);
  }

}
