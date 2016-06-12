describe("QuestService unit test", function(){

	beforeEach(module("workshop.PouchDBTest.services"));

	var QuestService = null;
	var QuestFactory = null;
	var DBService = null;

	beforeEach(function(done){
		inject([
			"workshop.PouchDBTest.services.QuestService",
			"workshop.PouchDBTest.services.QuestFactory",
			"workshop.PouchDBTest.services.DBService",
			function(_QuestService_, _QuestFactory_, _DBService_){
				QuestService = _QuestService_;
				QuestFactory = _QuestFactory_;
				DBService = _DBService_;

				DBService.clear()
					.catch(function(error){
						console.log("ERROR CLEARING DB " + error);
						expect(error).toBeUndefined();
					})
					.finally(done)

			}
		])
	})

	it("can clear database", function(done){
		DBService.clear()
			.catch(function(error){
				console.log("ERROR " + error);
				expect(error).toBeUndefined();
			})
			.finally(done)
	})

	it("lists all quests", function(done){

		var quest = QuestFactory._new("test");

		QuestService.save(quest).then(function(){

			return QuestService.all("DATE_DESC")
				.then(function(all){
					expect(all.length).toEqual(1);
				})
				.catch(function(error){
					expect(error).toBeUndefined();
				}).finally(function(){
					QuestService.destroy(quest).then(function(){
						done();
					})
				})
				;
		});


	});

})