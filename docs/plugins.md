Plugin documentation
=================

## About
Plugins is the name we use for extensions to our custom language we call “Hashscript”.
Each plugin is a JSON file that contains five attributes:
* tagname - how you start a plugin (usage: “#” + tagname)
* html - how the plugin will be translated, this can be HTML, JS and CSS.
* attr - attributes that are neccessary for the plugin to work (usage: @att “value”)
* optattr - “optional attributes”, these are attributes that may be included in the plugin, but does not have to be present for the plugin to work as intended.
* description - this field contains a description of the plugin and can e.g. contain an example of how to use the plugin.

All five attributes have to be present in the JSON file for the plugin to be “valid”, but attr and optattr may be empty lists.

## Examples

Example - plugin that makes text bold:
```json
{
    "tagname": "b",
    "html": "<b>$value</b>",
    "attr": [],
    "optattr": [],
    "description": "Bold text"
}
```

Example usage:
```text
#b This is some bold text #
```

All attributes are labeled with “$” + the name of the attribute, meaning that if you want to use an attr or an optattr in the html, then you do so by adding “$” before the name of the attribute. A global attribute that all plugins may use is $value. Value is everything that is between “#” start and end for a plugin that are not attributes. In this simple example, value will be: “This is some bold text” and will be placed between <b> and </b> in the finished document.

Example on attribute usage in the editor:
@test “this is a test attribute”

A bigger example that contains some attributes and more advanced HTML is “img”:
```json
{
    "tagname": "img",
    "html": "<div style='background-color: #EEE'><img id='$ref' src='$src' height='$height' width='$width' alt='$value'><br><span>$value</span></div>",
    "attr": [
        "src"
    ],
    "optattr": [
        "height",
        "width",
        "ref"
    ],
    "description": "Image"
}
```

(this is somewhat simplified from how the real one is implemented. The real one has more CSS code inside the “html” field)

You can see that the attributes src, height, width and ref are defined and how they are used in the html definition.

Example usage:
```text
#img @height “200px” @width “250px” @src “uploads/testImages/test.png” This is a test image #
```

Here you can see that the attributes “height”, “width” and “src” are present, and that “ref” is not. Value is also used and does now contain “This is a test image” since this text is found between “#img” and “#” and is not specified as a attribute.

This is how it will look in the finished document:

![Preview from image plugin](https://github.com/TeamTobb/Texd/blob/master/docs/imagepluginpreview.png "Preview from image plugin")
