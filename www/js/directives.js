angular.module("workshop.PouchDBTest.directives", [])

.directive("journalEntry", function(){

    var controller = [
        "$scope",
        "workshop.PouchDBTest.services.DBService",
        function($scope, DBService){

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
                        $scope.writeLock.writing = false;
                        $scope.$apply();
                    })
                    ;
            }
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
        function($scope, $sanitize, JournalEntryFactory){

            // fields
            $scope.writeLock = {writing: false};
            // END: fields

            // methods
            $scope.writeJournal = function(){
                var text = $sanitize('Lorem <a href="#">ipsum</a>');
                var entry = JournalEntryFactory._new(text, $scope.quest);
                var entry_viewmodel = new EntryViewModel(entry, true);
                $scope.quest.journal.unshift(entry_viewmodel);
                $scope.writeLock.writing = true;
            }
            // END: methods
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

;