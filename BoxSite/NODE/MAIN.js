BoxSite.MAIN = METHOD({

	run : (addRequestListener, addPreprocessor) => {
		
		let Less = require('less');
		
		let boxMatcher = URI_MATCHER('{username}/{boxName}');
		let userMatcher = URI_MATCHER('{username}');
		
		let nspRequestListener = NSP.Bridge({
			rootPath : './BoxSite/view',
			templateEngine : SML.Compile
		}).requestListener;
		
		addRequestListener((requestInfo, response, replaceRootPath, next) => {
			
			let uri = requestInfo.uri;
			let matcherResult = boxMatcher.check(uri);
			
			if (matcherResult.checkIsMatched() === true) {
				if (matcherResult.getURIParams().username === '_') {
					requestInfo.uri = matcherResult.getURIParams().boxName;
					
					// BOX 출시
					if (requestInfo.uri === 'publish' && requestInfo.data !== undefined) {
						
						let data = requestInfo.data;
						let username = data.username;
						let password = data.password;
						
						if (username !== undefined && password !== undefined) {
							
							username = username.toLowerCase();
							
							NEXT([
							(next) => {
								
								BoxSite.UserModel.get({
									filter : {
										username : username,
										password : SHA256({
											key : username,
											password : password
										})
									}
								}, {
									notExists : () => {
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
							
							(next) => {
								return (userData) => {
									
									BoxSite.BoxModel.get({
										filter : {
											userId : userData.id,
											name : data.boxName
										}
									}, {
										notExists : () => {
											
											BoxSite.BoxModel.create({
												userId : userData.id,
												name : data.boxName,
												version : data.version,
												fileId : data.fileId,
												readme : data.readme,
												dependency : data.dependency
											}, {
												notValid : (validErrors) => {
													response(STRINGIFY({
														validErrors : validErrors
													}));
												},
												success : next
											});
										},
										
										success : (boxData) => {
											
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
													notValid : (validErrors) => {
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
							
							() => {
								return () => {
									response();
								};
							}]);
						}
						
						return false;
					}
					
					// BOX 정보 가져오기
					if (requestInfo.uri === 'info' && requestInfo.data !== undefined) {
						
						let data = requestInfo.data;
						let username = data.username;
						
						if (username !== undefined) {
							
							username = username.toLowerCase();
							
							NEXT([
							(next) => {
								
								BoxSite.UserModel.get({
									filter : {
										username : username
									}
								}, {
									notExists : () => {
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
							
							() => {
								return (userData) => {
									
									BoxSite.BoxModel.get({
										filter : {
											userId : userData.id,
											name : data.boxName
										}
									}, {
										notExists : () => {
											
											response(STRINGIFY({
												validErrors : {
													boxName : {
														type : 'notExists'
													}
												}
											}));
										},
										
										success : (boxData) => {
											
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
			preprocessor : (content, response) => {
				
				Less.render(content, (error, output) => {
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
