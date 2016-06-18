angular.module("workshop.PouchDBTest.directives", [])

.directive("journalEntry", function(){

    var controller = [
        "$scope",
        "$rootScope",
        "workshop.PouchDBTest.services.DBService",
        function($scope, $rootScope, DBService){

            // methods
            $scope.edit = function(){
                if ($scope.writeLock.writing) 
                    return;
                $scope.entry.editing = true;
                $scope.writeLock.writing = true;
            }

            $scope.save = function(){
                DBService.save($scope.entry.data)
                    .then(function(doc){
                        $scope.entry.editing = false;
                        $scope.entry.cancellable = false;
                        $scope.writeLock.writing = false;
                        $scope.$apply();
                    });
            }

            $scope.cancel = function(){
                $scope.entry.editing = false;
                $scope.writeLock.writing = false;
                $rootScope.$broadcast("sub-item-cancelled");
            }

            $scope.destroy = function(){
                DBService.destroy($scope.entry.data)
                    .then(function(){
                        $scope.entry.cancellable = true;
                        $rootScope.$broadcast("sub-item-cancelled");           
                    })
            }
            // END: methods

        }
    ]
    ;

    return {
        restrict: "E",
        scope: {
            entry: "=",
            writeLock: "="
        },
        replace: true,
        controller: controller,
        templateUrl: "directives/journal-entry.html"
    };
})

.directive("questDetail", function(){

    var controller = [ 
        "$scope",
        "$sanitize",
        "workshop.PouchDBTest.services.JournalEntryFactory",
        "workshop.PouchDBTest.services.TaskFactory",
        "workshop.PouchDBTest.services.ReferenceFactory",
        "workshop.PouchDBTest.services.FileFactory",
        "workshop.PouchDBTest.services.QuestService",
        "workshop.PouchDBTest.services.DBService",
        function($scope, $sanitize, JournalEntryFactory, 
            TaskFactory, ReferenceFactory, FileFactory,
            QuestService,
            DBService){

            // fields
            $scope.writeLock = {writing: false};
            $scope.currentTaskSorting = "DATE_ASC";
            // END: fields

            // methods
            $scope.writeJournal = function(){
                var text = $sanitize('Lorem <a href="#">ipsum</a>');
                var entry = JournalEntryFactory._new(text, $scope.quest.data);
                var entry_viewmodel = new EditableViewModel(entry, true, true);
                $scope.quest.journal.unshift(entry_viewmodel);
                $scope.writeLock.writing = true;
            }

            $scope.addTask = function(){
                var text = 'To do...';
                var task = TaskFactory._new(text, $scope.quest.data);
                var vm = $scope.quest.addTask(task);
                vm.editing = true;
                $scope.writeLock.writing = true;   
            }

            $scope.removeTask = function(task_vm){
                $scope.quest.removeTask(task_vm);
            }

            $scope.sortTasks = function(sort_criteria){
                switch(sort_criteria){
                    case DBService.sort_criteria.DATE_ASC:
                        $scope.currentTaskSorting = DBService.sort_criteria.DATE_ASC;
                        $scope.quest.sortTasks(function(task1, task2){
                            return new Date(task2.created_at) - new Date(task1.created_at);
                        });
                        break;
                    case DBService.sort_criteria.DATE_DESC:
                        $scope.currentTaskSorting = DBService.sort_criteria.DATE_DESC;
                        $scope.quest.sortTasks(function(task1, task2){
                            return new Date(task1.created_at) - new Date(task2.created_at);
                        });
                        break;
                    default:
                        throw "sort criterium " + sort_criteria + " not supported";
                }

                $scope.$emit("quest-nested-object-changed");
            }

            $scope.sortTasksDateToggle = function(){
                if($scope.currentTaskSorting == DBService.sort_criteria.DATE_ASC)
                    $scope.sortTasks(DBService.sort_criteria.DATE_DESC);
                else 
                    $scope.sortTasks(DBService.sort_criteria.DATE_ASC);
            }

            $scope.addReference = function(){
                var title = "Lorem ipsum";
                var ref = ReferenceFactory._new(title);
                var vm = $scope.quest.addReference(ref);
                vm.editing = true;
                $scope.writeLock.writing = true;
            }

            $scope.addFile = function(){
                var name = "File...";
                var file = FileFactory._new();
                var vm = $scope.quest.addFile(file);
                vm.editing = true;
                $scope.writeLock.writing = true;   
            }

            // END: methods

            // events
            $scope.$on("sub-item-cancelled", function(){
                $scope.quest.journal = $scope.quest.journal.filter(function(obj){
                    return !obj.cancellable;
                });
                $scope.quest.references = $scope.quest.references.filter(function(obj){
                    return !obj.cancellable;
                })
                $scope.$apply();
            })

            $scope.$on("quest-nested-object-changed", function(){
                QuestService.save($scope.quest.data);
            })
            // END: events
        }
    ];

    return {
        restrict: "E",
        scope: {
            quest: "="
        },
        replace: true,
        controller: controller,
        templateUrl: "directives/quest-detail.html"
    };
})

