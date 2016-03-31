import Line = require('./line')
class Chapter{
    private _id: string;
    private _header: string;
    private _lines: Line[];

    constructor(header, paragraphs){
        this._header = header;
        this._lines = paragraphs;
    }

    get id(): string{
        return this._id;
    }

    set id(value){
        this._id = value;
    }

    get header(): string{
        return this._header;
    }

    set header(value){
        this._header = value;
    }

    get paragraphs(): Line[] {
        return this._lines;
    }

    set paragraphs(value){
        this._lines = value;
    }
}

export = Chapter;
