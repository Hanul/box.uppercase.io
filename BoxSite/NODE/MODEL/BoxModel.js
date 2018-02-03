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
		}
	});
});
