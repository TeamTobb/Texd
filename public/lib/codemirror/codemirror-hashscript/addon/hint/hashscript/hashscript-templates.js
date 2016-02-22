(function() {
    var templates = {
        "name": "javascript",
        "context": "javascript",
        "templates": [{
            "name": "img",
            "description": "insert image",
            "template": "#img \n\t@src ${docs/test.png} @width ${width} @height ${height} \n # \n ${cursor}"
        }
        ]
    };
    CodeMirror.templatesHint.addTemplates(templates);
})();