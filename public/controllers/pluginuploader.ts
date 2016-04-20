import {Component, Injector, provide, AfterViewInit, ViewChild, AfterContentInit} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {Modal, ModalConfig, ModalDialogInstance, YesNoModal, ICustomModal, YesNoModalContent, ICustomModalComponent} from 'angular2-modal/angular2-modal';
import {Http, Headers, HTTP_BINDINGS, Response} from 'angular2/http';
import {DocumentService} from '../data_access/document.ts';


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
            dialog = this.modal.open(
                <any>PluginUploadModal,
                resolvedBindings,
                new ModalConfig('lg', false, 27)
            );
    }
}

@Component({
    selector: 'modal-content',
    templateUrl: 'views/pluginmodal.html',
    providers: [DocumentService]
})
export class PluginUploadModal implements ICustomModalComponent, AfterViewInit {
    public editor = {};
    dialog: ModalDialogInstance;
    context: AdditionCalculateWindowData;
    public pluginname = "";


    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal, private documentService: DocumentService) {
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
    }

    onKeyUp(value) {
        this.dialog.close();
    }
    
    submit() {
        var pluginbody = {};
        try {
            pluginbody = JSON.parse(this.editor.getValue());
            this.documentService.postPlugin({ pluginname: this.pluginname, pluginbody: pluginbody }, () => {
                console.log("successssss")
            })
        } catch (error) {
            // Couldnt parse - invalid json
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