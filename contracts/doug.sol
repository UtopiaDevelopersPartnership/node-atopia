contract DougEnabled {
    function setDougAddress(address dougAddr) returns (bool result){}
    function remove(){}
}

//The Doug database contract.
contract DougDb {

     // List element
 	struct Element {
 		bytes32 prev;
 		bytes32 next;
 		// Data
 		bytes32 contractName;
 		address contractAddress;
 	}

	uint public size;
 	bytes32 public tail;
 	bytes32 public head;
    mapping (bytes32 => Element) list;

	// Add a new contract. This will overwrite an existing contract. 'internal' modifier means
	// it has to be called by an implementing class.
	function _addElement(bytes32 name, address addr) internal constant returns (bool result) {
        Element elem = list[name];

     	elem.contractName = name;
     	elem.contractAddress = addr;

     	// Two cases - empty or not.
     	if(size == 0){
     		tail = name;
     		head = name;
     	} else {
     		list[head].next = name;
     		list[name].prev = head;
     		head = name;
     	}
     	size++;
        return true;
    }

    // Remove a contract from Doug (we could also suicide the contract if we want to).
    function _removeElement(bytes32 name) internal constant returns (bool result) {

       Element elem = list[name];
     	if(elem.contractName == ""){
     		return false;
     	}

     	if(size == 1){
     		tail = "";
     		head = "";
     	} else if (name == head){
     		head = elem.prev;
     		list[head].next = "";
     	} else if(name == tail){
     		tail = elem.next;
     		list[tail].prev = "";
     	} else {
     		bytes32 prevElem = elem.prev;
     		bytes32 nextElem = elem.next;
     		list[prevElem].next = nextElem;
     		list[nextElem].prev = prevElem;
     	}
     	size--;
     	delete list[name];
     	return true;
	}

	// Should be safe to update to returning 'Element' instead
	function getElement(bytes32 name) constant returns (bytes32 prev, bytes32 next, bytes32 contractName, address contractAddress) {

     	Element elem = list[name];
     	if(elem.contractName == ""){
     		return;
     	}
     	prev = elem.prev;
     	next = elem.next;
     	contractName = elem.contractName;
     	contractAddress = elem.contractAddress;
	}

}


/// @title DOUG
/// @author Andreas Olofsson
/// @notice This contract is used to register other contracts by name.
/// @dev Stores the contracts as entries in a doubly linked list, so that
/// the list of elements can be gotten.
contract Doug is DougDb {

 	address owner;

     // When adding a contract.
 	event AddContract(address indexed caller, bytes32 indexed name, uint16 indexed code);
 	// When removing a contract.
 	event RemoveContract(address indexed caller, bytes32 indexed name, uint16 indexed code);

    // Constructor
    function Doug(){
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
    function addContract(bytes32 name, address addr) constant returns (bool result) {
       // Only the owner may add, and the contract has to be DougEnabled and
       // return true when setting the Doug address.
		if(msg.sender != owner || !DougEnabled(addr).setDougAddress(address(this))){
			// Access denied. Should divide these up into two maybe.
			AddContract(msg.sender, name, 403);
			return false;
		}
       // Add to contract.
       bool ae = _addElement(name, addr);
       if (ae) {
        	AddContract(msg.sender, name, 201);
       } else {
       		// Can't overwrite.
       		AddContract(msg.sender, name, 409);
       }
       return ae;
	}

    /// @notice Remove a contract from doug.
    /// @param name The bytes32 name of the contract.
    /// @returns boolean showing if the removal succeeded or failed.
    function removeContract(bytes32 name) constant returns (bool result) {
        if(msg.sender != owner){
            RemoveContract(msg.sender, name, 403);
            return false;
        }
        bool re = _removeElement(name);
        if(re){
        	RemoveContract(msg.sender, name, 200);
        } else {
        	// Can't remove, it's already gone.
        	RemoveContract(msg.sender, name, 410);
        }
        return re;
    }

    /// @notice Gets a contract from Doug.
    /// @param name The bytes32 name of the contract.
    /// @returns The address of the contract. If no contract with that name exists, it will
    /// return zero.
    function contracts(bytes32 name) returns (address addr){
    	return list[name].contractAddress;
    }

    /// @notice Remove (suicide) Doug.
    function remove(){
        if(msg.sender == owner){
            // Finally, remove doug. Doug will now have all the funds of the other contracts,
            // and when suiciding it will all go to the owner.
            suicide(owner);
        }
    }

}