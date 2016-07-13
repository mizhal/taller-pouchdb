/** Viewmodels are, in fact, the same as angular controllers restricted
	to some portion of the interface or html tag.
	For example these viewmodels I use could be built attaching
	an angular controller to article.quest or article.journal-entry.
	But for this feature, I choose to have control of the constructor
	of viewmodels, so I could set them as editable or cancellable from
	the start.
**/

function EditableViewModel(data, editing, cancellable){
    this.data = data;
    this.editing = editing || false;
    this.cancellable = cancellable || false;
}

FileViewModel.prototype = new EditableViewModel();
function FileViewModel(data, editing, cancellable) {
	EditableViewModel.call(this, data, editing, cancellable);

	var self = this;

	this.isImage = function(){
		return this.data.content_type && this.data.content_type.startsWith("image/");
	}
}

function QuestViewModel(quest, journal_entries){
	var self = this;

	this.data = quest;
	this.data.journal = [];
	this.journal = journal_entries.map(function(entry){
		return new EditableViewModel(entry);
	});

	this.tasks = quest.tasks.map(function(task){
		return new EditableViewModel(task);
	});

	this.references = quest.references.map(function(ref){
		return new EditableViewModel(ref);
	})

	this.files = quest.files.map(function(file){
		return new FileViewModel(file);
	})

	quest.references = [];

	// methods 
	this.addTask = function(task_data){
		self.data.tasks.push(task_data);
		var vm = new EditableViewModel(task_data);
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
			return new EditableViewModel(task);
		});
	}

	this.addReference = function(reference_data) {
		// Quest x Reference is a N:M relationship
		// so we have to use a mixed strategy: save references as documents
		// like we did with journal entries but also save reference ids as
		// nested list inside quest document.
		// Later we will have to provide a mechanism to search and attach
		// already defined references (defined in another quest, for example)
		// something like "this url is already known" when user types link.
		self.data.reference_ids.push(reference_data._id);
		var vm = new EditableViewModel(reference_data);
		self.references.push(vm);
		return vm;
	}

	this.removeReference = function(reference_vm) {
		var indx = self.references.indexOf(reference_vm);
		self.references.splice(indx, 1);
		indx = self.data.reference_ids.indexOf(reference_vm.data._id);
		self.data.reference_ids.splice(indx, 1);
	}

	this.addFile = function(file_data) {
		self.data.files.push(file_data);
		var vm = new FileViewModel(file_data);
		self.files.push(vm);

		return vm;
	}
	// END: methods
}