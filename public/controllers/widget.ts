// helper function to move caret - from http://stackoverflow.com/questions/10778291/move-the-cursor-position-with-javascript
function moveCaret(win, charCount) {
    var sel, range;
    if (win.getSelection) {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var textNode = sel.focusNode;
            var newOffset = sel.focusOffset + charCount;
            sel.collapse(textNode, Math.min(textNode.length, newOffset));
        }
    } else if ( (sel = win.document.selection) ) {
        if (sel.type != "Control") {
            range = sel.createRange();
            range.move("character", charCount);
            range.select();
        }
    }
}

// helper function to get caret position - from http://stackoverflow.com/questions/3972014/get-caret-position-in-contenteditable-div
function getCaretPosition(editableDiv) {
  var caretPos = 0,
    sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() == editableDiv) {
      var tempEl = document.createElement("span");
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
      var tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
}

function posEq(a, b) {return a.line == b.line && a.ch == b.ch;}

// When opening the document , each parsed widget will fire a new diff.
// Have a “parsing” true option?
// have another “origin” on replace when parsing == true

export function Widget(cm, optRange, onParse) {
    this.parsing = false;
    if(onParse) {
        this.parsing = true;
    }
    this.cm = cm;
    var from = null;
    var to = null;
    console.log(optRange);
    if (optRange != null) {
        this.value = this.cm.getRange(optRange.from, optRange.to).trim();
        from = optRange.from;
        to = optRange.to;
    } else {
        this.value = cm.getSelection();
        from = cm.getCursor("from");
        to = cm.getCursor("to");
        console.log(from);
        console.log(to);
    }
    this.mark = cm.markText(from, to);
}
Widget.prototype.range = function() {
    var find = this.mark.find()
    find.from.ch+=1
    find.to.ch-=1
    return find;
}
Widget.prototype.setText = function(text) {
    var r = this.range()
    this.cm.replaceRange(text, r.from, r.to)
}
Widget.prototype.getText = function() {
    var r = this.range()
    return this.cm.getRange(r.from, r.to)
}

export function GeneralSpanWidget(cm, optRange, className, hashtag) {
    this.node = $(".widget-templates .general-span-widget").clone();
    this.nodeEnd = $(".widget-templates .general-span-widget").clone();
    this.domNode = this.node[0];
    this.domNodeEnd = this.nodeEnd[0];
    Widget.apply(this, arguments);
    this.node[0].textContent = "";
    this.nodeEnd[0].textContent = "";
    if (optRange != null) {
        this.mark = cm.markText({line: optRange.from.line, ch: optRange.from.ch}, {line: optRange.to.line, ch : optRange.to.ch}, {className: className});
        cm.markText({line: optRange.to.line, ch: optRange.to.ch-2}, optRange.to, {replacedWith: this.domNodeEnd, clearWhenEmpty: false});
        cm.markText(optRange.from, {line: optRange.from.line, ch: optRange.from.ch+3}, {replacedWith: this.domNode, clearWhenEmpty: false});
    } else {
        cm.replaceSelection(" " + hashtag + " " + cm.getSelection() + " # ", "around");
    }
    // cm.refresh();
}



export function CursorWidget(cm, optRange, onParse, line, ch, color) {
    this.node = $(".widget-templates .cursor-widget").clone();
    this.domNode = this.node[0];
    this.domNode.style.backgroundColor = color
    this.domNode.style.border = '1px solid ' + color

    if(cm != undefined){
        var from = {
            line: line,
            ch: ch
        }

        var options = {
            widget: this.domNode
        }

        var mark = cm.setBookmark(from, options);
        // cm.refresh();
        return mark;
    }
}

// <div id="image-widget" style="background-color: #EEE">
// 	<center>
// 		<img id="image-frame" src="test.jpg" height="250px" width="250px">
// 		<br>
// 		<span id="image-text">This is some text</span>
// 	</center>
// </div>

// t.change($.proxy(this, 'updateText')); ???????? on the stuff...


