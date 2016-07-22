Feature: User journal
	As the user of the journal
	I Want to take notes about my journey
	And have them annotated with all available metadata like current quest, location, date and time, etc
	So I can review and reference them in a chronological way

	Scenario: User has an idea
		Given User is a creative person
		And User has slept well
		And User has a little shining lightbulb over his/her head
		When User looks at the Journal
		And pushes the little pen at the top of the screen
		Then the journal opens a supercute rich text editor
		And journal shows a smile to the User and a bear-hugging animated gif.