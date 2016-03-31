
import {Paragraph} from './document.ts'

export class Diff {
    private _documentId: string;
    private _chapterId: string;
    private _chapterIndex: number;
    private _paragraphId: string;
    private _paragraph: Paragraph;
    private _index: number;
    private _newelement: boolean;
    private _newchapter: boolean;

    constructor(documentId?, chapterId?, chapterIndex?, paragraphId?, paragraph?, index?, newelement?, newchapter?, payload?) {
        if (payload) {
            this._documentId = payload._documentId;
            this._chapterId = payload._chapterId;
            this._chapterIndex = payload._chapterIndex;
            this._paragraph = new Paragraph(payload._paragraph._raw, payload._paragraph._metadata);
            this._index = payload._index;
            this._newelement = payload._newelement;
            this._newchapter = payload._newchapter;
        } else {
            this._documentId = documentId;
            this._chapterId = chapterId;
            this._chapterIndex = chapterIndex;
            this._paragraphId = paragraphId
            this._paragraph = paragraph;
            this._index = index;
            this._newelement = newelement;
            this._newchapter = newchapter;
        }
    }

    get documentId(): string {
        return this._documentId;
    }

    set documentId(value) {
        this._documentId = value;
    }

    get chapterId(): string {
        return this._chapterId;
    }

    set chapterId(value) {
        this._chapterId = value;
    }

    get chapterIndex(): number {
        return this._chapterIndex;
    }

    set chapterIndex(value) {
        this._chapterIndex = value;
    }

    get paragraph(): Paragraph {
        return this._paragraph;
    }

    set paragraph(value) {
        this._paragraph = value;
    }

    get index(): number {
        return this._index;
    }

    set index(value) {
        this._index = value;
    }

    get newelement(): boolean {
        return this._newelement;
    }

    set newelement(value) {
        this._newelement = value;
    }

    get newchapter() {
        return this._newchapter;
    }

    set newchapter(value) {
        this._newchapter = value;
    }
}
