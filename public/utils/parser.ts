import {Document, Paragraph, Chapter} from '../domain/document.ts';

export class Parser {
    private hashMap: { [id: string]: Plugin } = {};

    constructor(hashMap: any) {
        this.hashMap = hashMap; 
    }

    public getParsedJSON(inputText: Paragraph[]): string {

        var mergedParas = "";
        for (var para in inputText) {
            mergedParas += " #p ";
            mergedParas += inputText[para].raw;
            mergedParas += " # ";
        }
        var list = this.parseString(mergedParas);
        for (var i = 0; i < list.length; i++) list[i] += " ";

        
        return this.parseText(this.hashMap, list);
    }
    
     public getParsedJSONSingle(inputText: Paragraph): string {
        var list = this.parseString(inputText.raw);
        for (var i = 0; i < list.length; i++) list[i] += " ";
        return this.parseText(this.hashMap, list);
    }

    public parseString(str) {
        var re = /(?:")([^"]+)(?:")|([^\s"]+)(?=\s+|$)/g;
        var res = [], arr = null;
        while (arr = re.exec(str)) { res.push(arr[1] ? arr[1] : arr[0]); }
        return res;
    }
    
    public parseText(hashMap: any, inputText: any[]): string {
        
         var outputJSON: any = {};
        
        var list = inputText;
        
        var refStack: any = [];
        var tempText: string = "";
        var attributeList: any[] = [];

        outputJSON.content = [];
        refStack.push(outputJSON.content);

        for (var elem in list) {
            if (hashMap[list[elem].trim()]) {
                // reached a valid starting hashtag
                if (tempText != "") {
                    refStack[refStack.length - 1].push({ text: tempText });
                    tempText = "";
                }
                // push new tag to refStack
                refStack.push(hashMap[list[elem].trim()].getRef(refStack[refStack.length - 1]));
                // TODO: maybe rename getRef to createRef or something more precise
            }
            else if (list[elem].trim() == "#") {
                // reached an ending tag
                if (tempText != "") {
                    refStack[refStack.length - 1].push({ text: tempText });
                    tempText = "";
                }
                // can never remove the content element
                if (refStack.length > 1) {
                    // remove popped element from JSON if it is empty
                    var poppedObj = refStack.pop();
                    if (poppedObj.length == 0) {
                        this.deleteEmptyArray(refStack[refStack.length - 1], poppedObj);
                    }
                }
            }
            else {
                if (list[elem].startsWith("@")) {
                    refStack[refStack.length - 1][0].attributes[list[elem].trim()] = list[parseInt(elem) + 1].trim();
                    list.splice(parseInt(elem) + 1, 1);
                }
                else {
                    tempText += list[elem];
                }
            }
        }

        if (tempText != "") {
            refStack[refStack.length - 1].push({ text: tempText });
        }

        return JSON.stringify(outputJSON, null, 2);
    }

    public writeJSONtoFile(outputJSON: string, filename: string) {
        var fs = require('fs');
        fs.writeFile(filename, JSON.stringify(outputJSON, null, 2), function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }

    public deleteEmptyArray(fromObj: any, ref: any) {
        for (var property in fromObj) {
            for (var prop in fromObj[property]) {
                if (ref === fromObj[property][prop]) {
                    fromObj.splice(property);
                }
            }
        }
    }
}
