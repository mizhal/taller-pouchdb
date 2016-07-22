describe("JournalService unit test", function(){

	beforeEach(module("workshop.PouchDBTest.services"));

	var JournalService = null;
	var JournalEntryFactory = null;
	var DBService = null;

	beforeEach(function(done){
		inject([
			"workshop.PouchDBTest.services.JournalService",
			"workshop.PouchDBTest.services.JournalEntryFactory",
			"workshop.PouchDBTest.services.DBService",
			function(_JournalService_, _JournalEntryFactory_, _DBService_){
				JournalService = _JournalService_;
				JournalEntryFactory = _JournalEntryFactory_;
				DBService = _DBService_;

				localStorage.clear();

				DBService.connect("test")
				.then(function(){
					return DBService.clear();	
				})
				.catch(function(error){
					console.log("ERROR CLEARING DB " + error);
					expect(error).toBeUndefined();
				})
				.finally(done)

			}
		])
	})

	it("works!", function(){
		expect(null).toBe(null);
	})

})
;