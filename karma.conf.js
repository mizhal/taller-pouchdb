// karma.conf.js
module.exports = function(config) {
  config.set(
	  {
	    basePath: '.',
	    frameworks: ['jasmine'],
	    files: [
	    	// LIBS
	    	'./www/lib/**/*.js',
	    	// END: LIBS

	    	// APP
	    	'./www/js/*.js',
	    	// END: APP

	    	// TESTS
	    	'./spec/unit/**/*.js'
	    	// END: TESTS
	    ],
		browsers: ['PhantomJS', 'Chrome', 'Firefox'],
		singleRun: true,
		browserNoActivityTimeout: 30000,
		browserDisconnectTimeout: 30000
	  }
  );
};