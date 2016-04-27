import {KeyMap} from "../utils/keymap.ts";
import {ParseMap} from "../utils/parseMap.ts";
import {Component, ElementRef, Renderer, Input, ViewChild, AfterViewInit, OnChanges, SimpleChange} from 'angular2/core';
import {Http, HTTP_BINDINGS, Response} from 'angular2/http';
import {Injectable, } from 'angular2/core';
import {RouteParams} from 'angular2/router';
import 'rxjs/Rx';
import {ButtonCheckbox} from 'ng2-bootstrap/ng2-bootstrap';
import {Parser} from '../utils/parser.ts';
import {jsonToHtml} from '../utils/jsonToHtml.ts';
import {Document, Line, Chapter} from '../domain/document.ts';
import {Diff} from '../domain/diff.ts';
import {DocumentService} from '../data_access/document.ts';
import {ChapterItem} from './chapteritem.ts'
import {FileUpload} from './fileUploadPage.ts'
import {PluginUploader} from './pluginuploader.ts'
import {CmComponent} from './cmcomponent.ts'
import {SnappetParser} from "../utils/snappetParser.ts";
import {RouteConfig, ROUTER_DIRECTIVES, Router} from 'angular2/router';
import {Observer} from 'rxjs/Observer';
import {CORE_DIRECTIVES} from 'angular2/common';
import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {NgZone} from 'angular2/core';
import {UPLOAD_DIRECTIVES} from 'ng2-uploader/ng2-uploader';

@Component({
    selector: 'texd-editor',
    templateUrl: 'views/editor.html',
    directives: [ChapterItem, CmComponent, DROPDOWN_DIRECTIVES, CORE_DIRECTIVES, CORE_DIRECTIVES, PluginUploader, FileUpload]
})

export class EditorController implements AfterViewInit {
    public document: Document = new Document([], [], [], [], [{}, {}, {}]);
    public current_chapter: number = 0;
    public element: ElementRef;
    private snappetParser: SnappetParser;
    private showUploadDiv = false;
    public filesToUpload: Array<File> = [];
    private fontPicker = [];
    private sizePicker = [];
    private choosenFont: string;
    private choosenSize: string;
    private cleanDiv;
    private keymap : KeyMap;

    // drag event variables
    private offsetRight;
    private isResizing;
    private lastDownX;
    private container;
    private left;
    private right;
    private handle;

    private globalListenFunc: Function;

    @ViewChild(CmComponent) cmcomponent: CmComponent;
    @ViewChild(PluginUploader) pluginuploader: PluginUploader;
    @ViewChild(FileUpload) fileUpload: FileUpload;

    constructor(private http: Http, public currElement: ElementRef, private documentService: DocumentService, public renderer: Renderer, private _routeParams: RouteParams, private router: Router) {
        this.element = currElement;
        this.globalListenFunc = renderer.listenGlobal('document', 'keydown', ($event) => {
            this.globalKeyEvent($event);
        });
        if (this._routeParams.get('id')) {
            this.documentService.getDocument(this._routeParams.get('id'), (document2) => {
                this.document = document2;
                this.current_chapter = 0;

                this.choosenSize = this.document.style["fontSize"];
                this.choosenFont = this.document.style["fontFamily"];
                $("#selectFont").val(this.choosenFont);
                $("#selectSize").val(this.choosenSize);
            })
            this.documentService.currentChapter = this.current_chapter;
        }
        this.setFontPickerAndSizePicker();
        this.keymap = new KeyMap();
        this.setupKeyCallbacks();
    }

    ngOnInit() {
        this.documentService.diffObserver.subscribe((diff) => {
            if (diff.cursorActivity || diff.ranges) {
                this.cmcomponent.cursorActivity(diff);
            }

            if (diff.from && diff.to && diff.text) {
                this.cmcomponent.changeOrder(diff);
            }

            if (diff.newchapterName) {
                this.document.chapters[diff.chapterIndex].header = diff.newchapterName;
            }

            if (diff.newchapter) {
                var l = new Line("...", []);
                this.document.chapters.splice(diff.chapterIndex + 1, 0, new Chapter("New chapter", [l]))
            }

            if (diff.deleteChapter) {
                this.document.chapters.splice(diff.chapterIndex, 1);
            }

            if (diff.changeChapter) {
                var fromChapter = this.document.chapters[diff.fromChapter];
                this.document.chapters.splice(diff.fromChapter, 1);
                this.document.chapters.splice(diff.toChapter, 0, fromChapter);
                // here is a bug, if you are currently editing one of the moved chapters,
                // u will automaticly also change chapter, as the index u are in is now a different chapter
            }

            if (diff.newtitle) {
                this.document.title = diff.newtitle;
            }

            if(diff.removeCursor){
                this.cmcomponent.removeCursor(diff);
            }

            if(diff.addCursor){
                this.cmcomponent.addCursor(diff);
            }
        })
    }

