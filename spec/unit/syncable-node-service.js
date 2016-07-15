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
		var id = s._id;

		var pin = "1234";

		SyncableNodeService.setPin(pin);

		SyncableNodeService.save(s);
		var s = SyncableNodeService.get(s);

		done();
	})

})