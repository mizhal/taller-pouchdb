angular.module("workshop.PouchDBTest.services", [])

/** INTERFACES **
interfaces are not supported by javascript or angular, but they are very useful
to check/document capabilities expected from parameters of methods and functions

interface IFile {
	name: string;
	content_type: string;
	data: stringBuffer;
}

interface IDocument {
	_id: string;
	_rev: string;
	updated_at: timestamp;
	created_at: timestamp;
}

** END: INTERFACES **/

.service("workshop.PouchDBTest.services.DBService", 
[
	"$q",
	function($q){
		var self = this;

		this.dbname = "test";

		/** SORTING PROTOCOL **/
		this.sort_criteria = {
			DATE_DESC: "DATE_DESC",
			DATE_ASC: "DATE_ASC",
			NAME_DESC: "NAME_DESC",
			NAME_ASC: "NAME_ASC",
			LAST_JOURNAL_DESC: "LAST_JOURNAL_DESC",
			UPDATED_DESC: "UPDATED_DESC"
		}

		this.prepareSortParams = function(_id, sort_criteria, sort_criteria_params){
			var params_lambda = sort_criteria_params[sort_criteria];
			if(params_lambda)
				return params_lambda(_id)
			else 
				throw "sort criterium " + sort_criteria + " not supported";
		}
		/** END: SORTING PROTOCOL **/

		this.Pouch = new PouchDB(this.dbname); // size limits ignored as of now for sanity sake

		this.save = function(object /* :IDocument */) {
			object.updated_at = new Date();
			return self.Pouch.put(object)
				.then(function(docsum){
					object._rev = docsum.rev;
					return docsum;
				});
		}

		this.get = function(_id){
			return self.Pouch.get(_id, {attachments: true});
		}

		this.queryView = function(view, options){
			options = options || {};
			return self.Pouch.query(view, options);
		}

		this.mapRedios = function(mapredios){
			return self.Pouch.query(mapredios);
		}

		this.destroy = function(object /* :IDocument */){
			return self.Pouch.remove(object._id, object._rev);
		}

		this.destroyIds = function(id, rev){
			return self.Pouch.remove(id, rev);
		}

		this.attach = function(document /* :IDocument */, file_object /* :IFile */) {
			return self.save(document).then(function(){
				return self.Pouch.putAttachment(
						document._id, file_object.uuid, document._rev,
						file_object.data, file_object.content_type
					).then(function(doc){
						document._rev = doc.rev;
					})			
				})
		}

		this.detach = function(id, rev, file_object /* :IFile */){
			return self.Pouch.removeAttachment(id, file_object.name, rev);
		}

		this.clear = function(){
			return self.Pouch.allDocs()
				.then(function(result){
						var rows = result.rows.filter(function(row){
							return row.id.indexOf("_design/") != 0;
						})
						var promises = rows.map(function(row){
							return self.destroyIds(row.id, row.value.rev);
						})

						return Promise.all(promises).then(function() { return; })
					}
				)
		}

		this.sync = function(syncable_node, unlock_pin) {

		}

		this.checkDBViews = function(views){
			for(var i in views){
				self.save(views[i])
					.catch(function(error){
						if(error.name != "conflict")
						{
							console.log(error);
						} // else: conflict means view already exists
					});
			}
		}
	}
])

.service("workshop.PouchDBTest.services.UUIDService", 
[
	function(){
		var self = this;

		self.SALT = "5iuHO5DP0ygXYvXLCvM-A0@fN0Bs-Bpwr9-(2Tzb";

		/*** Attribution: http://codepen.io/Jvsierra/pen/BNbEjW ***/
		this.generate = function () {
		  function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000)
		      .toString(16)
		      .substring(1);
		  }
		  return [s4() + s4(), 
		  	s4(), s4(), s4(), 
		    s4() + s4() + s4()];
		}

		this.longUuid = function(){
			var parts = self.generate();
			return parts.join("-");
		}

		/**
			Long UUIDs are presented as base-16 (hex) encoded integers, thus tend to 
			be long an unmanageable as references (for example for copying in a 
			paper notebook). If we re-encode the integer using an alphabet with more
			characters, we could obtain a shorter string. Hashids library encodes
			integers using an alphabet of 62 characters (thus base-62) as we wanted.
			
			The process has no collisions (two long uuids generating the same short
			uuid), because it is only a translation and not a hashing function.  
		**/
		this.shortUuid = function(long_uuid){
			var parts = long_uuid.split("-");
			var integer = parseInt(parts.join(""), 16);

			var hashids = new Hashids(self.SALT, 0, "0123456789abcdef");

			return hashids.encode(integer);
		}
	}
])


