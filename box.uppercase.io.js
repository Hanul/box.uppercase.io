require(process.env.UPPERCASE_PATH + '/LOAD.js');

BOOT({
	CONFIG : {
		isDevMode : true,
		defaultBoxName : 'BoxSite',
		title : 'UPPERCASE BOX 저장소 사이트',
		webServerPort : 8124
	},
	NODE_CONFIG : {
		isNotUsingCPUClustering : true,
		dbName : 'BoxSite-test'
	}
});
