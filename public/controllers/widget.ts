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

export function Widget(cm, optRange) {
    this.cm = cm;
    if (optRange != null) {
        this.value = this.cm.getRange(optRange.from, optRange.to).trim();
    } else {
        this.value = cm.getSelection();
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

export function BoldWidget(cm, optRange) {
    this.node = $(".widget-templates .bold-widget").clone();

    // adding listener to change event
    this.node[0].addEventListener("input", (e) => {
        this.setValue(this.node[0].innerText);
    }, false);

    this.domNode = this.node[0];
    Widget.apply(this, arguments);
    this.node[0].textContent = this.value;

    if (optRange != null) {
        // need to replace 4 chars before to remove "#b" and 3 after to remove "#"
        // optRange.from.ch -= 4;
        // optRange.to.ch += 4;
        // cm.replaceRange(cm.getRange(optRange.from, optRange.to), {line: optRange.from.line, ch: optRange.from.ch - 4}, {line: optRange.to.line, ch : optRange.to.ch + 3});
        this.mark = cm.markText({line: optRange.from.line, ch: optRange.from.ch - 3}, {line: optRange.to.line, ch : optRange.to.ch + 2}, {replacedWith: this.domNode, clearWhenEmpty: false});
    } else {
        cm.replaceSelection(" #b " + cm.getSelection() + " # ", "around");
        var from = cm.getCursor("from");
        var to = cm.getCursor("to");
        this.mark = cm.markText(from, to, {replacedWith: this.domNode, clearWhenEmpty: false});
        cm.setCursor(to);
    }
    cm.refresh();
}
BoldWidget.prototype = Object.create(Widget.prototype)
BoldWidget.prototype.setValue = function(val) {
    this.value = val;
    var pos = getCaretPosition(this.node[0]);
    this.setText("#b " + this.value.toString() + " #");
    moveCaret(window, pos);
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
