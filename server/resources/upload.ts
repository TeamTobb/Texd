


/*//TODO is this in use?  
export function upload(req, res) {
    var sampleFile;
    
	if (!req.files) {
		res.send('No files were uploaded.');
		return;
	}
 
	sampleFile = req.files.sampleFile;
	sampleFile.mv('/', function(err) {
		if (err) {
			res.status(500).send(err);
            
		}
		else {
			res.send('File uploaded!');
		}
	});
}
*/
var fs = require('fs');

//import express = require("express");
var multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var documentID: string = ""
        for (var index = 0; index < req.rawHeaders.length; index++) {
            var element = req.rawHeaders[index];
            if (element == "Referer") {
                documentID = req.rawHeaders[index + 1].slice(req.rawHeaders[index + 1].length - 24, req.rawHeaders[index + 1].length);
            }
        }
		var documentDir = './public/uploads/document/'; 

        var documentIdDir = './public/uploads/document/' + documentID.trim()// '/photos'
        var photoDirForDocId = documentIdDir + '/photos'
		console.log("Testing: "+documentIdDir);
		
		if (!fs.existsSync(documentDir)) {
            fs.mkdirSync(documentDir);            
        }
		
        if (!fs.existsSync(documentIdDir)) {
            fs.mkdirSync(documentIdDir);
            fs.mkdirSync(photoDirForDocId);
        }
        callback(null, photoDirForDocId);
    },
    filename: function (req, file, callback) {
        var originalName: string = ""
        for (var index = 0; index < req.rawHeaders.length; index++) {
            var element = req.rawHeaders[index];
            if (element == "originalName") {
                originalName = req.rawHeaders[index + 1];
                // replace all whitespace with nothing
                originalName = originalName.replace(/\s/g, "");
            }
        }
        callback(null, originalName);
    }
});

var saveUploadedFile = multer({ storage: storage }).single('photo');


export function upload(req, res) {
	console.log("uploadfunc");
	
    saveUploadedFile(req, res, function (err) {
		console.log("saveUploadedFile Naa ");
		
        if (err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
};