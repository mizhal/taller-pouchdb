/** Viewmodels are, in fact, the same as angular controllers restricted
	to some portion of the interface or html tag.
	For example these viewmodels I use could be built attaching
	an angular controller to article.quest or article.journal-entry.
	But for this feature, I choose to have control of the constructor
	of viewmodels, so I could set them as editable or cancellable from
	the start.
**/

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
		self.data.tasks.push(task_data);
		var vm = new TaskViewModel(task_data);
		self.tasks.push(vm);
		return vm;
	};

	this.removeTask = function(task_vm){
		var indx = self.tasks.indexOf(task_vm);
		self.tasks.splice(indx, 1);
		indx = self.data.tasks.indexOf(task_vm.data);
		self.data.tasks.splice(indx, 1);
	}

	this.sortTasks = function(sorting_function){
		self.data.tasks.sort(sorting_function);
		/** I think I must refactor this dual representation of tasks
			(data list + viewmodel list), or maybe try an angular controller
			for task viewmodel.
			Regenerating viewmodels each time the user sorts the list doesn't
			seem very performant.
		**/
		self.tasks = self.data.tasks.map(function(task){
			return new TaskViewModel(task);
		});
	}
}

function TaskViewModel(task, editing, cancellable) {
	this.data = task;
	this.editing = editing || false;
	this.cancellable = cancellable || false;
}