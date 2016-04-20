import {Component, Injector, provide, AfterViewInit, ViewChild, AfterContentInit} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {Modal, ModalConfig, ModalDialogInstance, YesNoModal, ICustomModal, YesNoModalContent, ICustomModalComponent} from 'angular2-modal/angular2-modal';
import {Http, Headers, HTTP_BINDINGS, Response} from 'angular2/http';
import {DocumentService} from '../data_access/document.ts';
import {Alert} from 'ng2-bootstrap/ng2-bootstrap'


@Component({
    selector: 'pluginuploader',
    template: `<modal-content></modal-content>`,
    providers: [Modal]
    // directives: [PluginUploadModal]
})
export class PluginUploader {
    @ViewChild(PluginUploadModal) uploadmodal: PluginUploadModal;
    private lastResult;
    private editor;
    constructor(private modal: Modal) { }

    openModal() {
        let resolvedBindings = Injector.resolve([provide(ICustomModal, {
            useValue: new AdditionCalculateWindowData(2, 3)
        })]),
            dialog: ModalDialogInstance = this.modal.open(
                <any>PluginUploadModal,
                resolvedBindings,
                new ModalConfig('lg', false, 27)
            );
    }
}

@Component({
    selector: 'modal-content',
    templateUrl: 'views/pluginmodal.html',
    providers: [Modal, DocumentService],
    directives: [Alert]
})
export class PluginUploadModal implements ICustomModalComponent, AfterViewInit {
    public alerts: Array<Object> = [];
    public editor = {};
    dialog: ModalDialogInstance;
    context: AdditionCalculateWindowData;
    public pluginname = "";


    constructor(private modal: Modal, dialog: ModalDialogInstance, modelContentData: ICustomModal, private documentService: DocumentService) {
        this.dialog = dialog;
        this.context = <AdditionCalculateWindowData>modelContentData;
    }

    ngAfterViewInit() {
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
        // this.editor.
        // "tagname": "b",
        // "html": "<b>$value</b>",
        // "attr": [],
        // "optattr": [],
        // "description": "Bold text"
        var arr = [];
        arr.push('{');
        arr.push('  "tagname" : "",');
        arr.push('  "html" : "",');
        arr.push('  "attr" : [],');
        arr.push('  "optattr" : [],');
        arr.push('  "description" : ""');
        arr.push('}');
        this.editor.getDoc().replaceRange(arr, { line: 0, ch: 0 }, { line: this.editor.getDoc().lastLine(), ch: 1000 });
    }

    onKeyUp(value) {
        this.dialog.close();
    }

    submit() {
        this.alerts = [];
        var pluginbody = {};
        try {
            pluginbody = JSON.parse(this.editor.getValue());
            console.log(pluginbody);
            console.log(pluginbody.tagname);
            console.log(pluginbody["tagname"]);
            if (pluginbody["tagname"] && pluginbody["html"] && pluginbody["attr"] && pluginbody["optattr"] && pluginbody["description"] ) {
                this.documentService.postPlugin({ pluginname: this.pluginname, pluginbody: pluginbody }, () => {
                    this.dialog.close();
                    this.modal.alert()
                        .size('sm')
                        .isBlocking(false)
                        .keyboard(27)
                        .title('Sucess')
                        .body('Plugin created')
                        .open();
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

    close() {
        this.dialog.close();
    }
}

class AdditionCalculateWindowData {
    constructor(
        public num1: number,
        public num2: number
    ) { }
}
