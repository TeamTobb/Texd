import {Component, OnInit} from 'angular2/core';
import {Router, RouteConfig} from 'angular2/router';

@Component({
  selector: 'dashboard',
  templateUrl: 'views/documents.html'
})
export class DashboardComponent {
  public text: string = "test string in dashboard";
  private chapters : string[] = ["document 0", "document 1"];

  constructor(private _router: Router) {
  }

  public goToDocument(documentId : number) {
      this._router.navigate(['Editor', {id : documentId}]);
  }

}
