function EntryViewModel(entry, editing, cancellable){
    this.data = entry;
    this.editing = editing || false;
    this.cancellable = cancellable || false;
}

function QuestViewModel(quest, journal_entries){
	this.data = quest;
	this.data.journal = [];
	this.journal = journal_entries.map(function(entry){
		return new EntryViewModel(entry);
	});
}