import express = require("express");
var bodyParser = require('body-parser');
var fs = require('fs');
import path = require('path');

//TODO: refactore ++ error handling
export function read(req: express.Request, res: express.Response) {
    var data = [];
    var pathDir = path.join(__dirname,'../plugins/');
    var filenames = fs.readdirSync(pathDir);

    filenames.forEach((filename)=>{
        data.push(JSON.parse(fs.readFileSync(pathDir+filename, 'utf-8')));
    });
    res.jsonp(data);
};