    cursorActivity(diff) {
        this.cmcomponent.cursorActivity(diff);
    }

    initializeHandleDragEvents() {
        $("#previewframe").each( () => {
            var iframe = $("#previewframe");
            iframe.on("load", () => {
                iframe.contents().on('mousemove', (e) => {
                    if (!this.isResizing)
                        return;
                    var iframeX = window.parent.document.getElementById('previewframe').getBoundingClientRect().left;
                    this.offsetRight = this.container.width() - (e.clientX + iframeX - this.container.offset().left);
                    this.left.css('right', this.offsetRight);
                    this.right.css('width', this.offsetRight);
                }).on('mouseup', (e) => {
                    this.isResizing = false;
                });
            });
        });
    }

    ngAfterViewInit() {
        this.offsetRight = "40%";
        this.isResizing = false,
        this.lastDownX = 0;
        this.container = $('#containerForEditor');
        this.left = $('#leftInContainerForEditor');
        this.right = $('#rightInContainerForEditor');
        this.handle = $('#handle2');
        this.handle.on('mousedown', (e) => {
            this.isResizing = true;
            this.lastDownX = e.clientX;
        });
        $(document).on('mousemove', (e) => {
            if (!this.isResizing)
                return;
            this.offsetRight = this.container.width() - (e.clientX - this.container.offset().left);
            this.left.css('right', this.offsetRight);
            this.right.css('width', this.offsetRight);
        }).on('mouseup', (e) => {
            this.isResizing = false;
        });

        $("#previewframe").each( () => {
            var iframe = $("#previewframe");
            iframe.on("load", () => {
                iframe.contents().on('mousemove', (e) => {
                    if (!this.isResizing)
                        return;
                    var iframeX = window.parent.document.getElementById('previewframe').getBoundingClientRect().left;
                    this.offsetRight = this.container.width() - (e.clientX + iframeX - this.container.offset().left);
                    this.left.css('right', this.offsetRight);
                    this.right.css('width', this.offsetRight);
                }).on('mouseup', (e) => {
                    this.isResizing = false;
                });;
            });
        });

        $('#previewframe').contents().find('html').on('mousemove', (e) => {
            if (!this.isResizing)
                return;
            var iframeX = window.parent.document.getElementById('previewframe');
            var rect = iframeX.getBoundingClientRect().left;
            this.offsetRight = this.container.width() - (e.clientX + rect - this.container.offset().left);
            this.left.css('right', this.offsetRight);
            this.right.css('width', this.offsetRight);
        }).on('mouseup', (e) => {
            this.isResizing = false;
        });

        $("#updatePreview").click(() => {
            this.parsePreviewFrame();
        });

        var sidebarHidden = false;
        var previewHidden = false;

        $("#sidebarbutton").click(() => {
            if (sidebarHidden) {
                $("#chapter_bar").show(650);
                sidebarHidden = false;
            }
            else {
                $("#chapter_bar").hide(650);
                sidebarHidden = true;
            }
        });

        $("#hidePreview").click(() => {
            if (previewHidden) {
                $("#rightInContainerForEditor").show(650);
                $("#leftInContainerForEditor").animate({ "right": this.offsetRight }, "slow");
                previewHidden = false;
            }
            else {
                $("#leftInContainerForEditor").animate({ "right": "20px" }, "slow");
                $("#rightInContainerForEditor").hide(650);
                previewHidden = true;
            }
        });

        $("#viewDocument").click(() => {
            this.parseWholeDocument();
        });

        $('#selectFont').change(() => {
            this.choosenFont = $('#selectFont').val();
        });

        $('#selectSize').change(() => {
            this.choosenSize = $('#selectSize').val();
        });

    }

    ngOnDestroy() {
        this.globalListenFunc();
    }

    public changeChapter(i) {
        this.current_chapter = i;
    }

    public changeDocumentTitle($event) {
        if (!($event.target.innerHTML == this.document.title)) {
            this.documentService.sendDiff({ newtitle: $event.target.innerHTML }, this.current_chapter);
        }
    }

