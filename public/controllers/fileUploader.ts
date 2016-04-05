import {Component, NgZone} from 'angular2/core';
import {UPLOAD_DIRECTIVES} from 'ng2-uploader/ng2-uploader';

@Component({
  selector: 'fileuploader',
  templateUrl: 'views/fileUploader.html',
  providers: [],
  directives: [],
  pipes: []
})
export class FileUploaderClass {
    constructor(){
        console.log("Done.")
    }
  /*zone: NgZone;
  options: Object = {
    url: 'http://ng2-uploader.com:10050/upload'
  };
  basicProgress: number = 0;
  basicResp: Object;
  multipleProgress: number = 0;
  multipleResp: any[] = [];
  dropProgress: number = 0;
  dropResp: any[] = [];

  constructor() {
    this.zone = new NgZone({ enableLongStackTrace: false });
  }

  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
    });
  }

  handleMultipleUpload(data): void {
    let index = this.multipleResp.findIndex(x => x.id === data.id);
    if (index === -1) {
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
    let index = this.dropResp.findIndex(x => x.id === data.id);
    if (index === -1) {
      this.dropResp.push(data);
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
*/
}
