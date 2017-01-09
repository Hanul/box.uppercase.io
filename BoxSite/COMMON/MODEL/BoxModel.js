BoxSite.BoxModel = OBJECT({

	preset : function() {
		'use strict';

		return BoxSite.MODEL;
	},

	params : function() {
		'use strict';

		var
		// valid data set
		validDataSet = {
			
			userId : {
				notEmpty : true,
				id : true 
			},
			
			name : {
				notEmpty : true,
				size : {
					max : 255
				}
			},
			
			version : {
				notEmpty : true,
				size : {
					max : 255
				}
			},
			
			fileId : {
				notEmpty : true,
				id : true
			},
			
			dependency : {
				array : true,
				each : {
					size : {
						max : 20 + 1 + 255
					}
				}
			},
			
			readme : {
				size : {
					max : 30000
				}
			},
			
			readmeHTML : true,
			
			downloadCount : {
				notEmpty : true,
				integer : true
			}
		};
		
		return {
			name : 'Box',
			initData : {
				downloadCount : 0
			},
			methodConfig : {
				create : {
					valid : VALID(validDataSet)
				},
				update : {
					valid : VALID(validDataSet)
				},
				remove : false
			}
		};
	}
});
