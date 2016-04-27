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
    directives: [DocView, ACCORDION_DIRECTIVES, CORE_DIRECTIVES, FORM_DIRECTIVES]
})
export class DashboardComponent {
    private documents: Document[];
    private maxColumns = 3;
    private documentGrid: Document[] = [];
    newDocument = { _id: "hey", title: "title" };

    constructor(private _router: Router, private _documentService: DocumentService) {
        this.newDocument._id = "newDocument";
        this.newDocument.title = "New document"
        this._documentService.getDocuments((documents) => {
            this.documents = documents;
        });
    }

    ngOnInit() {
        this._documentService.newDocObserver.subscribe((newDoc) => {
            this.documents.unshift(newDoc)
        })
    }

    public goToDocument(documentId: string) {
        this._router.navigate(['Editor', { id: documentId }]);
    }

    createNewDocument() {
        this._documentService.createNewDocument((res) => {

        });
    }

    deleteDocument(document) {
        for (var key in this.documents) {
            var element = this.documents[key];
            if (element.id == document){
                console.log(key);                               
                this.documents.splice( +key, 1)
            }


        }
    }


}          