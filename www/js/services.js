angular.module("workshop.PouchDBTest.services", [])

.service("workshop.PouchDBTest.services.DBService", 
[
	"$q",
	function($q){
		var self = this;
		this.Pouch = new PouchDB("test"); // size limits ignored as of now for sanity sake

		this.save = function(object) {
			object.updated_at = new Date();
			return self.Pouch.put(object)
				.then(function(docsum){
					object._rev = docsum.rev;
					return docsum;
				});
		};

		this.get = function(_id){
			return self.Pouch.get(_id);
		};

		this.queryView = function(view, options){
			options = options || {};
			return self.Pouch.query(view, options);
		}

		this.mapRedios = function(mapredios){
			return self.Pouch.query(mapredios);
		}

		this.destroy = function(object){
			return self.Pouch.remove(object);
		};
	}
])

.service("workshop.PouchDBTest.services.UUIDService", 
[
	function(){
		/*** Attribution: http://codepen.io/Jvsierra/pen/BNbEjW ***/
		this.generate = function () {
		  function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000)
		      .toString(16)
		      .substring(1);
		  }
		  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		    s4() + '-' + s4() + s4() + s4();
		}
	}
])

.service("workshop.PouchDBTest.services.HasTimestampFactory", 
[
	"workshop.PouchDBTest.services.UUIDService",
	function(UUIDService){
		this._new = function(){
			return {
				uuid: UUIDService.generate(),
				created_at: new Date(),
				updated_at: new Date()
			};
		}
	}
])

.service("workshop.PouchDBTest.services.QuestFactory", 
[
	"workshop.PouchDBTest.services.HasTimestampFactory",
	"workshop.PouchDBTest.services.JournalEntryFactory",
	function(HasTimestampFactory, JournalEntryFactory){
		var self = this;
		this.type = "Quest";

		this._new = function(name, deadline, desc){
			// 
			var proto = HasTimestampFactory._new();
			// 
			
			// fields
			proto.type = self.type;
			proto._id = "Quest#" + proto.uuid;
			proto.name = name;
			proto.deadline = deadline;
			proto.desc = desc;
			proto.journal = [];
			// END: fields

			return proto;
		}
	}
])

.service("workshop.PouchDBTest.services.JournalEntryFactory", 
[
	"workshop.PouchDBTest.services.HasTimestampFactory",
	function(HasTimestampFactory){
		var self = this;
		this.type = "JournalEntry";

		this._new = function(text, parent_object) {
			var proto = HasTimestampFactory._new();
			proto.type = self.type;
			proto._id = "JournalEntry#" + proto.uuid;
			proto.text = text;
			proto.parent = parent_object._id;

			return proto;
		}
	}
])

// If I want to avoid to rely in meta-witchcraft to make
// DB service take into account dependent object models like
// Rails ActiveRecord, I should use another layer, a service
// layer, to process data objects before sending them to the 
// database.
// I think this could be verbose sometimes but keeps things simple
// and keeps reflection-witchcraft at bay.
.service("workshop.PouchDBTest.services.QuestService",
[
	"workshop.PouchDBTest.services.DBService",
	"workshop.PouchDBTest.services.QuestFactory",
	"workshop.PouchDBTest.services.JournalEntryFactory",
	function(DBService, QuestFactory, JournalEntryFactory){
		var self = this;

		this.constants = {
			DISCRIMINATOR: 1
		};

		/** PUBLIC **/
		this.get = function(_id){
			return DBService.get(_id);
		}

		this.all = function(offset, limit){
			return DBService.Pouch.allDocs(
				{
					include_docs: true,
		            startkey: "Quest#",
		            endkey: "Quest#\uffff"
				}
			);
		}

		this.getWithJournalEntries = function(_id, how_many_entries){
			return DBService.queryView("quest_with_entries/by_date",
				{
					endkey: [_id], startkey: [_id, {}, {}],
					descending: true,
				})
			 	.then(function(res){
			 		var entries = [];
			 		var object = null;
			 		for(var i in res.rows){
			 			var row = res.rows[i];
			 			if(row.key[self.constants.DISCRIMINATOR] == QuestFactory.type){
			 				object = row.value;
			 			} 
			 			else if (row.key[self.constants.DISCRIMINATOR] == JournalEntryFactory.type)
			 			{
			 				entries.push(row.value);
			 			}
			 		}
			 		object.journal = entries;
			 		return object;
				})
				.catch(function(error){
					return;
				});
		}

		this.save = function(quest){
			return DBService.save(quest);
		}

		this.destroy = function(quest){
			return DBService.destroy(quest)
				// :dependent => :destroy
				.then(function(doc){
					for(var i in quest.journal){
						DBService.destroy(quest.journal[i].data);
					}
				});
		}
		/** END: PUBLIC **/

		/** PRIVATE **/
		var CheckDBViews = function(){
			for(var i in self.views){
				DBService.get(self.views[i]._id)
					.catch(function(error){
						DBService.save(self.views[i]);
					});
			}
		}
		/** END: PRIVATE **/

		/** VIEWS & INDICES **/
		this.views = {};
		this.views.quest_with_entries = {
			_id: "_design/quest_with_entries",
			views: {
				by_date: {
					map: function(doc) {
						if(doc.type == "$$1")
							emit([doc._id, doc.type, 0], doc);
						else if (doc.type == "$$2")
							emit([doc.parent, doc.type, doc.created_at], doc);
					}.toString()
						.replace("$$1", QuestFactory.type)
						.replace("$$2", JournalEntryFactory.type)
				}
			}
		};
		/** END: VIEWS & INDICES **/


		/** init **/
		CheckDBViews();
		/** END: init **/

	}
])

;