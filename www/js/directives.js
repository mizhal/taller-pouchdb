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
                $rootScope.$broadcast("journal-entry-cancelled");
            }

            $scope.destroy = function(){
                DBService.destroy($scope.entry.data)
                    .then(function(){
                        $scope.entry.cancellable = true;
                        $rootScope.$broadcast("journal-entry-cancelled");           
                    })
            }
            // END: methods

        }
    ]
    ;

    return {
        restrict: "E",
        scope: {
            entry: "=", // :EntryViewModel
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
        "workshop.PouchDBTest.services.QuestService",
        "workshop.PouchDBTest.services.DBService",
        function($scope, $sanitize, JournalEntryFactory, 
            TaskFactory, QuestService, DBService){

            // fields
            $scope.writeLock = {writing: false};
            $scope.currentTaskSorting = "DATE_ASC";
            // END: fields

            // methods
            $scope.writeJournal = function(){
                var text = $sanitize('Lorem <a href="#">ipsum</a>');
                var entry = JournalEntryFactory._new(text, $scope.quest.data);
                var entry_viewmodel = new EntryViewModel(entry, true, true);
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

            // END: methods

            // events
            $scope.$on("journal-entry-cancelled", function(){
                $scope.quest.journal = $scope.quest.journal.filter(function(obj){
                    return !obj.cancellable;
                });
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

;