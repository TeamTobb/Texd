export class Document{
    private _id: string; 
    private _idTest: number; 
    private _title: string;
    private _documentname: string;
    private _authors: string[];
    private _chapters: Chapter [];
    
    constructor(idTest?, title?, documentname?, authors?, chapters?){
        if(idTest && title && documentname && authors && chapters){ 
            this._idTest = idTest; 
            this._title = title; 
            this._documentname = documentname; 
            this._authors = authors; 
            this._chapters = chapters;  
        }
    }
    
    get id(): string{
        return this._id; 
    }
    
    set id(value){
        this._id = value;
    }

    get idTest(): number{
        return this._idTest; 
    }
    
    set idTest(value){
        this._idTest = value; 
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

export class Paragraph{
    private _id: string; 
    private _raw: string;
    private _metadata: any[];
    
    constructor(raw, metadata){
        this._raw = raw; 
        this._metadata = metadata; 
    }
    
    get id(): string{
        return this._id; 
    }
    
    set id(value){
        this._id = value; 
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
