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

// From http://stackoverflow.com/a/2897510/1200039
// function getCursorPosition() {
//     var input = this.get(0);
//     if (!input) return; // No (input) element found
//     if ('selectionStart' in input) {
//         // Standard-compliant browsers
//         return input.selectionStart;
//     } else if (document.selection) {
//         // IE
//         input.focus();
//         var sel = document.selection.createRange();
//         var selLen = document.selection.createRange().text.length;
//         sel.moveStart('character', -input.value.length);
//         return sel.text.length - selLen;
//     }
// }

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

// function setCursorPosition(pos) {
//     if ($(this).get(0).setSelectionRange) {
//         $(this).get(0).setSelectionRange(pos, pos);
//     } else if ($(this).get(0).createTextRange) {
//         var range = $(this).get(0).createTextRange();
//         range.collapse(true);
//         range.moveEnd('character', pos);
//         range.moveStart('character', pos);
//         range.select();
//     }
// }

function posEq(a, b) {return a.line == b.line && a.ch == b.ch;}

export function Widget(cm, optRange) {
    this.cm = cm;
    if (optRange != null) {
        this.value = this.cm.getRange(optRange.from, optRange.to).trim();
    } else {
        this.value = cm.getSelection();
    }

    // need to do something else on parsing.... (?)
    var from = cm.getCursor("from");
    var to = cm.getCursor("to");
    // this.mark = cm.markText(from, to, {replacedWith: this.domNode, clearWhenEmpty: false});
    this.mark = cm.markText(from, to);

    if (this.enter) {
        console.log("yayayay");
        CodeMirror.on(this.mark, "beforeCursorEnter", (e) => {
            console.log("wtf");
            // register the enter function
            // the actual movement happens if the cursor movement was a plain navigation
            // but not if it was a backspace or selection extension, etc.
            var direction = posEq(this.cm.getCursor(), this.mark.find().from) ? 'left' : 'right';
            cm.widgetEnter = $.proxy(this, 'enterIfDefined', direction);
        });
    }
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
Widget.prototype.enterIfDefined = function(direction) {
    // check to make sure the mark still exists
    if (this.mark.find()) {
        this.enter(direction);
    } else {
        this.cm.refresh();
    }
}

export function BoldWidget(cm, optRange) {
    this.node = $(".widget-templates .bold-widget").clone();
    this.nodeEnd = $(".widget-templates .bold-widget").clone();

    // adding listener to change event
    // this.node[0].addEventListener("input", (e) => {
    //     this.setValue(this.node[0].innerText);
    // }, false);

    this.domNode = this.node[0];
    this.domNodeEnd = this.nodeEnd[0];
    Widget.apply(this, arguments);
    // this.node[0].textContent = this.value;
    this.node[0].textContent = "";
    this.nodeEnd[0].textContent = "";

    if (optRange != null) {
        // need to replace 4 chars before to remove "#b" and 3 after to remove "#"
        // optRange.from.ch -= 4;
        // optRange.to.ch += 4;
        // cm.replaceRange(cm.getRange(optRange.from, optRange.to), {line: optRange.from.line, ch: optRange.from.ch - 4}, {line: optRange.to.line, ch : optRange.to.ch + 3});
        // cm.replaceRange("", {line: optRange.from.line, ch: optRange.from.ch - 4}, {line: optRange.to.line, ch : optRange.to.ch + 3});
        // cm.replaceRange(cm.getRange(optRange.from, optRange.to), {line: optRange.from.line, ch: optRange.from.ch - 4}, {line: optRange.to.line, ch : optRange.to.ch + 3});

        this.mark = cm.markText({line: optRange.from.line, ch: optRange.from.ch - 3}, {line: optRange.to.line, ch : optRange.to.ch + 2}, {replacedWith: this.domNode, clearWhenEmpty: false});
    } else {
        cm.replaceSelection(" #b " + cm.getSelection() + " # ", "around");
        var from = cm.getCursor("from");
        var to = cm.getCursor("to");
        // this.mark = cm.markText(from, to, {replacedWith: this.domNode, clearWhenEmpty: false});
        this.mark = cm.markText(from, to, {className: 'bold-widget'});
        // this.mark = cm.removeLineClass(1, "wrap", "bold-widget");



        cm.markText(from, {line: from.line, ch: from.ch+4}, {replacedWith: this.domNode, clearWhenEmpty: false});
        cm.markText({line: to.line, ch: to.ch-3}, to, {replacedWith: this.domNodeEnd, clearWhenEmpty: false});


        cm.setCursor(to);
    }
    cm.refresh();

    this.node.keydown('left', (event) => {
        if (getCaretPosition(this.node[0])===0) {
            console.log("left");
            this.exit('left');
        }
    });
    this.node.keydown('right', (event) => {
        var t = $(event.target);
        if (getCaretPosition(this.node[0])==this.value.length) {
            console.log("right");
            this.exit('right');
        }
    });
}
BoldWidget.prototype = Object.create(Widget.prototype)
BoldWidget.prototype.setValue = function(val) {
    this.value = val;
    var pos = getCaretPosition(this.node[0]);
    console.log(pos);
    this.setText("#b " + this.value.toString() + " #");
    moveCaret(window, pos);
}
BoldWidget.prototype.exit = function(direction) {
    var range = this.mark.find();
    this.cm.focus();
    if (direction==='left') {
        this.cm.setCursor(range.from)
    } else {
        this.cm.setCursor(range.to)
    }
}
BoldWidget.prototype.enter = function(direction) {
    // wrong?
    var t = this.node[0];
    t.focus();
    if (direction==='left') {
        // setCursorPosition(0);
        moveCaret(window, 0);
    } else {
        moveCaret(window, this.value.length);
        // setCursorPosition(t.val().length)
    }
}

export function HeaderWidget(cm, optRange) {
    this.node = $(".widget-templates .header-widget").clone();

    // adding listener to change event
    this.node[0].addEventListener("input", () => {
        this.setValue(this.node[0].innerText);
    }, false);

    this.domNode = this.node[0];
    Widget.apply(this, arguments);
    this.node[0].textContent = this.value;

    cm.replaceSelection(" #h1 " + cm.getSelection() + " # ", "around");
    var from = cm.getCursor("from");
    var to = cm.getCursor("to");
    this.mark = cm.markText(from, to, {replacedWith: this.domNode, clearWhenEmpty: false});

    cm.setCursor(to);
    cm.refresh();
}
HeaderWidget.prototype = Object.create(Widget.prototype)
HeaderWidget.prototype.setValue = function(val) {
    this.value = val;
    var pos = getCaretPosition(this.node[0]);
    this.setText(" #h1 " + this.value.toString() + " # ");
    moveCaret(window, pos);
}

export function ItalicWidget(cm, optRange) {
    this.node = $(".widget-templates .italic-widget").clone();

    // adding listener to change event
    this.node[0].addEventListener("input", () => {
        this.setValue(this.node[0].innerText);
    }, false);

    this.domNode = this.node[0];
    Widget.apply(this, arguments);
    this.node[0].textContent = this.value;

    cm.replaceSelection(" #i " + cm.getSelection() + " # ", "around");
    var from = cm.getCursor("from");
    var to = cm.getCursor("to");
    this.mark = cm.markText(from, to, {replacedWith: this.domNode, clearWhenEmpty: false});

    cm.setCursor(to);
    cm.refresh();
}
ItalicWidget.prototype = Object.create(Widget.prototype)
ItalicWidget.prototype.setValue = function(val) {
    this.value = val;
    var pos = getCaretPosition(this.node[0]);
    this.setText(" #i " + this.value.toString() + " # ");
    moveCaret(window, pos);
}

export function UnderlineWidget(cm, optRange) {
    this.node = $(".widget-templates .underline-widget").clone();

    // adding listener to change event
    this.node[0].addEventListener("input", () => {
        this.setValue(this.node[0].innerText);
    }, false);

    this.domNode = this.node[0];
    Widget.apply(this, arguments);
    this.node[0].textContent = this.value;

    cm.replaceSelection(" #u " + cm.getSelection() + " # ", "around");
    var from = cm.getCursor("from");
    var to = cm.getCursor("to");
    this.mark = cm.markText(from, to, {replacedWith: this.domNode, clearWhenEmpty: false});

    cm.setCursor(to);
    cm.refresh();
}
UnderlineWidget.prototype = Object.create(Widget.prototype)
UnderlineWidget.prototype.setValue = function(val) {
    this.value = val;
    var pos = getCaretPosition(this.node[0]);
    this.setText(" #u " + this.value.toString() + " # ");
    moveCaret(window, pos);
}

// <div id="image-widget" style="background-color: #EEE">
// 	<center>
// 		<img id="image-frame" src="test.jpg" height="250px" width="250px">
// 		<br>
// 		<span id="image-text">This is some text</span>
// 	</center>
// </div>

// t.change($.proxy(this, 'updateText')); ???????? on the stuff...

export function ImageWidget(cm, optRange) {
    this.injectImage(cm, null);
}
ImageWidget.prototype = Object.create(Widget.prototype)
ImageWidget.prototype.injectImage = function(cm, optRange) {
    this.node = $(".widget-templates .image-widget").clone();
    this.domNode = this.node[0];
    Widget.apply(this, arguments);
    // parse the obj
    var list = this.value.split(" ");
    var imgobj = {};
    imgobj["text"] = "";
    // 1 to -1 since #img and # is not to be added
    for (var i = 1; i < list.length-1; i++) {
        if (list[i].startsWith("@")) {
            console.log(list[i]);
            var name = list[i].slice(1,list[i].length);
            i++;
            imgobj[name] = list[i].slice(1,list[i].length-1);
        }
        else {
            imgobj["text"] += list[i] + " ";
        }
    }
    console.log(JSON.stringify(imgobj));
    var from;
    var to;
    if(optRange) {
        console.log("optRange is set in new Inject Image");
        from = optRange.from;
        console.log("from: ");
        console.log(from);
        to = optRange.to;
        console.log("to: ");
        console.log(to);
    } else {
        from = cm.getCursor("from");
        console.log("from");
        console.log(from);
        to = cm.getCursor("to");
        console.log("to");
        console.log(to);
    }
    this.mark = cm.markText(from, to, {readOnly: false, replacedWith: this.domNode, clearWhenEmpty: false});

    //"<img id='$ref' src='$src' height='$height' width='$width' alt='$value'>",
    // #img @id "testpng" test @src "docs/test.png" @height "20px" @width "40px" testhei #
    var image = this.node.find('.image-frame');
    // what if null ?
    image[0].attributes[1].nodeValue = imgobj["height"];
    image[0].attributes[2].nodeValue = imgobj["src"];
    image[0].attributes[3].nodeValue = imgobj["width"];
    var text = this.node.find('.image-text');
    text[0].textContent = imgobj["text"];

    this.textrangeFrom = from;
    this.textrangeTo = to;
    this.textrangeTo.ch -= 1;

    this.node[0].addEventListener("click", () => {
        console.log("click");
        var newSpan = $(".widget-templates .image-edit").clone();
        newSpan[0].textContent = this.value;
        this.node[0].parentNode.removeChild(this.node[0]);
        cm.replaceRange("" + this.value + "", this.textrangeFrom, this.textrangeTo);
        // true clear when empty ??
        this.mark = cm.markText(this.textrangeFrom, this.textrangeTo, {replacedWith: newSpan[0], clearWhenEmpty: false});
        newSpan[0].focus();
        // listener for the new span
        newSpan[0].addEventListener("blur", () => {
            console.log("blur");
            this.value = newSpan[0].textContent;
            // remove this span
            newSpan[0].parentNode.removeChild(newSpan[0]);
            // this needs to triger a change and send to others on websoket.. origin??
            // ???? TODO:: fix
            cm.replaceRange("" + this.value + "", this.textrangeFrom, this.textrangeTo);
            this.injectImage(cm, {from: this.textrangeFrom, to: this.textrangeTo});
            // cm.replaceRange()
        }, false);
        // what does false do here??
    }, false);

    cm.setCursor(to);
    cm.refresh();
}
