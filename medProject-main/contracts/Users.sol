// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
contract Users {
    // User struct definition
    struct User {
        string name;
        string role;
        bool exists;
    }

    // Mapping from user address to User struct
    mapping(address => User) private users;
    
    // Array to keep track of all user addresses
    address[] private userAddresses;
    
    // Events
    event UserAdded(address indexed userAddress, string name, string role);
    event UserUpdated(address indexed userAddress, string name, string role);
    event UserRemoved(address indexed userAddress);
    
    // Modifiers
    modifier userExists(address userAddress) {
        require(users[userAddress].exists, "User does not exist");
        _;
    }
    
    modifier userDoesNotExist(address userAddress) {
        require(!users[userAddress].exists, "User already exists");
        _;
    }
    
    /**
     * @dev Add a new user to the contract
     * @param userAddress The address of the user
     * @param name The name of the user
     * @param role The role of the user
     */
    function addUser(address userAddress, string memory name, string memory role) 
        public 
        userDoesNotExist(userAddress) 
    {
        users[userAddress] = User(name, role, true);
        userAddresses.push(userAddress);
        
        emit UserAdded(userAddress, name, role);
    }
    
    /**
     * @dev Get user information by address
     * @param userAddress The address of the user to retrieve
     * @return name User's name
     * @return role User's role
     */
    function getUser(address userAddress) 
        public 
        view 
        userExists(userAddress) 
        returns (string memory name, string memory role) 
    {
        User memory user = users[userAddress];
        return (user.name, user.role);
    }
    
    /**
     * @dev Check if a user exists
     * @param userAddress The address to check
     * @return True if the user exists, false otherwise
     */
    function doesUserExist(address userAddress) public view returns (bool) {
        return users[userAddress].exists;
    }
    
    /**
     * @dev Update an existing user's information
     * @param userAddress The address of the user
     * @param name The new name of the user
     * @param role The new role of the user
     */
    function updateUser(address userAddress, string memory name, string memory role) 
        public 
        userExists(userAddress) 
    {
        users[userAddress].name = name;
        users[userAddress].role = role;
        
        emit UserUpdated(userAddress, name, role);
    }
    
    /**
     * @dev Remove a user from the contract
     * @param userAddress The address of the user to remove
     */
    function removeUser(address userAddress) 
        public 
        userExists(userAddress) 
    {
        // Find the index of the user address in the array
        uint256 index;
        for (uint256 i = 0; i < userAddresses.length; i++) {
            if (userAddresses[i] == userAddress) {
                index = i;
                break;
            }
        }
        
        // Remove the user address from the array by swapping with the last element and popping
        if (index < userAddresses.length - 1) {
            userAddresses[index] = userAddresses[userAddresses.length - 1];
        }
        userAddresses.pop();
        
        // Delete the user from the mapping
        delete users[userAddress];
        
        emit UserRemoved(userAddress);
    }
    
    /**
     * @dev Get the total number of users
     * @return The total number of users
     */
    function getUserCount() public view returns (uint256) {
        return userAddresses.length;
    }
    
    /**
     * @dev Get all user addresses
     * @return Array of all user addresses
     */
    function getAllUserAddresses() public view returns (address[] memory) {
        return userAddresses;
    }
    
    /**
     * @dev Get user by index in the array
     * @param index The index of the user
     * @return userAddress The address of the user
     * @return name The name of the user
     * @return role The role of the user
     */
    function getUserByIndex(uint256 index) 
        public 
        view 
        returns (address userAddress, string memory name, string memory role) 
    {
        require(index < userAddresses.length, "Index out of bounds");
        
        userAddress = userAddresses[index];
        User memory user = users[userAddress];
        
        return (userAddress, user.name, user.role);
    }
}