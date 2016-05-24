import express = require("express");
var bodyParser = require('body-parser');
var fs = require('fs');
import path = require('path');

//TODO: refactore ++ error handling
export function read(req: express.Request, res: express.Response) {
    var data = {};
    var pathDir = path.join(__dirname, '../snippets/');
    var filename = "snippets.json";

    var obj = JSON.parse(fs.readFileSync(pathDir + filename, 'utf-8'))
    res.jsonp(obj);
};
