export class KeyMap {
    public keys: { [name: string]: KeyItem } = {};
    public referenceKeyList : { [key : number] : string} = {};

    constructor() {
        this.setupStandardKeySettings();
    }

    private setupStandardKeySettings() {
        this.keys["parseCurrentChapter"] = new KeyItem("parseCurrentChapter", 80, "ctrl/cmd+p", "Parses the current chapter and set it in preview");
        this.keys["parseWholeDocument"] = new KeyItem("parseWholeDocument", 73, "ctrl/cmd+i", "Parses the entire document and set it in preview");
        this.keys["test"] = new KeyItem("test", 69, "ctrl/cmd+e", "testing..");

        for(var k in this.keys) {
            this.referenceKeyList[this.keys[k].key] = this.keys[k].name;
        }
    }
}

export class KeyItem {
    public name: string;
    public key: number;
    public shortcut : string;
    public description: string;
    public callback : Function;

    constructor(name : string, key : number, shortcut: string, description : string) {
        this.name = name;
        this.key = key;
        this.shortcut = shortcut;
        this.description = description;
    }

    public doCallback() {
        if (this.callback) this.callback();
    }
}
