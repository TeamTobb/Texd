import {Document, Paragraph, Chapter} from '../domain/document.ts';

export class Parser {

    public getParsedJSON(inputText : Paragraph[]) : string {
        var hashMap: { [id: string]: parseMap} = {};

        hashMap["#b"] = <parseMap> ({
            getRef: (obj) => {
                var b = [];
                obj.push({b : b});
                return b;
            }
        });
        hashMap["#h1"] = <parseMap> ({
            getRef: (obj) => {
                var h1 = [];
                obj.push({h1 : h1});
                return h1;
            }
        });
        // need to handle this differently tho
        hashMap["#p"] = <parseMap> ({
            getRef: (obj) => {
                var p = [];
                obj.push({p : p});
                return p;
            }
        });

        return this.parseText(hashMap, inputText);
    }

    public parseText(hashMap : any, inputText : Paragraph[] ) : string {



        var outputJSON : any = {};

        var mergedParas = "";

        for (var para in inputText) {
            mergedParas += " #p "
            mergedParas += inputText[para].raw;
            mergedParas += " # "
        }

        var list = mergedParas.split(" ");

        var refStack : any = [];
        var tempText : string = "";

        outputJSON.content = [];
        refStack.push(outputJSON.content);

        for (var elem in list){
            if (hashMap[list[elem]]) {
                // reached a valid starting hashtag
                if (tempText != "") {
                    refStack[refStack.length-1].push({text : tempText.trim()});
                    tempText = "";
                }
                // push new tag to refStack
                refStack.push(hashMap[list[elem]].getRef(refStack[refStack.length-1]));
                // TODO: maybe rename getRef to createRef or something more precise
            }
            else if (list[elem] == "#") {
                // reached an ending tag
                if (tempText != "") {
                    refStack[refStack.length-1].push({text : tempText.trim()});
                    tempText = "";
                }
                // can never remove the content element
                if (refStack.length > 1) {
                    // remove popped element from JSON if it is empty
                    var poppedObj = refStack.pop();
                    if(poppedObj.length == 0) {
                        this.deleteEmptyArray(refStack[refStack.length-1], poppedObj);
                    }
                }
            }
            else {
                // normal text
                // TODO: trim the tags and dont remove space on split instead
                tempText += list[elem] + " ";
            }
        }

        if (tempText != "") {
            refStack[refStack.length-1].push({text : tempText.trim()});
        }

        // this.writeJSONtoFile(outputJSON, "test.json");

        return JSON.stringify(outputJSON, null, 2);
    }

    public writeJSONtoFile(outputJSON : string, filename: string) {
        var fs = require('fs');
        fs.writeFile(filename, JSON.stringify(outputJSON, null, 2), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }

    public deleteEmptyArray(fromObj: any, ref : any) {
        for (var property in fromObj) {
            for (var prop in fromObj[property]) {
                if(ref === fromObj[property][prop]) {
                    fromObj.splice(property);
                }
            }
        }
    }
}

interface parseMap {
    getRef: (obj) => any;
}