    public setupKeyCallbacks() {
        this.keymap.keys["parseCurrentChapter"].callback = () => {
            this.parsePreviewFrame();
        }
        this.keymap.keys["parseWholeDocument"].callback = () => {
            // this should be an own function
            var parsedDocument = this.documentService.parseDocument((parsedHTML) => {
                var cleanIframe = $(".widget-templates .cleanIframe").clone();
                document.getElementById('rightInContainerForEditor').replaceChild(cleanIframe[0], document.getElementById('previewframe'));
                var newElement = document.getElementById('rightInContainerForEditor').getElementsByClassName('cleanIframe');
                newElement[0].id = 'previewframe';
                var docElement = jQuery(this.element.nativeElement).find('#previewframe')[0].contentWindow.document;
                var cssFileLink = 'stylesheets/htmlviewsmall.css'
                this.writeContentHTML(docElement, cssFileLink, parsedHTML);
                this.initializeHandleDragEvents();
            });
        }
    }

    public globalKeyEvent($event) {
        // ctrl + S ? other browsers?
        if ($event.which == 115 && ($event.ctrlKey||$event.metaKey)|| ($event.which == 19)) {
            $event.preventDefault();
            return;
        }
        // ctrl / CMD + S (firefox + chrome)
        if ($event.which == 83 && ($event.ctrlKey||$event.metaKey)|| ($event.which == 19)) {
            $event.preventDefault();
            return;
        }
        if ($event.ctrlKey || $event.metaKey) {
            if (this.keymap.referenceKeyList[$event.which]) {
                $event.preventDefault();
                this.keymap.keys[this.keymap.referenceKeyList[$event.which]].doCallback();
            }
        }
    }

    public parseWholeDocument() {
        var parsedDocument = this.documentService.parseDocument((parsedHTML) => {
            var cssFileLink = 'stylesheets/htmlview.css';
            var w = window.open("", "_blank", "");
            var docElement = w.document;
            this.writeContentHTML(docElement, cssFileLink, parsedHTML);
        });
    }

    public writeContentHTML(docElement, cssFileLink, parsedHTML) {
        var total = "<html><head>";
        total += '<link rel="stylesheet" type="text/css" href="http://' + this.documentService.ip + ":" + this.documentService.port + "/" + cssFileLink + '">';
        total += "</head><body><div id='content'><div id='innercontent'>";
        total += parsedHTML;
        total += "</div></div></body></html>";
        var doc = docElement;
        doc.open();
        doc.write(total);
        this.document.style["fontFamily"] = this.choosenFont;
        this.document.style["fontSize"] = this.choosenSize;
        for (var key in this.document.style) {
            var value = this.document.style[key];
            doc.getElementById('innercontent').style[key] = value;
        }
        doc.close();
    }

    goToSettings() {
        this.router.navigate(['Settings', 'DocumentStyle', { id: this.document.id }]);
    }

    uploadClickedImage(file) {
        this.cmcomponent.insertImageWidget(file);
    }

    setFontPickerAndSizePicker() {
        this.fontPicker.push("Georgia, serif")
        this.fontPicker.push('Palatino Linotype", "Book Antiqua", Palatino, serif')
        this.fontPicker.push('"Times New Roman", Times, serif')
        this.fontPicker.push('Arial, Helvetica, sans-serif')
        this.fontPicker.push('"Arial Black", Gadget, sans-serif')
        this.fontPicker.push('"Comic Sans MS", cursive, sans-serif')
        this.fontPicker.push('Impact, Charcoal, sans-serif')
        this.fontPicker.push('"Lucida Sans Unicode", "Lucida Grande", sans-serif')
        this.fontPicker.push('Tahoma, Geneva, sans-serif')
        this.fontPicker.push('"Trebuchet MS", Helvetica, sans-serif')
        this.fontPicker.push('Verdana, Geneva, sans-serif')
        this.fontPicker.push('"Courier New", Courier, monospace')
        this.fontPicker.push('"Lucida Console", Monaco, monospace')

        for (var index = 6; index < 100; index++) {
            this.sizePicker.push(index)
        }
    }

    parsePreviewFrame() {
        this.documentService.parseChapter((parsedHTML) => {
            var cleanIframe = $(".widget-templates .cleanIframe").clone();
            document.getElementById('rightInContainerForEditor').replaceChild(cleanIframe[0], document.getElementById('previewframe'));
            var newElement = document.getElementById('rightInContainerForEditor').getElementsByClassName('cleanIframe');
            newElement[0].id = 'previewframe';
            var docElement = jQuery(this.element.nativeElement).find('#previewframe')[0].contentWindow.document;
            var cssFileLink = 'stylesheets/htmlviewsmall.css'
            this.writeContentHTML(docElement, cssFileLink, parsedHTML);
            this.initializeHandleDragEvents();
        })
    }

}
