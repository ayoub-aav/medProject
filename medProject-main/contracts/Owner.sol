// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract Owner {
    address private owner;

    // Event to log ownership transfer
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Constructor sets the deployer as the initial owner
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // Modifier to restrict access to owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    // Function to get the current owner
    function getOwner() public view returns (address) {
        return owner;
    }

    // Function to transfer ownership to a new address
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    // Example function restricted to owner
    function restrictedFunction() public onlyOwner {
        // Add your owner-only logic here
    }
}