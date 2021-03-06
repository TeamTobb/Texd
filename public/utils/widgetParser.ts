export class WidgetParser {
    public static searchForWidgets(widgetMap, lines : string[], insertWidget) {
        var widgetsToInsert = [];
        var buffer : string = "";
        var widgetInc = false;
        var fromCh = 0;
        var fromLine = 0;
        var toCh = 0;
        var toLine = 0;
        var newBuffer : string = "";
        for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            for (var index = 0; index < lines[lineIndex].length; index++) {
                if (widgetInc) {
                    if(lines[lineIndex][index] == " ") {
                        if(newBuffer == "#") {
                            toCh = index+1; // -1 ?
                            toLine = lineIndex;
                            // insert widget and reset
                            var newWidgetToInsert = {};
                            newWidgetToInsert["buffer"] = buffer;
                            newWidgetToInsert["range"] = {from: {ch: fromCh, line: fromLine}, to: {ch: toCh, line: toLine}};
                            widgetsToInsert.push(newWidgetToInsert)
                            widgetInc = false;
                            newBuffer = "";
                            buffer = "";
                        } else {
                            newBuffer = "";
                        }
                    } else {
                        // + ?
                        newBuffer = lines[lineIndex][index];
                    }
                } else {
                    if(lines[lineIndex][index] == " ") {
                        if(widgetMap[buffer.trim()]) {
                            widgetInc = true;
                            fromCh = index-buffer.length; // remove - buffer.length ?
                            fromLine = lineIndex;
                        } else {
                            widgetInc = false;
                            buffer = "";
                        }
                    } else {
                        buffer += lines[lineIndex][index];
                    }
                }
            }
            // newline
            if (widgetInc) {
                if(newBuffer == "#") {
                    toCh = index+1; // -1 ?
                    // not +1 on new line ?
                    toLine = lineIndex;
                    // insert widget and reset
                    var newWidgetToInsert = {};
                    newWidgetToInsert["buffer"] = buffer;
                    newWidgetToInsert["range"] = {from: {ch: fromCh, line: fromLine}, to: {ch: toCh, line: toLine}};
                    widgetsToInsert.push(newWidgetToInsert)
                    widgetInc = false;
                    newBuffer = "";
                    buffer = "";
                } else {
                    newBuffer = "";
                }
            } else {
                buffer = "";
            }
        }
        // insert widgets
        for (var i = widgetsToInsert.length - 1; i >= 0; i--) {
            insertWidget(widgetsToInsert[i]["buffer"], widgetsToInsert[i]["range"]);
        }
    }
}
