export function Widget(cm) {
    this.cm = cm;
    this.value = cm.getSelection();
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

    // adding listener to change event
    this.node[0].addEventListener("input", () => {
        this.setValue(this.node[0].innerText);
    }, false);

    this.domNode = this.node[0];
    Widget.apply(this, arguments);
    this.node[0].textContent = this.value;

    cm.replaceSelection(" #b " + cm.getSelection() + " # ", "around");
    var from = cm.getCursor("from");
    var to = cm.getCursor("to");
    this.mark = cm.markText(from, to, {replacedWith: this.domNode, clearWhenEmpty: false});

    cm.setCursor(to);
    cm.refresh()
}
BoldWidget.prototype = Object.create(Widget.prototype)
BoldWidget.prototype.setValue = function(val) {
    this.value = val;
    this.setText(" #b " + this.value.toString() + " # ");
}

export function HeaderWidget(cm) {
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
    cm.refresh()
}
HeaderWidget.prototype = Object.create(Widget.prototype)
HeaderWidget.prototype.setValue = function(val) {
    this.value = val;
    this.setText(" #h1 " + this.value.toString() + " # ");
}
