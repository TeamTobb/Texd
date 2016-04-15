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
import {FileUploaderClass} from './fileUpLoader.ts'
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
    providers: [DocumentService, HTTP_BINDINGS],
    directives: [ChapterItem, CmComponent, DROPDOWN_DIRECTIVES, CORE_DIRECTIVES, FileUploaderClass, CORE_DIRECTIVES]
})

export class EditorController implements AfterViewInit {
    public document: Document = new Document([], [], [], [], [{}, {}, {}]);
    public current_chapter: number = 0;
    public current_paragraph: number = 0;
    public element: ElementRef;
    private snappetParser: SnappetParser;
    private showUploadDiv = false;
    public filesToUpload: Array<File> = [];
    private fontPicker = [];
    private sizePicker = [];
    private choosenFont: string;
    private choosenSize: string;
    
    @Input() fontToBe: any;
    @ViewChild(CmComponent) cmcomponent: CmComponent;
    
    constructor(private http: Http, public currElement: ElementRef, private documentService: DocumentService, public renderer: Renderer, private _routeParams: RouteParams, private router: Router) {
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
        this.setFontPickerAndSizePicker();
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
                for (var chapter of this.document.chapters) {
                    if (chapter.id == diff.chapterId) {
                        chapter.header = diff.newchapterName;
                        break;
                    }
                }
            }

            if (diff.newchapter) {
                var l = new Line("Text", []);
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
        })
    }

    cursorActivity(diff) {
        this.cmcomponent.cursorActivity(diff);
    }

    ngAfterViewInit() {
        // initialize jquery functions
        var offsetRight = "40%";
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
            offsetRight = container.width() - (e.clientX - container.offset().left);
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
                $("#leftInContainerForEditor").animate({ "right": offsetRight }, "slow");
                previewHidden = false;
            }
            else {
                $("#leftInContainerForEditor").animate({ "right": "20px" }, "slow");
                $("#rightInContainerForEditor").hide(650);
                previewHidden = true;
            }
        });

        $('#selectFont').change(() => {
            this.choosenFont = $('#selectFont').val();
            console.log(this.choosenFont);
        });

        $('#selectSize').change(() => {
            this.choosenSize = $('#selectSize').val();
            console.log(this.choosenSize);
        });
    }

    public changeChapter(i) {
        this.current_chapter = i;
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
                document.getElementById('previewframe').removeAttribute;
                document.getElementById('previewframe').innerHTML = parsedHTML;
                this.document.style["fontFamily"] = this.choosenFont;
                this.document.style["fontSize"] = this.choosenSize + "px";
                console.log(this.document.style)

                for (var key in this.document.style) {
                    var value = this.document.style[key];
                    document.getElementById('previewframe').style[key] = value;
                }
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

    goToSettings() {
        this.router.navigate(['Settings', 'DocumentStyle', { id: this.document.id }]);
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
    
    fontSelected(font) {
        console.log(font)
        console.log(this.fontToBe)
    }
}
