import {Plugin} from './parseMap';

export class jsonToHtml {
    private hashMap: { [id: string]: Plugin } = {};

    constructor(hashMap: any) {
        this.hashMap = hashMap;
    }

    public iterate(obj, stack) {
        var temp_html = "";
        for (var property in obj) {
            console.log(property);
            if (property == "attributes") {
                // do nothing
            }
            else if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] == "object") {
                    // tag exists
                    if (this.hashMap[property]) {
                        var attributeList = obj[property][0].attributes;
                        temp_html += this.hashMap[property].generateHtmlWithAttr(attributeList, this.iterate(obj[property], stack + '.' + property));
                    }
                    else {
                        temp_html += this.iterate(obj[property], stack + '.' + property);
                    }
                } else {
                    temp_html += obj[property];
                }
            }
        }
        return temp_html;
    }

    public getParsedHTML(inputJSON: string): string {
        var content = JSON.parse(inputJSON).content;
        var t = this.iterate(content, '');
        console.log(t);
        return t;
    }
}
