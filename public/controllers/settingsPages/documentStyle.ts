import {Component, OnInit} from 'angular2/core';
import {Router, RouteParams} from 'angular2/router';
import {Input, Output} from 'angular2/core';
import {EventEmitter} from "angular2/src/facade/async";

import {FORM_PROVIDERS, FormBuilder, Validators} from 'angular2/common';
import {bootstrap} from 'angular2/platform/browser';

import {DocumentService} from '../../data_access/document.ts';



@Component({
    selector: 'documentStyle',
    providers: [],
    templateUrl: 'views/settingspages/documentStyle.html'
})

export class DocumentStyle {
    styleForm: any;

    documentId: string;
    title: string = "loading";
    styleInput = {};
    styleItems = [];
    gotDocumentId = false;
    noDocumentId = true;
    public docs = [];

    constructor(private _router: Router, private _routeParams: RouteParams, builder: FormBuilder, private documentService: DocumentService) {
        this.documentId = _routeParams.params["id"];

        this.createStyleInput()
        if (Number(this.documentId) == 0) {
            this.noDocumentId = true;
            this.gotDocumentId = false;


            documentService.getDocuments((documents) => {
                this.docs = documents;
            })
        } else {
            this.gotDocumentId = true;
            this.noDocumentId = false;


            documentService.getDocument(this.documentId, (document) => {
                this.title = document.title;
                var newStyleInput = {};
                for (var key in document.style) {
                    var value = document.style[key];
                    if (value != "") {
                        newStyleInput[key] = value;
                    }
                }
                this.styleInput = newStyleInput;
            })
        }

    }

