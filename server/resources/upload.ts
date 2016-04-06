//TODO change this file to handle uploads/photo and /upload/json

export function upload(req, res) {
    console.log("[trying to] UPLOAD FILE ")
    var sampleFile;
    
    console.log(req);
    console.log("Body: "+ req.body);
    console.log("Files: "+req.files);
    
    
	if (!req.files) {
        console.log("!req.files")
		res.send('No files were uploaded.');
		return;
	}
 
	sampleFile = req.files.sampleFile;
    console.log(JSON.stringify(sampleFile, null, 2))
	sampleFile.mv('/', function(err) {
        console.log("sampleFile.mv('/', function(err) ")
		if (err) {
			res.status(500).send(err);
            
		}
		else {
			res.send('File uploaded!');
		}
	});
}

