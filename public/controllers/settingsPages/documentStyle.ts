import {Component, OnInit} from 'angular2/core';
import {Router, RouteParams} from 'angular2/router';
import {Input, Output} from 'angular2/core';
import {EventEmitter} from "angular2/src/facade/async";

import {FORM_PROVIDERS, FormBuilder, Validators} from 'angular2/common';
import {bootstrap} from 'angular2/platform/browser';



@Component({
    selector: 'documentStyle',
    providers: [],
    templateUrl: 'views/settingspages/documentStyle.html'
})

export class DocumentStyle {
    styleForm: any;

    documentId: string;
    title: string = "loading";
    styleInput = {};
    styleItems = [];

    constructor(private _router: Router, private _routeParams: RouteParams, builder: FormBuilder) {
        this.documentId = _routeParams.params["id"];
        console.log("documentId: " + this.documentId)
        this.createStyleInput()


    }

    createStyleInput() {
        this.styleItems.push("p-font");
        this.styleItems.push("p-size");

        this.styleItems.forEach(element => {
            this.styleInput[element] = "";
        });
    }
    
    sendStyleToServer(){
        console.log("Sender style til Sever")
        
    }
}
