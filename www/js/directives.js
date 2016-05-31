angular.module("workshop.PouchDBTest.directives", [])

.directive("journalEntry", function(){
	return {
		restrict: "E",
		scope: {
			entry: "="
		},
		replace: true,
		templateUrl: "directives/journal-entry.html"
	};
})

.directive("journalEntryWriting", function(){
	return {
		restrict: "E",
		scope: {
			entry: "="
		},
		replace: true,
		templateUrl: "directives/journal-entry-writing.html"
	};
})

.directive("questDetail", function(){

	var controller = [ 
		"$scope",
		"$sanitize",
		"workshop.PouchDBTest.services.JournalEntryFactory",
		function($scope, $sanitize, JournalEntryFactory){

			$scope.writing = null;

			$scope.writeJournal = function(){
				var text = $sanitize('Lorem <a href="#">ipsum</a>');
				var entry = JournalEntryFactory._new(text, $scope.quest);
				$scope.writing = entry;
			}

			$scope.saveJournal = function(){
				$scope.quest.journal.unshift($scope.writing);
				$scope.writing = null;
			}

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