export class ParseMap {
    public parseMap: { [tagname: string]: Plugin } = {}; // TODO: Make static

    generateParseMap(plugins: any[]) {
        plugins.forEach((plugin) => {
            this.generatePlugin(plugin);
        });
    }

    generateLegalAttributes(attr, optattr) {
        var temp = [];
        var concat = attr.concat(optattr);
        for (var a in concat) {
            temp[concat[a]] = true;
        }
        return temp;
    }

    generatePlugin(plugin: any) {
        var p = <Plugin>({
            getRef: (parentRef) => {
                var temp = [];
                var attributeList = {};
                temp.push({ attributes: attributeList });
                var obj = {};
                obj["#" + plugin.tagname] = temp;
                parentRef.push(obj);
                return temp;
            },
            generateHtmlWithAttr: (attributeList, value) => {
                var testraw = plugin.html;
                var legalAttributes = this.generateLegalAttributes(plugin.attr, plugin.optattr);
                var requiredAttributes = plugin.attr;
                var html = "";
                var temp_tag = "";
                var tag_found = false;
                for (var char in testraw) {
                    if (tag_found) {
                        if (testraw[char] == "'" || testraw[char] == "<") {
                            tag_found = false;
                            if (temp_tag == "value") {
                                html += value;
                            } else if (legalAttributes[temp_tag]) {
                                // console.log("@" + temp_tag);
                                // console.log(attributeList);
                                if (attributeList["@" + temp_tag]) {
                                    // console.log("works??");
                                    html += attributeList["@" + temp_tag];
                                } else {
                                    // attribute is not present in the raw paragraph
                                    console.log("error - attribute is not present in the raw paragraph");
                                }
                            } else {
                                // do some error handling
                                console.log("error - in parseMap.generateHtmlWithAttr - not valid attribute or value (?)");
                            }
                            temp_tag = "";
                            html += testraw[char];
                        } else {
                            temp_tag += testraw[char];
                        }
                    } else {
                        if (testraw[char] == "$") {
                            tag_found = true;
                        } else {
                            html += testraw[char];
                        }
                    }
                }
                return html;
            },
            item: {
                tagname: plugin.tagname,
                html: plugin.html,
                attr: plugin.attr,
                optattr: plugin.optattr,
                description: plugin.description
            }
        })
        this.parseMap["#" + plugin.tagname] = p;
    }
}

export interface Plugin {
    getRef: (parentRef) => any;
    generateHtmlWithAttr: (attributeList, value) => any;
    item: PluginItem;
}

export interface PluginItem {
    tagname: string;
    html: string;
    attr: string[];
    optattr: string[];
    description: string;
}
