import {Component, OnInit, View} from 'angular2/core';
import {Router} from 'angular2/router';
import {HTTP_BINDINGS} from 'angular2/http';
import {Document} from '../domain/document';
import {DocumentService} from '../data_access/document.ts';
import {DocView} from './docview';

import { CORE_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';

import { ACCORDION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

@Component({
    selector: 'dashboard',
    templateUrl: 'views/documents.html',
    providers: [DocumentService, HTTP_BINDINGS],
    directives: [DocView, ACCORDION_DIRECTIVES, CORE_DIRECTIVES, FORM_DIRECTIVES]
})
export class DashboardComponent {
    public text: string = "test string in dashboard";
    private documents: Document[];
    private maxColumns = 3;
    private documentGrid: Document[] = [];

    constructor(private _router: Router, private _documentService: DocumentService) {
        this._documentService.getDocuments((documents) => {
            this.documents = documents;
        });
    }

    ngOnInit() {
        this._documentService.newDocObserver.subscribe((newDoc) => {
            console.log("NÅ SKJER DET! ");
            this.documents.push(newDoc)
        })
    }

    public goToDocument(documentId: string) {
        console.log("passing id " + documentId);
        this._router.navigate(['Editor', { id: documentId }]);
    }

    createNewDocument() {
        console.log("CreateNewDocfrom dashbaord");
        this._documentService.createNewDocument((res) => {
                        
        });
    }
}          