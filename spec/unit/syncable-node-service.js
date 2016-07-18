jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000000;

describe("SyncableNodeService unit test", function(){

	beforeEach(module("workshop.PouchDBTest.services"));

	var SyncableNodeService = null;
	var DBService = null;
	var SyncableNodeFactory = null;
	var $http = null;

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

				DBService.reset()
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

	it("searches by name", function(done){
		var name = "cloudant";

		var s = SyncableNodeFactory._new();
		s.name = name;
		s.user = "user";
		s.password = "password";
		var id = s._id;

		var pin = "1234";

		SyncableNodeService.setPin(pin);

		SyncableNodeService.save(s)
		.then(function(){
			return SyncableNodeService.getByName(name);
		})
		.then(function(doc){
			expect(doc._id).toBe(id);
		})
		.then(done)
		.catch(function(err){
			done.fail(err);
		})
		;

	})

	it("syncs with Cloudant", function(done){
		// credentials loaded from this remote database
		var url = "http://192.168.6.1:8000/db/test";

		DBService.sync(url, {replicate_from: true, live:true, ajax: {withCredentials: false}})
		.then(function(){
			return DBService.get("test-pin");
		})
		.then(function(test_pin){ // import credentials from credentials database
			expect(test_pin.pin).not.toBeUndefined();
			SyncableNodeService.setPin(test_pin.pin);
			return SyncableNodeService.getByName("cloudant");
		})
		.then(function(cloudant){
			expect(cloudant).not.toBe(null, "Cloudant syncable not found");
			console.log("start sync...");
			return SyncableNodeService.sync(cloudant)	
		})
		.then(function(){
			return DBService.get("cloudant-test-x");
		})
		.then(function(doc){
			expect(doc.check).toBe("pandemonium-in-the-cloud");
			done();
		})
		.catch(function(err){
		 	done.fail(err);
		})
		;
	})

})