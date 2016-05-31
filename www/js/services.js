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
		this._new = function(name, deadline, desc){

			// 
			var proto = HasTimestampFactory._new();
			// 
			
			// fields
			proto.type = "Quest";
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
		this._new = function(text, parent_object) {
			var proto = HasTimestampFactory._new();
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

	}
])

;