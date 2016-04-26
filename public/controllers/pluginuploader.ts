import {Component, Injector, provide, AfterViewInit, ViewChild, AfterContentInit} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
// import {Modal, ModalConfig, ModalDialogInstance, YesNoModal, ICustomModal, YesNoModalContent, ICustomModalComponent} from 'angular2-modal/angular2-modal';
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
export class PluginUploader implements AfterViewInit {
    // @ViewChild(PluginUploadModal) uploadmodal: PluginUploadModal;
    private lastResult;
    private editor;
    public alerts = []; 
    public pluginname = "";
    
    constructor(private documentService: DocumentService) { }
    
    closeAlert(index){
        this.alerts.splice(index, 1); 
    }
    
    submit() {
        this.alerts = [];
        var pluginbody = {};
        try {
            pluginbody = JSON.parse(this.editor.getValue());
            if (pluginbody["tagname"] && pluginbody["html"] && pluginbody["attr"] && pluginbody["optattr"] && pluginbody["description"]) {
                this.documentService.postPlugin({ pluginname: this.pluginname, pluginbody: pluginbody }, () => {
                    
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

    onModalOpen() {
        console.log("on modal open");
        setTimeout(() => {
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
            var arr = [];
            arr.push('{');
            arr.push('  "tagname" : "",');
            arr.push('  "html" : "",');
            arr.push('  "attr" : [],');
            arr.push('  "optattr" : [],');
            arr.push('  "description" : ""');
            arr.push('}');
            this.editor.getDoc().replaceRange(arr, { line: 0, ch: 0 }, { line: this.editor.getDoc().lastLine(), ch: 1000 });
        }, 100);
    }
}