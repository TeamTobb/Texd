//TODO is this in use?  
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

