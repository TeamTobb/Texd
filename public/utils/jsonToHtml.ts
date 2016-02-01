export class jsonToHtml {
    // public json : string = '{"content":[{"text":"test"},{"h1":[{"text":"her"},{"b":[{"h1":[{"text":"er"}]}]},{"text":"det"},{"b":[{"text":"noe"}]},{"text":"tull."},{"h1":[{"text":"Hei"},{"b":[{"text":"bloggen"}]},{"text":"!"}]}]}]}';
    public html : string = "";
    public stack = [];
    public hashMap: { [id: string]: boolean } = {};

    constructor() {
        this.hashMap['h1'] = true;
        this.hashMap['b'] = true;
    }

    public iterate(obj, stack) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] == "object") {
                    if(this.hashMap[property]) {
                        this.html = this.html + "<" + property + ">";
                        // var attr = getAllAttrFromThisProperty...
                        // var value = getFirstText appearance
                        // this.html = generateHtmlWithAttr(attr, value);
                        // in the next iterate it must avoid attributes(?)

                        // create a new stack -> send in to next iterate (must also return the valeus)
                        this.iterate(obj[property], stack + '.' + property);

                        // 
                        // this.html = getClosingBracket();
                        this.html = this.html + "</" + property + ">";
                    } else {
                        this.iterate(obj[property], stack + '.' + property);
                    }
                } else {
                    this.html = this.html + obj[property];
                }
            }
        }
    }

    public getParsedHTML(inputJSON : string) : string {
        this.html = "";
        var content = JSON.parse(inputJSON).content;
        this.iterate(content, '');
        return this.html;
    }
}
