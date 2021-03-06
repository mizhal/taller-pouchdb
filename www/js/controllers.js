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
			$state.go("app.quest.edit");
		};

		$scope.updateQuests = function(){
			QuestService.all("DATE_ASC")
			.then(function(response){
				$scope.quests = [];
				response.map(function(row){
					$scope.quests.push(row);
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
					$state.go("app.quest.detail", {id: doc.id});
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

		// methods
		$scope.load = function(id){
			QuestService.getWithDependentObjects(id, "DATE_ASC")
				.then(function(doc){
					if (!doc) {
						console.log("Error recovering document: " + id);
						$state.go("app.quest.list");
					}
					$scope.quest = new QuestViewModel(doc, doc.journal);
					$scope.$apply();
				})
				.catch(function(error){
					$state.go("app.quest.list");
				});
		}

		$scope.edit = function() {
			$state.go("app.quest.edit", {id: $scope.quest.data._id});
		};

		$scope.delete = function() {
			QuestService.destroy($scope.quest.data)
				.then(function(){
					$rootScope.$broadcast("update-quests");
					$state.go("app.quest.list");		
				});
		}
		// END: methods

		// events
		$scope.$on("quest-reload", function(){
			$scope.load($stateParams.id);
		});
		// END: events

		// init 
		if($stateParams.id) {
			$scope.load($stateParams.id);
		}
		// END: init
	}
])

;