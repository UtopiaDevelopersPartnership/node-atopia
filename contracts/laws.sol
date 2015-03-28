//The Laws database contract.
contract LawsDb {

    struct Data {
        bytes32 creator;
        uint posX;
        uint posZ;
        uint radius;
        uint timeStamp;
    }

    // List element
 	struct Element {
 		bytes32 prev;
 		bytes32 next;
 		Data data;
 	}

	uint public size;
 	bytes32 public tail;
 	bytes32 public head;
    mapping (bytes32 => Element) list;

    // Add an element
	function _addElement(bytes32 creator, uint posX, uint posZ, uint radius) internal constant returns (bool result) {
        Element elem = list[creator];
        Data data = elem.data;
     	data.creator = creator;
     	data.posX = posX;
     	data.posZ = posZ;
     	data.radius = radius;
     	data.timeStamp = now;

     	// Two cases - empty or not.
     	if(size == 0){
     		tail = creator;
     		head = creator;
     	} else {
     		list[head].next = creator;
     		list[creator].prev = head;
     		head = creator;
     	}
     	size++;
        return true;
    }

    // Remove an element.
    function _removeElement(bytes32 creator) internal constant returns (bool result) {

       Element elem = list[creator];

     	if(size == 1){
     		tail = "";
     		head = "";
     	} else if (creator == head){
     		head = elem.prev;
     		list[head].next = "";
     	} else if(creator == tail){
     		tail = elem.next;
     		list[tail].prev = "";
     	} else {
     		bytes32 prevElem = elem.prev;
     		bytes32 nextElem = elem.next;
     		list[prevElem].next = nextElem;
     		list[nextElem].prev = prevElem;
     	}
     	size--;
     	delete list[creator];
     	return true;
	}

	// TODO Update to returning 'Element' instead later
	function getElement(bytes32 creatorIn) constant returns (bytes32 prev, bytes32 next, bytes32 creator, uint posX, uint posZ, uint radius, uint timeStamp) {

     	Element elem = list[creatorIn];
     	if(elem.data.creator == ""){
     		return;
     	}
     	prev = elem.prev;
     	next = elem.next;
     	creator = elem.data.creator;
     	posX = elem.data.posX;
     	posZ = elem.data.posZ;
     	radius = elem.data.radius;
     	timeStamp = elem.data.timeStamp;
	}

}

/// @title Laws
/// @author Andreas Olofsson
/// @notice This contract is used to register laws.
/// @dev Stores the laws as entries in a doubly linked list, so that
/// the list of elements can be gotten.
contract Laws is LawsDb {

 	address owner;

     // When adding a contract.
 	event AddLaw(bytes32 indexed creator, uint16 indexed code);
 	// When removing a contract.
 	event RemoveLaw(bytes32 indexed creator, uint16 indexed code);

    // Constructor
    function Laws(){
        owner = msg.sender;
    }

    /// @notice Add a contract to Doug. This contract should extend DougEnabled, because
    /// Doug will attempt to call 'setDougAddress' on that contract before allowing it
    /// to register. It will also ensure that the contract cannot be suicided by anyone
    /// other then Doug. Finally, Doug allows over-writing of previous contracts with
    /// the same name, thus you may replace contracts with new ones.
    /// @param name The bytes32 name of the contract.
    /// @param addr The address to the actual contract.
    /// @returns boolean showing if the adding succeeded or failed.
    function addLaw(bytes32 creator, uint posX, uint posZ, uint radius) constant returns (bool result) {
        if(msg.sender != owner){
            // Access denied.
            AddLaw(creator, 403);
            return false;
        }
        bytes32 lc = list[creator].data.creator;
        if(lc != "" && lc != creator){
            AddLaw(creator, 403);
            return false;
        }
        // Add to contract.
        bool ae = _addElement(creator,posX,posZ,radius);
        if (ae) {
            AddLaw(creator, 201);
        } else {
            // Can't overwrite.
            AddLaw(creator, 409);
        }
        return ae;
	}

    /// @notice Remove a contract from doug.
    /// @param name The bytes32 name of the contract.
    /// @returns boolean showing if the removal succeeded or failed.
    function removeLaw(bytes32 creator) constant returns (bool result) {
        if(msg.sender != owner){
            RemoveLaw(creator, 403);
            return false;
        }
        bool re = _removeElement(creator);
        if(re){
        	RemoveLaw(creator, 200);
        } else {
        	// Can't remove, it's already gone.
        	RemoveLaw(creator, 410);
        }
        return re;
    }

    /// @notice Gets a contract from Doug.
    /// @param name The bytes32 name of the contract.
    /// @returns The address of the contract. If no contract with that name exists, it will
    /// return zero.
    function getLaw(bytes32 creatorIn) returns (bytes32 creator, uint posX, uint posZ, uint radius, uint timeStamp){
    	Element elem = list[creatorIn];
    	if(elem.data.creator == ""){
    	    return;
    	}
    	creator = elem.data.creator;
    	posX = elem.data.posX;
    	posZ = elem.data.posZ;
    	radius = elem.data.radius;
    	timeStamp = elem.data.timeStamp;
    }

    /// @notice Remove (suicide) the contract.
    function remove(){
        if(msg.sender == owner){
            // Finally, remove doug. Doug will now have all the funds of the other contracts,
            // and when suiciding it will all go to the owner.
            suicide(owner);
        }
    }

}