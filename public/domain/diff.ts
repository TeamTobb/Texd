
import {Paragraph} from './document.ts'

export class Diff{
    private _chapter: number;
    private _paragraph: Paragraph;
    private _index: number;
    private _newelement: boolean;
    
    constructor(chapter, paragraph, index, newelement, payload?){
        if(payload){          
            this._chapter = payload._chapter;
            this._paragraph = payload._paragraph;
            this._index = payload._index;
            this._newelement = payload._newelement;
        } else{
            this._chapter = chapter; 
            this._paragraph = paragraph; 
            this._index = index; 
            this._newelement = newelement;
        }       
    }
    
    get chapter(): number{
        return this._chapter;
    }

    set chapter(value){
        this._chapter = value;
    }

    get paragraph(): Paragraph{
        return this._paragraph;
    }

    set paragraph(value){
        this._paragraph = value;
    }

    get index(): number{
        return this._index;
    }

    set index(value){
        this._index = value;
    }

    get newelement(): boolean{
        return this._newelement;
    }

    set newelement(value){
        this._newelement = value;
    }
}
