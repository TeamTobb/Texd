export function Widget(cm) {
    // the subclass must define this.domNode before calling this constructor
    var _this = this;
    this.cm = cm;
    cm.replaceSelection(" #b " + cm.getSelection() + " # ", "around");
    var from = cm.getCursor("from");
    var to = cm.getCursor("to");
    this.mark = cm.markText(from, to, {replacedWith: this.domNode, clearWhenEmpty: false});

    if (this.enter) {
        CodeMirror.on(this.mark, "beforeCursorEnter", function(e) {
            // register the enter function
            // the actual movement happens if the cursor movement was a plain navigation
            // but not if it was a backspace or selection extension, etc.
            var direction = posEq(_this.cm.getCursor(), _this.mark.find().from) ? 'left' : 'right';
            cm.widgetEnter = $.proxy(_this, 'enterIfDefined', direction);
        });
    }
    cm.setCursor(to);
    cm.refresh()
}

Widget.prototype.enterIfDefined = function(direction) {
    if (this.mark.find()) {
        this.enter(direction);
    } else {
        this.cm.refresh();
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

export function BoldWidget(cm) {
    this.node = $(".widget-templates .bold-widget").clone();
    this.domNode = this.node[0];
    Widget.apply(this, arguments);
    this.value = this.getText();
    this.setValue(this.value);
}
BoldWidget.prototype = Object.create(Widget.prototype)
BoldWidget.prototype.enter = function(direction) {
    // var t = this.node.find('.value');
    var t = this.node;
    t.focus();
    if (direction==='left') {
        t.setCursorPosition(0);
    } else {
        t.setCursorPosition(t.val().length)
    }
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

BoldWidget.prototype.setValue = function(val) {
    this.value = val;
    this.setText(this.value.toString());
    this.node[0].textContent = this.value;
}