/** Factories manage creation of pouchdb-compatible objects.
They also provide a simple inheritance mechanism (invoking "parent" factories)
and should keep all class-metadata that is usually got by using language reflection,
this give us freedom to use all metadata we need to recognize classes and properties
and adjust program behavior to them. 
**/
.service("workshop.PouchDBTest.services.HasTimestampFactory", 
[
	"workshop.PouchDBTest.services.UUIDService",
	function(UUIDService){
		this._new = function(){
			var uuid = UUIDService.longUuid()
			return {
				uuid: uuid,
				shortUuid: UUIDService.shortUuid(uuid),
				created_at: (new Date()).toISOString(),
				updated_at: (new Date()).toISOString()
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
			proto.tasks = []; // nested
			proto.files = [];
			proto.references = [];
			proto.reference_ids = []; // nested
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
		this.administrativeTypes = {
			USER: "USER",
			LOG: "LOG"
		}

		this._new = function(text, parent_object) {
			var proto = HasTimestampFactory._new();
			proto.type = self.type;
			proto.administrativeType = self.administrativeTypes.USER;
			proto._id = "JournalEntry#" + proto.uuid;
			proto.text = text;
			proto.parent = parent_object._id;

			return proto;
		}
	}
])

.service("workshop.PouchDBTest.services.TaskFactory", 
[
	"workshop.PouchDBTest.services.HasTimestampFactory",
	function(HasTimestampFactory){
		var self = this;
		this.type = "Task";
		this.statuses = {
			TODO: "TODO",
			DONE: "DONE",
			NEXT: "NEXT",
			DELEGATED: "DELEGATED"
		}

		this._new = function(name, parent_quest){
			var proto = HasTimestampFactory._new();
			proto.type = self.type;
			proto.parent = parent_quest._id;
			proto.name = name;
			proto.status = self.statuses.TODO;
			proto.done_datetime = null;
			proto.delegated_to_contact_id = null;
			proto.explanations_notes = null;

			return proto;
		}
	}
])

.service("workshop.PouchDBTest.services.ReferenceFactory", 
[
	"workshop.PouchDBTest.services.HasTimestampFactory",
	function(HasTimestampFactory) {
		var self = this;
		this.type = "Reference";

		this._new = function(name, link){
			var proto = HasTimestampFactory._new();

			proto.type = self.type;
			proto._id = self.type + "#" + proto.uuid;
			proto.name = name;
			proto.link = link;

			return proto;
		}
	}
])

.service("workshop.PouchDBTest.services.FileFactory", 
[
	"workshop.PouchDBTest.services.HasTimestampFactory",
	function(HasTimestampFactory){
		var self = this;
		this.type = "File"; /** :IFile **/

		this._new = function(name){
			var proto = HasTimestampFactory._new();

			// fields
			proto.type = self.type;
			proto._id = self.type + proto.uuid;
			proto.name = name;
			proto.data = null;
			proto.content_type = null;
			proto.filename = null;
			// END: fields

			return proto;
		}
	}
])

.service("workshop.PouchDBTest.services.SyncableNodeFactory", [
	"workshop.PouchDBTest.services.HasTimestampFactory",
	function(HasTimestampFactory){
		var self = this;
		this.type = "SyncableNode";

		this._new = function(name){
			var proto = HasTimestampFactory._new();

			// fields
			proto.type = self.type;
			proto._id = self.type + proto.uuid;
			proto.name = name;
			proto.crypted_credentials = null;
			proto.url = null;
			proto.is_live = false;
			proto.last_time_sinced = null;
			proto.last_time_failed_msg = null;
			proto.sync_log = [];
			proto.is_locked = false;
			// END: fields

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
	"workshop.PouchDBTest.services.ReferenceFactory",
	function(DBService, QuestFactory, JournalEntryFactory, ReferenceFactory){
		var self = this;

		this.constants = {
			DISCRIMINATOR: 1
		};

		/** SORTING PROTOCOL **/

		/** params are parameterized (mindblow!), so they should be 
			enclosed inside lambda-functions **/
		this.sort_criteria_params_for_journal = {
			DATE_DESC: function(_id){
				return {
					include_docs: true,
					endkey: [_id], startkey: [_id, {}, {}],
					descending: true,
				}
			},
			DATE_ASC: function(_id) { 
				return {
					include_docs: true,
					startkey: [_id], endkey: [_id, {}, {}],
					descending: false,
				}
			}
		}

		this.sort_criteria_views_for_journal = {
			DATE_ASC: "quest_with_entries/by_date",
			DATE_DESC: "quest_with_entries/by_date"
		}

		this.sort_criteria_params_for_quests = {
			DATE_DESC: function(){
				return {
					include_docs: true,
					descending: true,
				}
			},
			DATE_ASC: function() { 
				return {
					include_docs: true,
					descending: false,
				}
			}
		}

		this.sort_criteria_views_for_quests = {
			DATE_ASC: "quests_all/by_date",
			DATE_DESC: "quests_all/by_date"
		}
		/** END: SORTING PROTOCOL **/


		/** PUBLIC **/
		this.get = function(_id){
			return DBService.get(_id);
		}

		this.all = function(sort_criteria, offset, limit){

			var sort_params = DBService.prepareSortParams(
				null, 
				sort_criteria,
				self.sort_criteria_params_for_quests
			);
			var sort_view = self.sort_criteria_views_for_quests[sort_criteria];

			return DBService.queryView(sort_view, sort_params)
				.then(function(response){
					return response.rows.map(function(res){
						return res.doc;
					});
				});
		}

		this.getFirstId = function(){
			return DBService.Pouch.allDocs(
					{
		            	startkey: "Quest#",
		            	endkey: "Quest#\uffff",
		            	limit: 1
					}
				).then(function(doc){
					if(doc.rows.length > 0)
						return doc.rows[0].id;
					else return null;
				})
		}

		this.getWithDependentObjects = function(_id, sort_criteria){

			sort_criteria = sort_criteria || "DATE_DESC";

			var sort_params = DBService.prepareSortParams(
				_id, 
				sort_criteria,
				self.sort_criteria_params_for_journal
			);
			var sort_view = self.sort_criteria_views_for_journal[sort_criteria];

			return DBService.queryView(sort_view, sort_params)
			 	.then(function(res){
			 		var entries = [];
			 		var references = [];
			 		var object = {};

			 		for(var i in res.rows){
			 			var row = res.rows[i];
			 			if(row.key[self.constants.DISCRIMINATOR] == QuestFactory.type)
			 				object = row.doc;
			 			else if (row.key[self.constants.DISCRIMINATOR] == JournalEntryFactory.type)
			 				entries.push(row.doc);
			 			else if (row.key[self.constants.DISCRIMINATOR] == ReferenceFactory.type)
			 				references.push(row.doc);
			 		}
			 		object.journal = entries;
			 		object.references = references;

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
		/** END: PRIVATE **/

		/** VIEWS & INDICES **/
		this.views = {};
		this.views.quest_with_entries = {
			_id: "_design/quest_with_entries",
			views: {
				by_date: {
					map: function(doc) {
						if(doc.type == "$$1") {
							emit([doc._id, doc.type, 0]);
							// linked documents: the references
							for(var index = 0; index < doc.reference_ids.length; index++){
								emit(
									[doc._id, "$$3", index + 1], 
									{_id: doc.reference_ids[index]}
								);
							}
						}
						else if (doc.type == "$$2")
							emit([doc.parent, doc.type, doc.created_at]);
					}.toString()
						.replace("$$1", QuestFactory.type)
						.replace("$$2", JournalEntryFactory.type)
						.replace("$$3", ReferenceFactory.type)
				}
			}
		}

		this.views.quests_all = {
			_id: "_design/quests_all",
			views: {
				by_date: {
					map: function(doc){
						if(doc.type == "$$1")
							emit(doc.created_at);
					}.toString()
						.replace("$$1", QuestFactory.type)
				}
			}
		}
		/** END: VIEWS & INDICES **/


		/** init **/
		DBService.checkDBViews(this.views);
		/** END: init **/

	}
])

.service("workshop.PouchDBTest.services.SyncableNodeService", 
[
	"workshop.PouchDBTest.services.DBService",
	function(DBService){
		var self = this;

		// PUBLIC

		this.setPin = function(pin){
			SetPin(pin);
		}

		this.lockNode = function(syncable_node, lock_pin){
			var data = JSON.stringify({user: syncable_node.user, password: syncable_node.password})
			syncable_node.crypted_credentials = asmCrypto.bytes_to_hex(
				asmCrypto.AES_CBC.encrypt(data, lock_pin)
			);
			delete syncable_node.user;
			delete syncable_node.password;
			syncable_node.is_locked = true;
		}

		this.unlockNode = function(syncable_node, unlock_pin){
			var bytes = asmCrypto.hex_to_bytes(
				syncable_node.crypted_credentials
			)
			var user_pass = asmCrypto.bytes_to_string(asmCrypto.AES_CBC.decrypt(bytes, unlock_pin));
			var data = JSON.parse(user_pass);

			syncable_node.user = data.user;
			syncable_node.password = data.password;

			syncable_node.is_locked = false;
		}

		this.save = function(syncable_node){
			Lock(syncable_node);

			return DBService.save(syncable_node);
		}

		this.get = function(_id){
			return DBService.get(_id).then(function(doc){
				Unlock(doc);
				return doc;
			})
		}

		// END: PUBLIC

		// PRIVATE 

		var pin;

		function Lock(syncable_node){
			if(!syncable_node.is_locked)
				self.lockNode(syncable_node, pin);			
		}

		function Unlock(syncable_node){
			self.unlockNode(syncable_node, pin);
		}

		function SetPin(p){pin = p + "$$$233422$$$";}

		// END: PRIVATE
	}
])

;