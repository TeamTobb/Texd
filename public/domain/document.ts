export class Document{
    private _title: string;
    private _documentname: string;
    private _authors: string[];
    private _chapters: Chapter [];
    
    constructor(title, documentname, authors, chapters){
        this._title = title; 
        this._documentname = documentname; 
        this._authors = authors; 
        this._chapters = chapters; 
    }

    get title(): string{
        return this._title;
    }

    set title(value){
        this._title = value;
    }

    get documentname(): string{
        return this._documentname;
    }

    set documentname(value){
        this._documentname = value;
    }

    get authors(): string[]{
        return this._authors;
    }

    set authors(value){
        this._authors = value;
    }

    get chapters(): Chapter[]{
        return this._chapters;
    }

    set chapters(value){
        this._chapters= value;
    }
}


export class Chapter{
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

export class Paragraph{
    private _raw: string;
    private _metadata: any[];
    
    constructor(raw, metadata){
        this._raw = raw; 
        this._metadata = metadata; 
    }

    get raw(): string{
        return this._raw;
    }

    set raw(value){
        this._raw = value;
    }

    get metadata(): any[] {
        return this._metadata;
    }

    set metadata(value){
        this._metadata = value;
    }
}
