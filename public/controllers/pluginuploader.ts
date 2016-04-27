import {Component, Injector, provide, AfterViewInit, ViewChild, AfterContentInit} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {Http, Headers, HTTP_BINDINGS, Response} from 'angular2/http';
import {DocumentService} from '../data_access/document.ts';
import {Alert} from 'ng2-bootstrap/ng2-bootstrap'
import {Modal} from "ng2-modal/Modal";

@Component({
    selector: 'pluginuploader',
    templateUrl: 'views/pluginmodal.html',
    providers: [DocumentService],
    directives: [Modal, Alert]
})
export class PluginUploader{
    private lastResult;
    private editor;
    public alerts = [];
    public pluginname = "";
    public editorIsInitialized = false;

    constructor(private documentService: DocumentService) { }

    onModalOpen() {
        this.alerts = [];
        setTimeout(() => {
            if (!this.editorIsInitialized) {
                this.editor = CodeMirror.fromTextArea(document.getElementById("uploadTextArea"), {
                    height: "auto",
                    //  viewportMargin: "Infinity",
                    mode: "javascript",
                    lineNumbers: true,
                    lineWrapping: true,
                    smartIndent: true,
                    autoCloseTags: true,
                    autoIndent: true,
                    autoCloseBrackets: true
                })
                this.editorIsInitialized = true;
            }
            var arr = [];
            arr.push('{');
            arr.push('  "tagname" : "",');
            arr.push('  "html" : "",');
            arr.push('  "attr" : [],');
            arr.push('  "optattr" : [],');
            arr.push('  "description" : ""');
            arr.push('}');
            this.editor.replaceRange(arr, { line: 0, ch: 0 }, { line: this.editor.getDoc().lastLine(), ch: 1000 });
        }, 50); //TODO: Find an alternative to instantiate CM editor after the modal is shown
    }
    
    submit() {
        this.alerts = [];
        var pluginbody = {};
        try {
            pluginbody = JSON.parse(this.editor.getValue());
            if (pluginbody["tagname"] && pluginbody["html"] && pluginbody["attr"] && pluginbody["optattr"] && pluginbody["description"]) {
                this.documentService.postPlugin({ pluginname: this.pluginname, pluginbody: pluginbody }, () => {
                    this.alerts.push({
                        msg: 'Success!',
                        type: 'success',
                        closeable: 'true'
                    })
                })
            } else {
                //Valid JSON, but not the required elements for a complete pluginbody
                this.alerts.push({
                    msg: 'Missing required elements in the plugin',
                    type: 'danger',
                    closeable: 'true'
                })
            }
        } catch (error) {
            // Couldnt parse - invalid json. Alert+
            this.alerts.push({
                msg: 'Invalid JSON',
                type: 'danger',
                closeable: 'true'
            })
            console.log(error);
        }
    }

    closeAlert(index) {
        this.alerts.splice(index, 1);
    }
}