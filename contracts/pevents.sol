/// @title PlayerEvents
/// @author Andreas Olofsson
/// @notice This contract is used to register player events on the blockchain, and to get them.
contract PlayerEvents {

    struct EventData {
        bytes32 userName;
        bytes32 eventType;
        uint timeStamp;
    }

    address owner;
    EventData[] eventLog;

    // When adding a contract.
    event EventRegistered(bytes32 indexed userName, bytes32 indexed eventType, uint16 indexed code);

    // Constructor
    function PlayerEvents(){
        owner = msg.sender;
    }

    /// @notice Add an event.
    /// @param userName The user name.
    /// @param eventType The event type.
    /// @returns boolean showing if the registration succeeded or failed.
    function register(bytes32 userName, bytes32 eventType) constant returns (bool result) {

        // Only the owner may add, and the contract has to be DougEnabled and
        // return true when setting the Doug address.
        if(msg.sender != owner){
            EventRegistered(userName, eventType, 403);
            return false;
        }

        EventData data = eventLog[eventLog.length];
        data.userName = userName;
        data.eventType = eventType;
        data.timeStamp = now;
        EventRegistered(userName, eventType, 201);
        return true;
    }

    /// @notice Remove (suicide) the player events contract.
    function remove(){
        if(msg.sender == owner){
            suicide(owner);
        }
    }

    /// @notice Get the log entry at 'index'. Will return empty values if index is out of
    /// bounds.
    function getLogEntry(uint index) constant returns (bytes32 userName, bytes32 eventType, uint timeStamp){
        if(eventLog.length <= index){
            return;
        }
        EventData data = eventLog[index];
        userName = data.userName;
        eventType = data.eventType;
        timeStamp = data.timeStamp;
        return;
    }

    /// @notice Get the size of the events list.
    function getLogSize() constant returns (uint logSize){
        return eventLog.length;
    }

}