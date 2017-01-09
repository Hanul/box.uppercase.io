BoxSite.MAIN = METHOD({

	run : function(addRequestListener, addPreprocessor) {
		'use strict';
		
		var
		//IMPORT: Less
		Less = require('less'),
		
		// box matcher
		boxMatcher = URI_MATCHER('{username}/{boxName}'),
		
		// user matcher
		userMatcher = URI_MATCHER('{username}'),
		
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
			matcherResult = boxMatcher.check(uri),
			
			// data
			data,
			
			// username
			username,
			
			// password
			password;
			
			if (matcherResult.checkIsMatched() === true) {
				if (matcherResult.getURIParams().username === '_') {
					requestInfo.uri = matcherResult.getURIParams().boxName;
					
					// BOX 출시
					if (requestInfo.uri === 'publish' && requestInfo.data !== undefined) {
						
						data = requestInfo.data;
						username = data.username;
						password = data.password;
						
						if (username !== undefined && password !== undefined) {
							
							username = username.toLowerCase();
							
							NEXT([
							function(next) {
								
								BoxSite.UserModel.get({
									filter : {
										username : username,
										password : SHA256({
											key : username,
											password : password
										})
									}
								}, {
									notExists : function() {
										response(STRINGIFY({
											validErrors : {
												password : {
													type : 'wrong'
												}
											}
										}));
									},
									success : next
								});
							},
							
							function(next) {
								return function(userData) {
									
									BoxSite.BoxModel.get({
										filter : {
											userId : userData.id,
											name : data.boxName
										}
									}, {
										notExists : function() {
											
											BoxSite.BoxModel.create({
												userId : userData.id,
												name : data.boxName,
												version : data.version,
												fileId : data.fileId,
												readme : data.readme,
												dependency : data.dependency
											}, {
												notValid : function(validErrors) {
													response(STRINGIFY({
														validErrors : validErrors
													}));
												},
												success : next
											});
										},
										
										success : function(boxData) {
											
											if (boxData.version === data.version) {
												response(STRINGIFY({
													validErrors : {
														version : {
															type : 'existed'
														}
													}
												}));
											} else {
												
												BoxSite.BoxModel.update({
													id : boxData.id,
													version : data.version,
													fileId : data.fileId,
													readme : data.readme,
													dependency : data.dependency
												}, {
													notValid : function(validErrors) {
														response(STRINGIFY({
															validErrors : validErrors
														}));
													},
													success : next
												});
											}
										}
									});
								};
							},
							
							function() {
								return function() {
									response();
								};
							}]);
						}
						
						return false;
					}
					
					// BOX 정보 가져오기
					if (requestInfo.uri === 'info' && requestInfo.data !== undefined) {
						
						data = requestInfo.data;
						username = data.username;
						
						if (username !== undefined) {
							
							username = username.toLowerCase();
							
							NEXT([
							function(next) {
								
								BoxSite.UserModel.get({
									filter : {
										username : username
									}
								}, {
									notExists : function() {
										response(STRINGIFY({
											validErrors : {
												username : {
													type : 'notExists'
												}
											}
										}));
									},
									success : next
								});
							},
							
							function() {
								return function(userData) {
									
									BoxSite.BoxModel.get({
										filter : {
											userId : userData.id,
											name : data.boxName
										}
									}, {
										notExists : function() {
											
											response(STRINGIFY({
												validErrors : {
													boxName : {
														type : 'notExists'
													}
												}
											}));
										},
										
										success : function(boxData) {
											
											response(STRINGIFY({
												boxData : {
													version : boxData.version,
													fileId : boxData.fileId
												}
											}));
										}
									});
								};
							}]);
						}
						
						return false;
					}
				}
				
				else {
					requestInfo.uri = 'box';
					
					username = matcherResult.getURIParams().username;
					if (username !== undefined) {
						requestInfo.params.username = username.toLowerCase();
					}
					requestInfo.params.boxName = matcherResult.getURIParams().boxName;
				}
			}
			
			else {
				matcherResult = userMatcher.check(uri);
				if (matcherResult.checkIsMatched() === true) {
					requestInfo.uri = 'user';
					
					username = matcherResult.getURIParams().username;
					if (username !== undefined) {
						requestInfo.params.username = username.toLowerCase();
					}
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
