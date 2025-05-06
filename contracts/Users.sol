// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Users {
    address private owner;
    struct User {
        string name;
        string role;
        bool exists;
    }
    mapping(address => User) private users;
    address[] private userAddresses;

    // Events from Owner
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    // Events from Users
    event UserAdded(address indexed userAddress, string name, string role);
    event UserUpdated(address indexed userAddress, string name, string role);
    event UserRemoved(address indexed userAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier userExists(address userAddress) {
        require(users[userAddress].exists, "User does not exist");
        _;
    }

    modifier userDoesNotExist(address userAddress) {
        require(!users[userAddress].exists, "User already exists");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), owner);
        // Add deployer as admin user
        users[owner] = User("Admin", "admin", true);
        userAddresses.push(owner);
        emit UserAdded(owner, "Admin", "admin");
    }

    // Owner functions
    function getOwner() public view returns (address) {
        return owner;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function restrictedFunction() public onlyOwner {
        // Owner-only logic
    }

    // Users functions with access control
    function addUser(address userAddress, string memory name, string memory role) 
        public 
        onlyOwner
        userDoesNotExist(userAddress) 
    {
        users[userAddress] = User(name, role, true);
        userAddresses.push(userAddress);
        emit UserAdded(userAddress, name, role);
    }

    function getUser(address userAddress) 
        public 
        view 
        userExists(userAddress) 
        returns (string memory name, string memory role) 
    {
        User memory user = users[userAddress];
        return (user.name, user.role);
    }

    function doesUserExist(address userAddress) public view returns (bool) {
        return users[userAddress].exists;
    }

    function updateUser(address userAddress, string memory name, string memory role) 
        public 
        onlyOwner
        userExists(userAddress) 
    {
        users[userAddress].name = name;
        users[userAddress].role = role;
        emit UserUpdated(userAddress, name, role);
    }

    function removeUser(address userAddress) 
        public 
        onlyOwner
        userExists(userAddress) 
    {
        uint256 index;
        for (uint256 i = 0; i < userAddresses.length; i++) {
            if (userAddresses[i] == userAddress) {
                index = i;
                break;
            }
        }
        
        if (index < userAddresses.length - 1) {
            userAddresses[index] = userAddresses[userAddresses.length - 1];
        }
        userAddresses.pop();
        
        delete users[userAddress];
        emit UserRemoved(userAddress);
    }

    function getUserCount() public view returns (uint256) {
        return userAddresses.length;
    }

    function getAllUserAddresses() public view returns (address[] memory) {
        return userAddresses;
    }

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