describe("SyncableNodeService unit test", function(){

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

	it("works!", function(done){
		var s = SyncableNodeFactory._new();
		s.user = "user";
		s.password = "password";
		var id = s._id;

		var pin = "1234";

		SyncableNodeService.setPin(pin);

		SyncableNodeService.save(s)
		.then(function(){
			return SyncableNodeService.get(id)
		})
		.then(function(syncable_node){
			expect(syncable_node.user).toBe("user");
			expect(syncable_node.password).toBe("password");

			done();		
		})
		.catch(function(err){
			done.fail(err);
		})
		;
		
	})

})