import Paragraph = require('./paragraph')
class Chapter{
    private _header: string;
    private _paragraphs: Paragraph[];

    constructor(header, paragraphs){
        this._header = header; 
        this._paragraphs = paragraphs; 
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