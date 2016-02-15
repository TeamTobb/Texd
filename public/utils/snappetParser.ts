import {Renderer} from 'angular2/core';
export class SnappetParser {
    private snippets;
    private element;

    constructor(element, snippets) {
        this.element = element;
        this.snippets = snippets;
    }

    public parseSnappet(element: Node) {
        // var childNode = 
        console.log("parsing snappet");
        var end = element.childNodes["1"].selectionStart;
        var value: String = element.childNodes["1"].value
        console.log("end is: " + end); 
        console.log("value is; " + value);

        var tempPrefix = "";
        for (var i = end - 1; i >= 0; i--) {
            console.log("prefix is: " + tempPrefix); 
            if (!(value[i] == " " || value[i] == undefined || value[i] == "#")) {
                tempPrefix += value[i];
            } else {
                break;
            }
        }
        console.log("tempPrefix: " + tempPrefix); 
        var prefix = tempPrefix.split('').reverse().join('');

        console.log("we have snippets: " + JSON.stringify(this.snippets, null, 2));
        console.log("our snippet is: " + prefix); 
        
        if (this.snippets.img) {

            console.log("we have snippets for this tag");
            var beforestring = value.substring(0, end - prefix.length);
            var afterString = value.substring(end, value.length);

            var snappetString = this.snippets[prefix].body; 
            
            // element.childNodes["1"].setSelectionRange(0, 5); 
            element.childNodes["1"].value = beforestring + snappetString + afterString;
            // var range = element.childNodes["1"].createTextRange();
            // var range = document.createRange(); 
            // range.setStart(element.childNodes["1"], 5);
            // range.setEnd(element.childNodes["1"], 10); 


            // var input = document.getElementById("para222");
            // console.log(element.childNodes); 
            // element.childNodes["1"].setSelectionRange(2, 5); 	
            // element.childNodes["1"].setSelectionRange(0, element.childNodes["1"].value.length);
            

            // var $newSelection = element.childNodes["1"]
            // var selection = window.getSelection();
            // var range = document.createRange();
            // range.setStartBefore($newSelection.first()[0]);
            // range.setEndAfter($newSelection.last()[0]);
            // selection.removeAllRanges();
            // selection.addRange(range);
            
            
            if ('selectionStart' in element.childNodes["1"]) {
                // element.childNodes["1"].focus ();
                // input.selectionStart = 3;
                // input.selectionEnd = 5;
                // input.focus ();
                element.childNodes["1"].selectionStart = 3;
                element.childNodes["1"].selectionEnd = 5;
                element.childNodes["1"].focus ();
            }
            // else {  // Internet Explorer before version 9
            //     // var inputRange = input.createTextRange ();
            //     // inputRange.moveStart ("character", 1);
            //     // inputRange.collapse ();
            //     // inputRange.moveEnd ("character", 1);
            //     // inputRange.select ();
            // }
            // range.collapse(true);
            // range.moveStart('character', 5);
            // range.moveEnd('character', 10);
            // range.select();
            
        }

    }
}