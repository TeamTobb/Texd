import {Component, NgZone, Input, Output, AfterViewInit} from 'angular2/core';
import {UPLOAD_DIRECTIVES} from './ng2-uploader.ts';
import {DocumentService} from '../data_access/document.ts';
import {EventEmitter} from "angular2/src/facade/async";

//import {UPLOAD_DIRECTIVES} from '../utils/ng2-uploader/ng2-uploader.ts';

@Component({
    selector: 'fileuploader',
    templateUrl: 'views/fileUploader.html',
    styleUrls: ['stylesheets/style.css'],
    providers: [DocumentService],
    directives: [UPLOAD_DIRECTIVES],
    pipes: []
})
export class FileUploaderClass implements AfterViewInit {
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
    @Input() docId;
    @Output() clickedImage: EventEmitter<any> = new EventEmitter();
    public imageToUploadToEditor;

    constructor(private documentService: DocumentService) {
        this.zone = new NgZone({ enableLongStackTrace: false });
    }


    ngAfterViewInit() {
        console.log(this.docId._id)
        this.findAllPhotos()
    }

    private findAllPhotos() {
        console.log("1 OK")
        this.documentService.getFilesInDir(this.docId._id, (files) => {
            if (!files.errno) {
                files.forEach(file => {
                    this.dirFiles.push("uploads/document/" + this.docId._id + "/photos/" + file);
                    //console.log(this.dirFiles);

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
                    this.dirFiles.push("uploads/document/" + this.docId._id + "/photos/" + data.originalName);
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
}
