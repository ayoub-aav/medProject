// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
contract Test {
    uint256 private count;
    
    event CountIncremented(uint256 newCount, uint256 timestamp);

    constructor() {
        count = 0;
    }

    function increment() public {
        count += 3;
        emit CountIncremented(count, block.timestamp);
    }

    function getCount() public view returns (uint256) {
        return count;
    }
}