.directive("questTask", function(){

    var controller = [
        "$scope",
        "$rootScope",
        "workshop.PouchDBTest.services.DBService",
        function($scope, $rootScope, DBService){

            // methods
            $scope.save = function(){
                $rootScope.$broadcast("quest-nested-object-changed");
                $scope.task.editing = false;
                $scope.writeLock.writing = false;
            }

            $scope.edit = function(){
                if($scope.writeLock.writing)
                    return;

                $scope.task.editing = true;
                $scope.writeLock.writing = true;
            }

            $scope.destroy = function(){
                $scope.quest.removeTask($scope.task);
                $scope.writeLock.writing = false;
                $rootScope.$broadcast("quest-nested-object-changed");
            }
            // END: methods

        }
    ]

    return {
        restrict: "E",
        scope: {
            task: "=",
            quest: "=",
            writeLock: "="
        },
        replace: true,
        controller: controller,
        templateUrl: "directives/quest-task.html"
    }
})

.directive("questAttachment", function(){

    var controller = [
        "$scope",
        "$rootScope",
        "workshop.PouchDBTest.services.DBService",
        function($scope, $rootScope, DBService) {
            $scope.save = function(){

            }
        }
    ];

    return {
        restrict: "E",
        scope: {
            attachment: "=",
            quest: "=",
            writeLock: "="
        },
        replace: true,
        controller: controller,
        templateUrl: "directives/quest-attachment.html"
    }
})

.directive("questReference", function(){

    var controller = [
        "$scope",
        "$rootScope",
        "workshop.PouchDBTest.services.DBService",
        function($scope, $rootScope, DBService) {
            var self = this;

            // methods
            $scope.save = function(){

                DBService.save($scope.reference.data)
                    .then(function(doc){
                        $scope.reference.editing = false;
                        $scope.reference.cancellable = false;
                        $scope.writeLock.writing = false;
                        $scope.$apply();

                        $scope.$emit("quest-nested-object-changed");
                    });

            }

            $scope.edit = function(){
                if ($scope.writeLock.writing) 
                    return;
                $scope.reference.editing = true;
                $scope.writeLock.writing = true;
            }

            $scope.cancel = function(){
                $scope.reference.editing = false;
                $scope.writeLock.writing = false;
                $rootScope.$broadcast("sub-item-cancelled");
            }

            $scope.destroy = function(){
                DBService.destroy($scope.reference.data)
                    .then(function(){
                        $scope.reference.cancellable = true;
                        $rootScope.$broadcast("sub-item-cancelled");           
                    })
            }
            // END: methods
        }
    ];

    return {
        restrict: "E",
        scope: {
            reference: "=",
            quest: "=",
            writeLock: "="
        },
        replace: true,
        controller: controller,
        templateUrl: "directives/quest-reference.html"
    }
})

.directive("questFile", function(){
    var controller = [
        "$scope",
        "$rootScope",
        "workshop.PouchDBTest.services.DBService",
        function($scope, $rootScope, DBService) {

            $scope.save = function(){
                $scope.file.editing = false;
                $scope.file.cancellable = false;
                $scope.writeLock.writing = false;

                $scope.$emit("quest-nested-object-changed");
            }

            $scope.edit = function(){

            }
        }
    ];

    return {
        restrict: "E",
        scope: {
            file: "=",
            quest: "=",
            writeLock: "="
        },
        replace: true,
        controller: controller,
        templateUrl: "directives/quest-file.html"
    }
})

.directive("fileAttachment", function(){
    return {
        restrict: "A",
        scope: {
            data: "=fileData"
        },
        link: function(scope, element, attrs){
            element.bind("change", function(event){
                var file = event.target.files[0];

                scope.data.data = file;
                scope.data.filetype = file.type;
                scope.data.filename = file.name;

                scope.$apply();
            });
        }
    }
})

;
