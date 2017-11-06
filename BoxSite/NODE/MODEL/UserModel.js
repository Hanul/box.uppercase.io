OVERRIDE(BoxSite.UserModel, (origin) => {

	BoxSite.UserModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self, params) => {
			
			// 인덱싱
			self.getDB().createIndex({
				username : 1
			});
			
			inner.on('create', {

				before : (data, next, ret) => {
					
					self.checkExists({
						filter : {
							username : data.username
						}
					}, (exists) => {

						if (exists === true) {

							ret({
								validErrors : {
									username : {
										type : 'existed'
									}
								}
							});

						} else {
							
							data.password = SHA256({
								key : data.username,
								password : data.password
							});
							
							// 보안상 삭제
							delete data.isBanned;
							delete data.isLeft;
							
							data.roles = [BoxSite.ROLE.USER];
							
							next();
						}
					});

					return false;
				},

				after : (savedData) => {

					// 보안상 삭제
					delete savedData.password;
				}
			});
			
			inner.on('update', {
			
				before : (data, next, ret, clientInfo) => {
					
					let cookies;
					
					// 보안상 삭제
					if (clientInfo !== undefined) {
						delete data.email;
					}
					delete data.isBanned;
					delete data.isLeft;
					
					NEXT([
					(next) => {
						
						if (clientInfo === undefined) {
							next();
						}
						
						else if (clientInfo.headers !== undefined && clientInfo.headers.cookies !== undefined) {
							cookies = clientInfo.headers.cookies;
							
							if (cookies['session-key'] !== undefined) {
								
								BoxSite.SessionKeyModel.get(cookies['session-key'], (sessionKeyData) => {
									
									if (data.id === sessionKeyData.userId) {
										next();
									}
								});
							}
						}
					},
					
					() => {
						return () => {
							
							self.get(data.id, (userData) => {
								
								// 아이디가 기존과 같고 비밀번호만 바꾸는 경우
								if (data.username === userData.username) {
									
									if (data.password !== undefined) {
									
										data.password = SHA256({
											key : userData.username,
											password : data.password
										});
									}
		
									next();
								}
								
								// 아이디를 변경하는 경우
								else if (data.username !== undefined) {
		
									self.checkExists({
										filter : {
											username : data.username
										}
									}, (exists) => {
		
										if (exists === true) {
		
											ret({
												validErrors : {
													username : {
														type : 'existed'
													}
												}
											});
		
										} else {
											
											// 비밀번호도 바꾸는 경우
											if (data.password !== undefined) {
												data.password = SHA256({
													key : data.username,
													password : data.password
												});
											}
		
											next();
										}
									});
								}
								
								// 아이디 변경 없이 비밀번호만 바꾸는 경우
								else if (data.password !== undefined) {
									
									data.password = SHA256({
										key : userData.username,
										password : data.password
									});
									
									next();
								}
								
								// 아이디 비밀번호 변경이 아닌 경우
								else {
									next();
								}
							});
						};
					}]);
					
					return false;
				},

				after : (savedData) => {

					// 보안상 삭제
					delete savedData.password;
				}
			});
			
			inner.on('get', (savedData) => {
				
				// 보안상 삭제
				delete savedData.password;
			});
			
			inner.on('find', EACH((savedData) => {
				
				// 보안상 삭제
				delete savedData.password;
			}));
			
			let login = self.login = (params, callbacks) => {
				//REQUIRED: params
				//REQUIRED: params.username
				//REQUIRED: params.password
				//REQUIRED: callbacks
				//REQUIRED: callbacks.notValid
				//REQUIRED: callbacks.success
				
				self.get({
					filter : {
						username : params.username,
						password : SHA256({
							key : params.username,
							password : params.password
						})
					}
				}, {
					notExists : () => {
						callbacks.notValid();
					},
					success : (userData) => {
						
						// 탈퇴 유저는 로그인 불가
						if (userData.isLeft === true) {
							
							callbacks.notValid();
							
						} else {

							BoxSite.SessionKeyModel.create({
								userId : userData.id
							}, (sessionKeyData) => {

								self.updateNoHistory({
									id : userData.id,
									lastLoginTime : new Date(),
									$inc : {
										loginCount : 1
									}
								}, (savedData) => {
									callbacks.success(savedData, sessionKeyData.id);
								});
							});
						}
					}
				});
			};
		}
	});
});
