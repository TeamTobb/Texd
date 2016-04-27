import {Renderer} from 'angular2/core';
export class SnappetParser {
    private snippets;
    private element;
    private placeHolders = [];

    constructor(element, snippets) {
        this.element = element;
        this.snippets = snippets;
    }
    
    public nextPlaceholder(element: Node) {
        var placeHolder = this.placeHolders[0];
        if ('selectionStart' in element.childNodes["1"]) {
            element.childNodes["1"].selectionStart = placeHolder.start;
            element.childNodes["1"].selectionEnd = placeHolder.start+placeHolder.length;
            element.childNodes["1"].focus ();
        }
        this.placeHolders.splice(0,1);
    }

    public parseSnappet(element: Node) {
        // var childNode = 
        var end = element.childNodes["1"].selectionStart;
        var value: String = element.childNodes["1"].value
      

        var tempPrefix = "";
        for (var i = end - 1; i >= 0; i--) {
            if (!(value[i] == " " || value[i] == undefined || value[i] == "#")) {
                tempPrefix += value[i];
            } else {
                break;
            }
        }
        var prefix = tempPrefix.split('').reverse().join('');
  
        if (this.snippets.img) {

            var beforestring = value.substring(0, end - prefix.length);
            var afterString = value.substring(end, value.length);

            var snappetString = this.snippets[prefix].body; 
             
            element.childNodes["1"].value = beforestring + snappetString + afterString;
            
             
            this.placeHolders = [];
            var placeHolder : any = {};
            placeHolder.start = 10;
            placeHolder.length = 4;
            this.placeHolders.push(placeHolder);
            var placeHolder : any = {};
            placeHolder.start = 20;
            placeHolder.length = 4;
            this.placeHolders.push(placeHolder);
            var placeHolder : any = {};
            placeHolder.start = 30;
            placeHolder.length = 4;
            this.placeHolders.push(placeHolder);
        }
    }
}