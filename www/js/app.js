var app = angular.module("workshop.PouchDBTest", [

	// libs
	"ui.router",
	"ngSanitize",
	// END: libs

	// app
	"workshop.PouchDBTest.controllers",
	"workshop.PouchDBTest.services",
	"workshop.PouchDBTest.directives",
	"workshop.PouchDBTest.filters",
	// END: app
])

/** ROUTES **/
.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider

	.state("app", {
		url: "/app",
		abstract: true,
		templateUrl: "templates/master-slave.html",
		controller: "workshop.PouchDBTest.controllers.MainController"
	})

	.state("app.quests", {
		url: "/quests",
		views: {
			"list": {
				templateUrl: "templates/list.html",
				controller: [
					"$scope", 
					"$stateParams", 
					"workshop.PouchDBTest.services.QuestService", 
					"$state",
					function($scope, $stateParams, QuestService, $state){
						QuestService.getFirstId()
							.then(function(id){
								if(id)
									$state.go("app.quest", {id: id});
							});
					}
				]
			},
			"detail": {
				template: "",
				controller: function(){}
			}
		}
	})	

	.state("app.quest", {
		url: "/quest/{id}",
		views: {
			"list": {
				templateUrl: "templates/list.html",
				controller: ["$scope", "$stateParams", function($scope, $stateParams){
					$scope.selected = $stateParams.id;
				}]
			},
			"detail": {
				templateUrl: "templates/detail.html",
				controller: "workshop.PouchDBTest.controllers.DetailController"
			}
		},
	})

	.state("app.quest-edit", {
		url: "/quest/edit/{id}",
		views: {
			"list": {
				templateUrl: "templates/list.html",
				controller: ["$scope", "$stateParams", function($scope, $stateParams){
					$scope.selected = $stateParams.id;
				}]
			},
			"detail": {
				templateUrl: "templates/edit.html",
				controller: "workshop.PouchDBTest.controllers.EditController"
			}
		},
	})
	
	;

	$urlRouterProvider.otherwise("/app/quests");
})
/** END: ROUTES **/
;