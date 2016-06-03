function EntryViewModel(entry, editing, cancellable){
    this.data = entry;
    this.editing = editing || false;
    this.cancellable = cancellable || false;
}

function QuestViewModel(quest, journal_entries){
	var self = this;

	this.data = quest;
	this.data.journal = [];
	this.journal = journal_entries.map(function(entry){
		return new EntryViewModel(entry);
	});
	this.tasks = quest.tasks.map(function(task){
		return new TaskViewModel(task);
	});

	this.addTask = function(task_data){
		this.data.tasks.push(task_data);
		var vm = new TaskViewModel(task_data);
		this.tasks.push(vm);
		return vm;
	};

	this.removeTask = function(task_vm){
		var indx = this.tasks.indexOf(task_vm);
		this.tasks.splice(indx, 1);
		indx = this.data.tasks.indexOf(task_vm.data);
		this.data.tasks.splice(indx, 1);
	}
}

function TaskViewModel(task, editing, cancellable) {
	this.data = task;
	this.editing = editing || false;
	this.cancellable = cancellable || false;
}