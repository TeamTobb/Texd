import express = require("express");
var bodyParser = require('body-parser');
var fs = require('fs');
import path = require('path');

//TODO: refactore ++ error handling
export function read(req: express.Request, res: express.Response) {
    var data = {};
    var pathDir = path.join(__dirname, '../snappets/');
    var filenames = fs.readdirSync(pathDir);
    

    filenames.forEach((filename) => {
        var obj = JSON.parse(fs.readFileSync(pathDir + filename, 'utf-8'))
        for(var property in obj){
            data[obj[property].prefix] = obj[property];
        }
        // data = obj; 
    });
    console.log("snappets: " + JSON.stringify(data, null, 2)); 
    res.jsonp(data);
};
