BoxSite.MAIN = METHOD({

	run : function(addRequestListener, addPreprocessor) {
		'use strict';
		
		var
		//IMPORT: Less
		Less = require('less'),
		
		// box matcher
		boxMatcher = URI_MATCHER('{userName}/{boxName}'),
		
		// user matcher
		userMatcher = URI_MATCHER('{userName}'),
		
		// nsp request listener
		nspRequestListener = NSP_BRIDGE({
			rootPath : './BoxSite/view',
			templateEngine : SML
		}).requestListener;
		
		addRequestListener(function(requestInfo, response, replaceRootPath, next) {
			
			var
			// uri
			uri = requestInfo.uri,
			
			// matcher result
			matcherResult = boxMatcher.check(uri);
			
			if (matcherResult.checkIsMatched() === true) {
				if (matcherResult.getURIParams().userName === '_') {
					requestInfo.uri = matcherResult.getURIParams().boxName;
				} else {
					requestInfo.uri = 'box';
				}
			} else {
				matcherResult = userMatcher.check(uri);
				if (matcherResult.checkIsMatched() === true) {
					requestInfo.uri = 'user';
				}
			}
			
			return nspRequestListener(requestInfo, response, replaceRootPath, next);
		});
		
		addPreprocessor({
			extension : 'less',
			preprocessor : function(content, response) {
				
				Less.render(content, function(error, output) {
					response({
						content : output.css,
						contentType : 'text/css',
						version : CONFIG.version
					});
				});
			}
		});
	}
});
