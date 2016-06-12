describe("quest CRUD", function(){
	it("should create a new quest", function(){
		browser.get("http://localhost:8080");

		element(by.css("#create-quest")).click();

		element(by.model("quest.name")).sendKeys("Protractor test quest");
		element(by.model("quest.description")).sendKeys("The description");

		element(by.css("#quest-save")).click();
		
		var quests = element.all(by.repeater("quest in quests"));
		expect(quests.count()).toEqual(1);
	})
})