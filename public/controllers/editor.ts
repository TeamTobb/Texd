import {ParseMap} from "../utils/parseMap.ts";
import {Component, ElementRef, Renderer, Input, AfterViewInit, OnChanges, SimpleChange} from 'angular2/core';
import {Http, HTTP_BINDINGS, Response} from 'angular2/http';
import {Injectable, } from 'angular2/core';
import {RouteParams} from 'angular2/router';
import 'rxjs/Rx';

import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';
import {Document, Line, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
import {ChapterItem} from './chapteritem.ts'
import {FileUploaderClass} from './fileUpLoader.ts'
import {CmComponent} from './cmcomponent.ts'
import {SnappetParser} from "../utils/snappetParser.ts";

import {CORE_DIRECTIVES} from 'angular2/common';
import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

//Upload file
import {NgZone} from 'angular2/core';
import {UPLOAD_DIRECTIVES} from 'ng2-uploader/ng2-uploader';

@Component({
    selector: 'texd-editor',
    templateUrl: 'views/editor.html',
    providers: [DocumentService, HTTP_BINDINGS],
    directives: [ChapterItem, CmComponent, DROPDOWN_DIRECTIVES, CORE_DIRECTIVES, FileUploaderClass]
})

export class EditorController implements AfterViewInit {
    public document: Document = new Document([], [], [], [], [{}, {}, {}]);
    public current_chapter: number = 0;
    public current_paragraph: number = 0;
    public element: ElementRef;
    private snappetParser: SnappetParser;
    private showUploadDiv = false;
    public filesToUpload: Array<File> = [];
    public changeOrder: any;

    constructor(private http: Http, public currElement: ElementRef, private documentService: DocumentService, public renderer: Renderer, private _routeParams: RouteParams) {
        this.changeOrder = this.documentService.changeOrder
        this.element = currElement;
        renderer.listenGlobal('document', 'keydown', ($event) => {
            this.globalKeyEvent($event);
        });
        if (this._routeParams.get('id')) {
            this.documentService.getDocument(this._routeParams.get('id'), (document2) => {
                this.document = document2;
            })
            this.documentService.currentChapter = this.current_chapter;
        }
    }

    ngAfterViewInit() {
        // initialize jquery functions
        var isResizing = false,
            lastDownX = 0;
        var container = $('#containerForEditor'),
            left = $('#leftInContainerForEditor'),
            right = $('#rightInContainerForEditor'),
            handle = $('#handle2');
        handle.on('mousedown', function (e) {
            isResizing = true;
            lastDownX = e.clientX;
        });
        $(document).on('mousemove', function (e) {
            // we don't want to do anything if we aren't resizing.
            if (!isResizing)
                return;
            var offsetRight = container.width() - (e.clientX - container.offset().left);
            left.css('right', offsetRight);
            right.css('width', offsetRight);
        }).on('mouseup', function (e) {
            // stop resizing
            isResizing = false;
        });

        $("#updatePreview").click(() => {
            this.documentService.updateLines();
            this.documentService.parseChapter((parsedHTML) => {
                console.log("done parsing.. inserting!");
                document.getElementById('previewframe').innerHTML = parsedHTML;
            })
        });

        var sidebarHidden = false;
        var previewHidden = false;
        var editorHidden = false;

        $("#sidebarbutton").click(() => {
            console.log("clicked sidebarbutton");
            if(sidebarHidden) {
                console.log("show");
                $("#chapter_bar").show(650);
                sidebarHidden = false;
            }
            else {
                console.log("hide");
                $("#chapter_bar").hide(650);
                sidebarHidden = true;
            }
        });

        // hide handle too ?

        $("#hidePreview").click(() => {
            console.log("clicked sidebarbutton");
            if(previewHidden) {
                console.log("show");
                $("#rightInContainerForEditor").show(650);
                previewHidden = false;
            }
            else {
                console.log("hide");
                $("#rightInContainerForEditor").hide(650);
                previewHidden = true;
            }
        });

        // use some kind of tracker here?
        var lastPreviewSize = 0;

        $("#hideEditor").click(() => {
            console.log("clicked sidebarbutton");
            if(editorHidden) {
                console.log("show");
                $("#leftInContainerForEditor").show(650);
                // need to adjust reset the previous positions of preview etc.
                editorHidden = false;
            }
            else {
                console.log("hide");
                $("#leftInContainerForEditor").hide(650);
                // need to adjust preview to fit screen now.
                editorHidden = true;
            }
        });

    }

    public changeDocumentTitle($event) {
        if (!($event.target.innerHTML == this.document.title)) {
            this.documentService.changeTitle(this.document.id, $event.target.innerHTML);
        }
    }

    public globalKeyEvent($event) {
        var keyMap = {};
        keyMap[80] = () => {
            console.log("ctrl+p");
            this.documentService.updateLines();
            this.documentService.parseChapter((parsedHTML) => {
                console.log("done parsing.. inserting!");
                document.getElementById('previewframe').innerHTML = parsedHTML;
            })
        }
        keyMap[67] = () => {
            console.log("ctrl+c");
            // this.createChapter();
        }

        if ($event.ctrlKey) {
            if (keyMap[$event.which]) {
                $event.preventDefault();
                keyMap[$event.which]();
            }
        }
    }

    public showUploadDivToggle(hide) {
        this.showUploadDiv = hide;
    }
}