    createStyleInput() {
        this.styleItems.push("alignContent");
        this.styleItems.push("alignItems");
        this.styleItems.push("alignSelf");
        this.styleItems.push("animation");
        this.styleItems.push("animationDelay");
        this.styleItems.push("animationDirection");
        this.styleItems.push("animationDuration");
        this.styleItems.push("animationFillMode");
        this.styleItems.push("animationIterationCount");
        this.styleItems.push("animationName");
        this.styleItems.push("animationTimingFunction");
        this.styleItems.push("animationPlayState");
        this.styleItems.push("background");
        this.styleItems.push("backgroundAttachment");
        this.styleItems.push("backgroundColor");
        this.styleItems.push("backgroundImage");
        this.styleItems.push("backgroundPosition");
        this.styleItems.push("backgroundRepeat");
        this.styleItems.push("backgroundClip");
        this.styleItems.push("backgroundOrigin");
        this.styleItems.push("backgroundSize");
        this.styleItems.push("backfaceVisibility");
        this.styleItems.push("border");
        this.styleItems.push("borderBottom");
        this.styleItems.push("borderBottomColor");
        this.styleItems.push("borderBottomLeftRadius");
        this.styleItems.push("borderBottomRightRadius");
        this.styleItems.push("borderBottomStyle");
        this.styleItems.push("borderBottomWidth");
        this.styleItems.push("borderCollapse");
        this.styleItems.push("borderColor");
        this.styleItems.push("borderImage");
        this.styleItems.push("borderImageOutset");
        this.styleItems.push("borderImageRepeat");
        this.styleItems.push("borderImageSlice");
        this.styleItems.push("borderImageSource");
        this.styleItems.push("borderImageWidth");
        this.styleItems.push("borderLeft");
        this.styleItems.push("borderLeftColor");
        this.styleItems.push("borderLeftStyle");
        this.styleItems.push("borderLeftWidth");
        this.styleItems.push("borderRadius");
        this.styleItems.push("borderRight");
        this.styleItems.push("borderRightColor");
        this.styleItems.push("borderRightStyle");
        this.styleItems.push("borderRightWidth");
        this.styleItems.push("borderSpacing");
        this.styleItems.push("borderStyle");
        this.styleItems.push("borderTop");
        this.styleItems.push("borderTopColor");
        this.styleItems.push("borderTopLeftRadius");
        this.styleItems.push("borderTopRightRadius");
        this.styleItems.push("borderTopStyle");
        this.styleItems.push("borderTopWidth");
        this.styleItems.push("borderWidth");
        this.styleItems.push("bottom");
        this.styleItems.push("boxDecorationBreak");
        this.styleItems.push("boxShadow");
        this.styleItems.push("boxSizing");
        this.styleItems.push("captionSide");
        this.styleItems.push("clear");
        this.styleItems.push("clip");
        this.styleItems.push("color");
        this.styleItems.push("columnCount");
        this.styleItems.push("columnFill");
        this.styleItems.push("columnGap");
        this.styleItems.push("columnRule");
        this.styleItems.push("columnRuleColor");
        this.styleItems.push("columnRuleStyle");
        this.styleItems.push("columnRuleWidth");
        this.styleItems.push("columns");
        this.styleItems.push("columnSpan");
        this.styleItems.push("columnWidth");
        this.styleItems.push("content");
        this.styleItems.push("counterIncrement");
        this.styleItems.push("counterReset");
        this.styleItems.push("cursor");
        this.styleItems.push("direction");
        this.styleItems.push("display");
        this.styleItems.push("emptyCells");
        this.styleItems.push("filter");
        this.styleItems.push("flex");
        this.styleItems.push("flexBasis");
        this.styleItems.push("flexDirection");
        this.styleItems.push("flexFlow");
        this.styleItems.push("flexGrow");
        this.styleItems.push("flexShrink");
        this.styleItems.push("flexWrap");
        this.styleItems.push("cssFloat");
        this.styleItems.push("font");
        this.styleItems.push("fontFamily");
        this.styleItems.push("fontSize");
        this.styleItems.push("fontStyle");
        this.styleItems.push("fontVariant");
        this.styleItems.push("fontWeight");
        this.styleItems.push("fontSizeAdjust");
        this.styleItems.push("fontStretch");
        this.styleItems.push("hangingPunctuation");
        this.styleItems.push("height");
        this.styleItems.push("hyphens");
        this.styleItems.push("icon");
        this.styleItems.push("imageOrientation");
        this.styleItems.push("justifyContent");
        this.styleItems.push("left");
        this.styleItems.push("letterSpacing");
        this.styleItems.push("lineHeight");
        this.styleItems.push("listStyle");
        this.styleItems.push("listStyleImage");
        this.styleItems.push("listStylePosition");
        this.styleItems.push("listStyleType");
        this.styleItems.push("margin");
        this.styleItems.push("marginBottom");
        this.styleItems.push("marginLeft");
        this.styleItems.push("marginRight");
        this.styleItems.push("marginTop");
        this.styleItems.push("maxHeight");
        this.styleItems.push("maxWidth");
        this.styleItems.push("minHeight");
        this.styleItems.push("minWidth");
        this.styleItems.push("navDown");
        this.styleItems.push("navIndex");
        this.styleItems.push("navLeft");
        this.styleItems.push("navRight");
        this.styleItems.push("navUp");
        this.styleItems.push("opacity");
        this.styleItems.push("order");
        this.styleItems.push("orphans");
        this.styleItems.push("outline");
        this.styleItems.push("outlineColor");
        this.styleItems.push("outlineOffset");
        this.styleItems.push("outlineStyle");
        this.styleItems.push("outlineWidth");
        this.styleItems.push("overflow");
        this.styleItems.push("overflowX");
        this.styleItems.push("overflowY");
        this.styleItems.push("padding");
        this.styleItems.push("paddingBottom");
        this.styleItems.push("paddingLeft");
        this.styleItems.push("paddingRight");
        this.styleItems.push("paddingTop");
        this.styleItems.push("pageBreakAfter");
        this.styleItems.push("pageBreakBefore");
        this.styleItems.push("pageBreakInside");
        this.styleItems.push("perspective");
        this.styleItems.push("perspectiveOrigin");
        this.styleItems.push("position");
        this.styleItems.push("quotes");
        this.styleItems.push("resize");
        this.styleItems.push("right");
        this.styleItems.push("tableLayout");
        this.styleItems.push("tabSize");
        this.styleItems.push("textAlign");
        this.styleItems.push("textAlignLast");
        this.styleItems.push("textDecoration");
        this.styleItems.push("textDecorationColor");
        this.styleItems.push("textDecorationLine");
        this.styleItems.push("textDecorationStyle");
        this.styleItems.push("textIndent");
        this.styleItems.push("textJustify");
        this.styleItems.push("textOverflow");
        this.styleItems.push("textShadow");
        this.styleItems.push("textTransform");
        this.styleItems.push("top");
        this.styleItems.push("transform");
        this.styleItems.push("transformOrigin");
        this.styleItems.push("transformStyle");
        this.styleItems.push("transition");
        this.styleItems.push("transitionProperty");
        this.styleItems.push("transitionDuration");
        this.styleItems.push("transitionTimingFunction");
        this.styleItems.push("transitionDelay");
        this.styleItems.push("unicodeBidi");
        this.styleItems.push("verticalAlign");
        this.styleItems.push("visibility");
        this.styleItems.push("whiteSpace");
        this.styleItems.push("width");
        this.styleItems.push("wordBreak");
        this.styleItems.push("wordSpacing");
        this.styleItems.push("wordWrap");
        this.styleItems.push("widows");
        this.styleItems.push("zIndex");

        this.styleItems.forEach(element => {
            this.styleInput[element] = "";
        });
    }

    sendStyleToServer() {
        console.log("Sender style til Sever")

        var newStyleInput = {};
        for (var key in this.styleInput) {
            var value = this.styleInput[key];
            if (value != "") {
                newStyleInput[key] = value;
            }
        }

        this.documentService.changeStyle(this.documentId, newStyleInput);
    }

    setDocumentId(docId, docNumber) {
        this.documentId = docId;
        this.gotDocumentId = true;
        this.noDocumentId = false;

        this.title = document.title;
        var newStyleInput = {};
        for (var key in this.docs[docNumber].style) {
            var value = this.docs[docNumber].style[key];
            if (value != "") {
                newStyleInput[key] = value;
            }
        }
        this.styleInput = newStyleInput;

    }

}
