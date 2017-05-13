BoxSite.SessionKeyModel = OBJECT({

	preset : () => {
		return BoxSite.MODEL;
	},

	params : () => {
		
		let validDataSet = {

			userId : {
				notEmpty : true,
				id : true
			}
		};

		return {
			name : 'SessionKey',
			methodConfig : {
				create : false,
				update : false,
				remove : false
			}
		};
	}
});
