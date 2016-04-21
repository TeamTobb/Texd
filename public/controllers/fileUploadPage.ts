import {Component, Injector, provide, AfterViewInit, ViewChild, AfterContentInit} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {Modal, ModalConfig, ModalDialogInstance, YesNoModal, ICustomModal, YesNoModalContent, ICustomModalComponent} from 'angular2-modal/angular2-modal';
import {Http, Headers, HTTP_BINDINGS, Response} from 'angular2/http';
import {DocumentService} from '../data_access/document.ts';
import {Alert} from 'ng2-bootstrap/ng2-bootstrap'


@Component({
    selector: 'fileuploaderpage',
    template: `<modal-filecontent></modal-filecontent>`,
    providers: [Modal]
    // directives: [PluginUploadModal]
})
export class FileUploadPage {
    @ViewChild(FileUploadModal) uploadmodal: FileUploadModal;
    constructor(private modal: Modal) { }

    openModal() {
        console.log("1")
        let resolvedBindings = Injector.resolve([provide(ICustomModal, {
            useValue: new AdditionCalculateWindowData(2, 3)
        })]),
            dialog: ModalDialogInstance = this.modal.open(
                <any>FileUploadModal,
                resolvedBindings,
                new ModalConfig('lg', false, 27)
            );
    }
}

@Component({
    selector: 'modal-filecontent',
    template: 'HALLO ALL SAMMEN',
    providers: [Modal, DocumentService],
    directives: [Alert]
})
export class FileUploadModal implements ICustomModalComponent, AfterViewInit {
    dialog: ModalDialogInstance;
    context: AdditionCalculateWindowData;


    constructor(private modal: Modal, dialog: ModalDialogInstance, modelContentData: ICustomModal, private documentService: DocumentService) {
        this.dialog = dialog;
        this.context = <AdditionCalculateWindowData>modelContentData;
    }

    ngAfterViewInit() {
        console.log("OK?")
    }

    onKeyUp(value) {
        this.dialog.close();
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
