angular.module("workshop.PouchDBTest.filters", [])

.filter("uuidShortener", [
	"workshop.PouchDBTest.services.UUIDService",
	function(UUIDService){
		return function(long_uuid){
			if(!long_uuid)
				return;
			
			var parts = long_uuid.split("-");
			var integer = parseInt(parts.join(""), 16);
			var hashids = new Hashids(UUIDService.SALT, 0, "0123456789abcdef");
			return hashids.encode(integer);
		}
	}
])

;