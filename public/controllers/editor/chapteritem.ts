import {Component, Input, Output, OnChanges, SimpleChange} from 'angular2/core';
import {Directive} from "angular2/core";
import {OnInit} from 'angular2/core';
import {EventEmitter} from "angular2/src/facade/async";
import {DocumentService} from '../../service/document.ts';
import {Document, Line, Chapter} from '../../domain/document.ts';


@Component({
    selector: 'chapteritem',
    templateUrl: 'views/editor/chapteritem.html'

})
export class ChapterItem implements OnChanges {
    @Input() chapterName: string;
    @Input() chapterNr: string;
    @Input() chapterId: string;
    @Input() documentId: string;
    @Output() toBeDeleted: EventEmitter<any> = new EventEmitter();

    constructor(private documentService: DocumentService) { }
    // TODO Make alert, sure you want to delete this chapter?
    delete(event, nr: any) {
        event.stopPropagation();
        nr = this.chapterNr;
        this.toBeDeleted.emit(nr)
    }

    rename($event, chapterId, documentId) {
        var newchapterName: string = $event.target.innerHTML
        this.documentService.sendDiff({ newchapterName }, this.chapterNr)
        $event.target.setAttribute("contenteditable", "false");
    }

    ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {        
        // TODO: Find a better way to set the first item as selected
        if (changes["chapterNr"] && this.chapterNr == 0 + "") {
            var selectedChapter = document.getElementById('chapter_item_' + this.chapterNr);
            var otherChapters = document.getElementsByClassName('droptarget');
            for (var i = 0; i < otherChapters.length; i++) {
                otherChapters[i].className = "droptarget";
            }
            if (selectedChapter !== null) {
                selectedChapter.className = "droptarget active";
            }
        }
    }

    ondblclickChapter($event) {
        $event.target.setAttribute("contenteditable", "true");
    }
}
