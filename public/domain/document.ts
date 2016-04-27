export class Document {
    private _id: string;
    private _idTest: number;
    private _title: string;
    private _documentname: string;
    private _authors: string[];
    private _chapters: Chapter[];
    private _style: {};

    constructor(idTest?, title?, documentname?, authors?, chapters?, payload?, style?) {
        if (payload) {
            this._id = payload._id;
            this._title = payload._title;
            this._documentname = payload._documentname;
            this._idTest = payload._idTest;
            this._authors = payload._authors;
            this._chapters = new Array<Chapter>();
            this._style = payload._style;

            for (var i = 0; i < payload._chapters.length; i++) {
                this._chapters.push(new Chapter(payload._chapters[i]._header, []));
                this._chapters[i].id = payload._chapters[i]._id;
                var lineLength = payload._chapters[i]._lines.length;

                for (var j = 0; j < lineLength; j++) {
                    this._chapters[i].lines[j] = new Line(payload._chapters[i]._lines[j]._raw, payload._chapters[i]._lines[j]._metadata);
                    this._chapters[i].lines[j].id = payload._chapters[i]._lines[j]._id;
                }
            }
        } else if (idTest && title && documentname && authors && chapters) {
            this._idTest = idTest;
            this._title = title;
            this._documentname = documentname;
            this._authors = authors;
            this._chapters = chapters;
        }
    }

    get id(): string {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get idTest(): number {
        return this._idTest;
    }

    set idTest(value) {
        this._idTest = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get documentname(): string {
        return this._documentname;
    }

    set documentname(value) {
        this._documentname = value;
    }

    get authors(): string[] {
        return this._authors;
    }

    set authors(value) {
        this._authors = value;
    }

    get chapters(): Chapter[] {
        return this._chapters;
    }

    set chapters(value) {
        this._chapters = value;
    }
    
    get style(): {} {
        return this._style;
    }

    set style(value) {
        this._style = value;
    }
}


export class Chapter {
    private _id: string;
    private _header: string;
    private _lines: Line[];

    constructor(header, lines) {
        this._header = header;
        this._lines = lines;
    }

    get id(): string {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get header(): string {
        return this._header;
    }

    set header(value) {
        this._header = value;
    }

    get lines(): Line[] {
        return this._lines;
    }

    set lines(value) {
        this._lines = value;
    }
}

export class Line {
    private _id: string;
    private _raw: string;
    private _metadata: any[];

    constructor(raw, metadata) {
        this._raw = raw;
        this._metadata = metadata;
    }

    get id(): string {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get raw(): string {
        return this._raw;
    }

    set raw(value) {
        this._raw = value;
    }

    get metadata(): any[] {
        return this._metadata;
    }

    set metadata(value) {
        this._metadata = value;
    }
}
