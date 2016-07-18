describe("DBService unit test", function(){

	beforeEach(module("workshop.PouchDBTest.services"));

	var SyncableNodeService = null;
	var DBService = null;
	var SyncableNodeFactory = null;

	beforeEach(function(done){
		inject([
			"workshop.PouchDBTest.services.SyncableNodeService",
			"workshop.PouchDBTest.services.DBService",
			"workshop.PouchDBTest.services.SyncableNodeFactory",
			function(_SyncableNodeService, _DBService, _SyncableNodeFactory){
				SyncableNodeService = _SyncableNodeService;
				expect(SyncableNodeService).not.toBeUndefined();
				DBService = _DBService;
				expect(DBService).not.toBeUndefined();
				SyncableNodeFactory = _SyncableNodeFactory;
				expect(SyncableNodeFactory).not.toBeUndefined();

				DBService.clear()
					.catch(function(error){
						console.log("ERROR CLEARING DB " + error);
						expect(error).toBeUndefined();
					})
					.finally(done)
			}
		])
	})

	it("syncs with another database", function(done){
		var s = "http://www.alvi.com:3000/db/test";

		DBService.sync(s, {ajax: {withCredentials: false}})
			.then(function(){
				return DBService.get("test-key-x")
					.then(function(doc){
						expect(doc.check).toBe("pandemonium");
						done();		
					})
			})
			.catch(function(err){
				done.fail(err);
			})
		;
	})

	it("syncs with Cloudant", function(done){
		var url = "http://www.alvi.com:3000/db/patcharan";

		DBService.sync(url, {ajax: {withCredentials: false}})
		.then(function(){ // import credentials from credentials database
			return SyncableNodeService.get({name: "cloudant"})
		})
		.then(function(cloudant){
			return SyncableNodeService.sync(cloudant, {ajax: {withCredentials: false}})	
		})
		.then(function(){
			return DBService.get("cloudant-test-x");
		})
		.then(function(doc){
			expect(doc.check).toBe("pandemonium");
			done();
		})
		.catch(function(err){
			done.fail(err);
		})
		;
	})

})