// TODO: BUG: FIX: When marking the entire line and placing imagewidget, it will eat up the coming lines for each time you change the value of the image (click & blur)
// TODO:: need to replace the range after changing the content of the #img ... #, click -> input -> change range -> blur
export function ImageWidget(cm, optRange, onParse) {
    this.injectImage(cm, optRange);
    this.parsing = false;
}
ImageWidget.prototype = Object.create(Widget.prototype)
ImageWidget.prototype.injectImage = function(cm, optRange) {
    console.log("inside imageidget inject:: + optRange");
    console.log(optRange);
    this.node = $(".widget-templates .image-widget").clone();
    this.domNode = this.node[0];
    Widget.apply(this, arguments);
    // parse the obj
    var list = this.value.split(" ");
    console.log("image list:: ");
    console.log(list);
    var imgobj = {};
    imgobj["text"] = "";
    // 1 to -1 since #img and # is not to be added
    for (var i = 1; i < list.length-1; i++) {
        if (list[i].startsWith("@")) {
            var name = list[i].slice(1,list[i].length);
            i++;
            imgobj[name] = list[i].slice(1,list[i].length-1);
        }
        else {
            if(list[i].trim() != "") {
                imgobj["text"] += list[i].trim() + " ";
            }
        }
    }
    var from;
    var to;
    if(optRange) {
        from = optRange.from;
        // console.log("from: ");
        // console.log(from);
        to = optRange.to;
        // console.log("to: ");
        // console.log(to);
    } else {
        from = cm.getCursor("from");
        // console.log("from");
        // console.log(from);
        to = cm.getCursor("to");
        // console.log("to");
        // console.log(to);
    }
    this.mark = cm.markText(from, to, {readOnly: false, replacedWith: this.domNode, clearWhenEmpty: false});

    //"<img id='$ref' src='$src' height='$height' width='$width' alt='$value'>",
    // #img @id "testpng" test @src "docs/test.png" @height "20px" @width "40px" testhei #
    var image = this.node.find('.image-frame');
    // what if null ?
    image[0].src = imgobj["src"];
    image[0].style.height = imgobj["height"];
    image[0].style.width = imgobj["width"];

    var text = this.node.find('.image-text');
    text[0].textContent = imgobj["text"];


    this.textrangeFrom = from;
    this.textrangeTo = to;
    // this.textrangeTo.ch -= 1;

    this.node[0].addEventListener("click", () => {
        console.log("click");
        var newSpan = $(".widget-templates .image-edit").clone();
        newSpan[0].textContent = this.value;
        this.node[0].parentNode.removeChild(this.node[0]);
        // should be called something else then onParse??
        cm.replaceRange("" + this.value + "", this.textrangeFrom, this.textrangeTo, "+onParse");
        // cm.replaceRange("" + this.value + "", {line: this.textrangeFrom.line, ch: this.textrangeFrom.ch+1}, {line: this.textrangeTo.line, ch: this.textrangeTo.ch-1});
        // true clear when empty ??
        this.mark = cm.markText(this.textrangeFrom, this.textrangeTo, {replacedWith: newSpan[0], clearWhenEmpty: false});
        newSpan[0].focus();
        // listener for the new span
        newSpan[0].addEventListener("blur", () => {
            console.log("blur");
            this.value = newSpan[0].textContent;
            console.log("value:::::");
            console.log(this.value);
            // remove this span
            newSpan[0].parentNode.removeChild(newSpan[0]);
            // this needs to triger a change and send to others on websoket.. origin??
            // ???? TODO:: fix

            // this.textrangeFrom =
            if(this.parsing) {
                cm.replaceRange("" + this.value + "", this.textrangeFrom, this.textrangeTo, "+onParse");
            } else {
                cm.replaceRange("" + this.value + "", this.textrangeFrom, this.textrangeTo, "+input");
            }
            // cm.replaceRange("" + this.value + "", {line: this.textrangeFrom.line, ch: this.textrangeFrom.ch+1}, {line: this.textrangeTo.line, ch: this.textrangeTo.ch-1});

            // set new text ranges ??
            // this.textrangeFrom =

            this.injectImage(cm, {from: this.textrangeFrom, to: this.textrangeTo});
            // cm.replaceRange()
        }, false);
        // what does false do here??
    }, false);

    cm.setCursor(to);
    // cm.refresh();
}
