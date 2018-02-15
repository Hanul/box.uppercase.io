OVERRIDE(BoxSite.BoxModel, (origin) => {

	BoxSite.BoxModel = OBJECT({

		preset : () => {
			return origin;
		},

		init : (inner, self, params) => {
			
			// 인덱싱
			self.getDB().createIndex({
				userId : 1
			});
			
			self.getDB().createIndex({
				userId : 1,
				name : 1
			});
			
			inner.on('create', {
			
				before : (data, next, ret, clientInfo) => {
					
					if (data.readme === undefined) {
						data.readmeHTML = undefined;
						next();
					} else {
						data.readmeHTML = Markdown.MarkUp(data.readme);
						next();
					}
					
					return false;
				}
			});
			
			inner.on('update', {
			
				before : (data, next, ret, clientInfo) => {
					
					if (data.readme === TO_DELETE) {
						data.readmeHTML = TO_DELETE;
						next();
					} else if (data.readme !== undefined) {
						data.readmeHTML = Markdown.MarkUp(data.readme);
						next();
					} else {
						next();
					}
				}
			});
		}
	});
});
