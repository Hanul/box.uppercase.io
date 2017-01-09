BoxSite.UserModel = OBJECT({

	preset : function() {
		'use strict';

		return BoxSite.MODEL;
	},

	params : function() {
		'use strict';

		var
		// valid data set
		validDataSet = {

			username : {
				notEmpty : true,
				size : {
					min : 4,
					max : 20
				},
				username : true
			},
			
			screenname : {
				notEmpty : true,
				size : {
					min : 4,
					max : 20
				}
			},
			
			email : {
				notEmpty : true,
				size : {
					min : 5,
					max : 320
				},
				email : true
			},
			
			password : {
				notEmpty : true,
				size : {
					min : 4,
					max : 20
				}
			},
			
			loginCount : {
				notEmpty : true,
				integer : true
			},
			
			lastLoginTime : {
				date : true
			},

			isBanned : {
				bool : true
			},

			isLeft : {
				bool : true
			},

			isAgreedTerms : {
				notEmpty : true,
				equal : true
			},
			
			roles : {
				array : true
			}
		};

		return {
			name : 'User',
			initData : {
				loginCount : 0
			},
			methodConfig : {
				create : {
					valid : VALID(validDataSet)
				},
				update : {
					valid : VALID(validDataSet)
				},
				remove : false
			},
			loginValid : VALID({
				username : validDataSet.username,
				password : validDataSet.password
			})
		};
	}
});
