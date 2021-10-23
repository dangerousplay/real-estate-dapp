// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

library Validations {

    function validateNotEmpty(string memory self, string memory message) internal pure {
        require(isNotEmpty(self), message);
    }

    function isEmpty(string memory self) internal pure returns(bool) {
        return bytes(self).length < 1;
    }

    function isNotEmpty(string memory self) internal pure returns(bool) {
        return !isEmpty(self);
    }

}