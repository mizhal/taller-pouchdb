String.prototype.startsWith = function(prefix){
	if(prefix.length > this.length)
		return false;
	
	for(var i = 0; i < prefix.length; i++)
		if(prefix[i] != this[i])
			return false;
	
	return true;
}