function EntryViewModel(entry, editing){
    this.data = entry;
    this.editing = editing || false;
}

function QuestViewModel(quest, journal_entries){
	this.data = quest;
	this.data.journal = [];
	this.journal = journal_entries.map(function(entry){
		return new EntryViewModel(entry);
	});
}