
import {Paragraph} from './document.ts'

export class Diff{
    private _chapter: number;
    private _paragraph: Paragraph;
    private _index: number;
    private _newelement: boolean;
    private _newchapter: boolean; 
    
    constructor(chapter?, paragraph?, index?, newelement?, newchapter?, payload?){
        if(payload){          
            this._chapter = payload._chapter;
            this.paragraph = new Paragraph(payload._paragraph._raw, payload._paragraph._metadata); 
            this._index = payload._index;
            this._newelement = payload._newelement;
            this._newchapter = payload._newchapter; 
        } else{
            this._chapter = chapter; 
            this._paragraph = paragraph; 
            this._index = index; 
            this._newelement = newelement;
            this._newchapter = newchapter; 
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
    
    get newchapter(){
        return this._newchapter; 
    }
    
    set newchapter(value){
        this._newchapter = value; 
    }
}
