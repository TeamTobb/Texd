// posEq convenience function from CodeMirror source
function posEq(a, b) {return a.line == b.line && a.ch == b.ch;}

export function Widget(cm) {
    // the subclass must define this.domNode before calling this constructor
    var _this = this;
    this.cm = cm;
    this.value = cm.getSelection();
    cm.replaceSelection(" #b " + cm.getSelection() + " # ", "around");
    var from = cm.getCursor("from");
    var to = cm.getCursor("to");
    this.mark = cm.markText(from, to, {replacedWith: this.domNode, clearWhenEmpty: false});

    // if (this.enter) {
    //     CodeMirror.on(this.mark, "beforeCursorEnter", function(e) {
    //         // register the enter function
    //         // the actual movement happens if the cursor movement was a plain navigation
    //         // but not if it was a backspace or selection extension, etc.
    //         var direction = posEq(_this.cm.getCursor(), _this.mark.find().from) ? 'left' : 'right';
    //         cm.widgetEnter = $.proxy(_this, 'enterIfDefined', direction);
    //     });
    // }
    cm.setCursor(to);
    cm.refresh()
}

// Widget.prototype.enterIfDefined = function(direction) {
//     if (this.mark.find()) {
//         this.enter(direction);
//     } else {
//         this.cm.refresh();
//     }
// }

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

export function BoldWidget(cm) {
    this.node = $(".widget-templates .bold-widget").clone();

    // adding listener to change event
    this.node[0].addEventListener("input", () => {
        this.setValue(this.node[0].innerText);
    }, false);

    this.domNode = this.node[0];
    Widget.apply(this, arguments);
    this.node[0].textContent = this.value;
}
BoldWidget.prototype = Object.create(Widget.prototype)
// BoldWidget.prototype.enter = function(direction) {
//     // var t = this.node.find('.value');
//     var t = this.node;
//     t.focus();
//     if (direction==='left') {
//         t.setCursorPosition(0);
//     } else {
//         t.setCursorPosition(t.val().length)
//     }
// }
//
// BoldWidget.prototype.exit = function(direction) {
//     var range = this.mark.find();
//     this.cm.focus();
//     if (direction==='left') {
//         this.cm.setCursor(range.from)
//     } else {
//         this.cm.setCursor(range.to)
//     }
// }

BoldWidget.prototype.setValue = function(val) {
    this.value = val;
    // var t = this.node;
    // var pos = t.getCursorPosition();
    // console.log(pos);
    this.setText(" #b " + this.value.toString() + " # ");
}

// must use input to use these functions...
// From http://stackoverflow.com/a/2897510/1200039
$.fn.getCursorPosition = function() {
    console.log("getting pos");
    var input = this.get(0);
    if (!input) return; // No (input) element found
    if ('selectionStart' in input) {
        // Standard-compliant browsers
        return input.selectionStart;
    } else if (document.selection) {
        // IE
        input.focus();
        var sel = document.selection.createRange();
        var selLen = document.selection.createRange().text.length;
        sel.moveStart('character', -input.value.length);
        return sel.text.length - selLen;
    }
}

// from http://stackoverflow.com/q/499126/1200039
$.fn.setCursorPosition = function(pos) {
    if ($(this).get(0).setSelectionRange) {
        $(this).get(0).setSelectionRange(pos, pos);
    } else if ($(this).get(0).createTextRange) {
        var range = $(this).get(0).createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
}
