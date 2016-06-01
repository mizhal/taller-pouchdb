angular.module("workshop.PouchDBTest.controllers", [])

.controller("workshop.PouchDBTest.controllers.MainController", 
[
	"$scope",
	"$rootScope",
	"$state",
	"workshop.PouchDBTest.services.QuestService",
	function($rootScope, $scope, $state, QuestService){

		// methods
		$scope.create = function(){
			$state.go("app.quest-edit");
		};

		$scope.updateQuests = function(){
			QuestService.all()
			.then(function(response){
				$scope.quests = [];
				response.rows.map(function(row){
					$scope.quests.push(row.doc);
				});
				$scope.$apply();
			})
			;
		};
		// END: methods

		// events
		$scope.$on("update-quests", $scope.updateQuests);
		// END: events

		// init
		$scope.updateQuests();
		// END: init
	}
])

.controller("workshop.PouchDBTest.controllers.EditController", 
[
	"$scope",
	"$rootScope",
	"workshop.PouchDBTest.services.QuestService",
	"workshop.PouchDBTest.services.QuestFactory",
	"$stateParams",
	"$state",
	function($scope, $rootScope, QuestService, QuestFactory, $stateParams, $state){
		// prep params
		if($stateParams.id){
			QuestService.get($stateParams.id).then(function(doc){
				$scope.quest = doc;
				$scope.$apply();
			});
		} else {
			$scope.quest = QuestFactory._new();
		}
		// END: prep params

		// methods
		$scope.save = function(event){
			event.preventDefault();
			QuestService.save($scope.quest)
				.then(function(doc){
					$rootScope.$broadcast("update-quests");
					$state.go("app.quest", {id: doc.id});
				})
			;
			
			return false;
		}
		// END: methods
	}
])

.controller("workshop.PouchDBTest.controllers.DetailController", 
[
	"$scope",
	"$rootScope",
	"workshop.PouchDBTest.services.QuestService",
	"$state",
	"$stateParams",
	function($scope, $rootScope, QuestService, $state, $stateParams){

		// init 
		if($stateParams.id) {
			QuestService.get($stateParams.id)
				.then(function(doc){
					$scope.quest = doc;
					$scope.$apply();
				})
				.catch(function(error){
					console.log(error);
					$state.go("app.quests");
				});
		}
		// END: init

		// methods
		$scope.edit = function() {
			$state.go("app.quest-edit", {id: $scope.quest._id});
		};

		$scope.delete = function() {
			QuestService.destroy($scope.quest)
				.then(function(){
					$rootScope.$broadcast("update-quests");
					$state.go("app.quests");		
				});
		}
		// END: methods

		// ViewModels
		function QuestViewModel(quest, journal_entries){
			this.data = quest;
			this.journal = journal_entries;
		}
		// END: ViewModels
		
	}
])

;