import Paragraph = require('./paragraph')
class Chapter{
    private _id: string;
    private _header: string;
    private _paragraphs: Paragraph[];

    constructor(header, paragraphs){
        this._header = header;
        this._paragraphs = paragraphs;
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

    get paragraphs(): Paragraph[] {
        return this._paragraphs;
    }

    set paragraphs(value){
        this._paragraphs = value;
    }
}

export = Chapter;
