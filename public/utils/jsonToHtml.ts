import {Plugin} from './parseMap';

export class jsonToHtml {
    // public json : string = '{"content":[{"text":"test"},{"h1":[{"text":"her"},{"b":[{"h1":[{"text":"er"}]}]},{"text":"det"},{"b":[{"text":"noe"}]},{"text":"tull."},{"h1":[{"text":"Hei"},{"b":[{"text":"bloggen"}]},{"text":"!"}]}]}]}';
    public html : string = "";
    public stack = [];
    // public hashMap: { [id: string]: boolean } = {};
    private hashMap : { [id : string] : Plugin } = {};


    constructor(hashMap : any) {
        this.hashMap = hashMap;
        // this.hashMap['h1'] = true;
        // this.hashMap['b'] = true;
        // this.hashMap['p'] = true;
        // console.log("inside jsonToHtml");
        console.log(this.hashMap);
    }

    /* example plugin
    {
    	"tagname" : "img",
    	"html" : "<img src='$src' height='$height' width='$width'>$value</img>",
    	"attr" : ["src"],
    	"optattr" : ["height","width"]
    }
    consider adding allowed nested somehow
    */

    // generateHtmlWithAttr: (attributeList, value) => any;

    // var attributeList = [];
    // attributeList["src"] = "my_funny_picture2.jpg";
    // attributeList["height"] = "40px";
    // console.log(attributeList);
    // console.log(this.parseMap["#img"].generateHtmlWithAttr(attributeList, "this is a test value"));
    // console.log(this.parseMap["#b"].generateHtmlWithAttr(attributeList, "this is a test value"));

    public iterate(obj, stack) {
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] == "object") {
                    // console.log(property);
                    // tag exists
                    if(this.hashMap[property]) {
                        // 1
                        // this.html = this.html + "<" + property + ">";

                        // var attr = getAllAttrFromThisProperty...
                        // var value = getFirstText appearance
                        // this.html = generateHtmlWithAttr(attr, value);
                        // in the next iterate it must avoid attributes(?)

                        // create a new stack -> send in to next iterate (must also return the valeus)
                        // 2
                        // this.hashMap[property].generateHtmlWithAttr()
                        // this.iterate(obj[property], stack + '.' + property);

                        //
                        // this.html = getClosingBracket();
                        // 3
                        // this.html = this.html + "</" + property + ">";
                        // console.log("tesqweqweqweqwet");
                        // console.log(obj[property]);
                        var attributeList = obj[property][0].attributes;
                        console.log("list: " + JSON.stringify(attributeList));
                        // console.log(attributeList);
                        this.html = this.html + this.hashMap[property].generateHtmlWithAttr(attributeList, this.iterate(obj[property], stack + '.' + property));

                        // tag does not exist -> drop it
                    } else {
                        this.iterate(obj[property], stack + '.' + property);
                    }
                    // no object => text only?
                } else {
                    this.html = this.html + obj[property];
                    return obj[property];
                    // this.html = this.html + obj[property];
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
