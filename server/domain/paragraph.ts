class Paragraph{
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

export = Paragraph; 