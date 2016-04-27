//TODO change this file to handle uploads/photo and /upload/json

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

