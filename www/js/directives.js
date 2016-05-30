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

.directive("questDetail", function(){
	return {
		restrict: "E",
		scope: {
			quest: "="
		},
		replace: true,
		templateUrl: "directives/quest-detail.html"
	};
})

;