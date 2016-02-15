export class ParseMap {
    public parseMap: { [tagname: string]: Plugin } = {}; // TODO: Make static

    generateParseMap(plugins: any[]) {
        plugins.forEach((plugin) => {
            this.generatePlugin(plugin);
        });

        // var attributeList = [];
        // attributeList["src"] = "my_funny_picture2.jpg";
        // attributeList["height"] = "40px";
        // console.log(attributeList);
        // console.log(this.parseMap["#img"].generateHtmlWithAttr(attributeList, "this is a test value"));
        // console.log(this.parseMap["#b"].generateHtmlWithAttr(attributeList, "this is a test value"));
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
                                console.log("@" + temp_tag);
                                console.log(attributeList);
                                if (attributeList["@" + temp_tag]) {
                                    console.log("works??");
                                    html += attributeList["@" + temp_tag];
                                } else {
                                    // attribute is not present in the raw paragraph
                                    console.log("error2");
                                }
                            } else {
                                // do some error handling
                                console.log("error");
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
            }
        })
        this.parseMap["#" + plugin.tagname] = p;
    }
}

export interface Plugin {
    getRef: (parentRef) => any;
    generateHtmlWithAttr: (attributeList, value) => any;
}
