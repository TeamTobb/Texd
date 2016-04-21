import {Component, NgZone, Injector, provide, AfterViewInit, ViewChild, AfterContentInit, Input, Output, OnChanges, SimpleChange} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {Modal, ModalConfig, ModalDialogInstance, YesNoModal, ICustomModal, YesNoModalContent, ICustomModalComponent} from 'angular2-modal/angular2-modal';
import {Http, Headers, HTTP_BINDINGS, Response} from 'angular2/http';
import {DocumentService} from '../data_access/document.ts';
import {Alert} from 'ng2-bootstrap/ng2-bootstrap'
import {Document} from '../domain/document.ts';
import {UPLOAD_DIRECTIVES} from './ng2-uploader.ts';
import {EventEmitter} from "angular2/src/facade/async";




@Component({
    selector: 'fileuploaderpage',
    template: '<fileuploader ></fileuploader>',
    providers: [Modal]
})
export class FileUploadPage {
    @ViewChild(FileUploadModal) uploadmodal: FileUploadModal;
    @Input() doc: Document;

    constructor(private modal: Modal) { }

    uploadClickedImage(file) {
        console.log('image clicked: ' + file)
    }
    openModal() {
        console.log("openModal() NÅ ER DOCUMENT: 1")
        console.log(this.doc);
        
        
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
    selector: 'fileuploader',
    templateUrl: 'views/fileuploader.html',
    styleUrls: ['stylesheets/style.css'],
    providers: [Modal, DocumentService],
    directives: [Alert, UPLOAD_DIRECTIVES]
})

export class FileUploadModal implements ICustomModalComponent, AfterViewInit, OnChanges {
    dialog: ModalDialogInstance;
    context: AdditionCalculateWindowData;
    zone: NgZone;
    options: Object = {
        url: './upload/photo'
    };
    basicProgress: number = 0;
    basicResp: Object;
    multipleProgress: number = 0;
    multipleResp: any[] = [];
    dropProgress: number = 0;
    dropResp: any[] = [];
    selectedFileIsUploading = false;
    dragedFileIsUploading = false;
    selectedFileIsUploaded = false;
    dragedFileIsUploaded = false;
    public dirFiles = [];
    public tests = [];
    public currentDoc;
    //@Output() clickedImage: EventEmitter<any> = new EventEmitter();
    public imageToUploadToEditor;

    constructor(private modal: Modal, dialog: ModalDialogInstance, modelContentData: ICustomModal, private documentService: DocumentService) {
        this.dialog = dialog;
        this.context = <AdditionCalculateWindowData>modelContentData;
        this.zone = new NgZone({ enableLongStackTrace: false });
        this.currentDoc = this.documentService.document
    }

    ngAfterViewInit() {
        console.log("FileUploadModal to'ern - OK?")
        console.log(this.currentDoc);
        //this.findAllPhotos()
    }
    
    ngOnChanges(changes: { [propertyName: string]: SimpleChange }){
        console.log(changes)
        
    }
    
    private findAllPhotos() {
        console.log("1 OK")
        this.documentService.getFilesInDir(this.currentDoc._id, (files) => {
            if (!files.errno) {
                files.forEach(file => {
                    this.dirFiles.push("uploads/document/" + this.currentDoc._id + "/photos/" + file);
                });
            }
        });
    }

    photoClicked(file) {
        console.log("clicked: " +file)
        this.clickedImage.emit(file)
    }


    handleMultipleUpload(data): void {
        this.selectedFileIsUploading = true;
        let index = this.multipleResp.findIndex(x => x.id === data.id);
        if (index === -1) {
            if (!data.error) {
                this.selectedFileIsUploaded = true;
                console.log(data);
                setTimeout(() => {
                    this.dirFiles.push("uploads/document/" + this.currentDoc._id + "/photos/" + data.originalName);
                }, 1000)
            }
            this.multipleResp.push(data);
        }
        else {
            this.zone.run(() => {
                this.multipleResp[index] = data;
            });
        }

        let total = 0, uploaded = 0;
        this.multipleResp.forEach(resp => {
            total += resp.progress.total;
            uploaded += resp.progress.loaded;
        });

        this.multipleProgress = Math.floor(uploaded / (total / 100));

    }

    handleDropUpload(data): void {
        this.dragedFileIsUploading = true;
        let index = this.dropResp.findIndex(x => x.id === data.id);
        if (index === -1) {
            this.dropResp.push(data);
            if (!data.error) {
                this.dragedFileIsUploaded = true;
            }
        }
        else {
            this.zone.run(() => {
                this.dropResp[index] = data;
            });
        }

        let total = 0, uploaded = 0;
        this.dropResp.forEach(resp => {
            total += resp.progress.total;
            uploaded += resp.progress.loaded;
        });

        this.dropProgress = Math.floor(uploaded / (total / 100));

    }

    onKeyUp(value) {
        this.dialog.close();
    }

    close() {
        this.dialog.close();
    }

    uploadClickedImage(file) {
        console.log('image clicked: ' + file)
    }



}

class AdditionCalculateWindowData {
    constructor(
        public num1: number,
        public num2: number
    ) { }
}
