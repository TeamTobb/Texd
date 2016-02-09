class Paragraph{
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

export = Paragraph; 