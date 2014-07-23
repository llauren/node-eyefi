module.exports = {
	// This is the location the pictures will be put by default. The 
	// location can either be a relative or absolute path.
	folder: './pictures/', //required

	// All cards should be listed here.
	cards: {
		// This is the Mac Address which can be found in the Settings.xml
		'00185666499d':{
			// This is the UploadKey as found in the Settings.xml
			uploadkey: '673060865a7a1d44e63bbf5399c13352', // required
			// folder: './pics/', // optional
			command: 'ls %s', // optional
		},

		// if you have more cards, you can add them here
		'00185650f586' : {
			uploadkey: 'f3bc423f3bda7247e0807e844baebdcc', // required
		},
                '001856519041' : {
                  uploadkey: '2c19819f8a9d9516af55d8f4567a4ce1'
               ,
                '001856519041' : {
                  uploadkey: '2c19819f8a9d9516af55d8f4567a4ce1'
                }}
	},

	// If you need help finding a bug just turn on debugging.
	debug: true, // true or false

        // Posts the image to a webserver
 //       post: "http://localhost/photos"
};
