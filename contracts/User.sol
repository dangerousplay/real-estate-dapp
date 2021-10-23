// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./validations.sol";


struct User {
    string name;
    string cellphone;
    string email;
}

enum  UserStatus {
    REGISTERED, PENDING, NOT_FOUND
}


contract UserManagement is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    using Validations for *;

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    User private DEPLOYER_USER = User("DEPLOYER", "DEPLOYER", "DEPLOYER");

    mapping (address => User) private registered;
    mapping (address => User) private pending;

    event UserRegistered(address indexed userAddress, User user);
    event UserApproved(address indexed userAddress);
    event UserDenied(address indexed userAddress);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() initializer public {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(UPGRADER_ROLE, msg.sender);
        _setupRole(APPROVER_ROLE, msg.sender);

        registered[msg.sender] = DEPLOYER_USER;
    }

    function _getUserStatus(address user) private view returns (UserStatus) {
        if (registered[user].name.isNotEmpty())
            return UserStatus.REGISTERED;

        if (pending[user].name.isNotEmpty())
            return UserStatus.PENDING;

        return UserStatus.NOT_FOUND;
    }

    function getUserStatus(address user) external view returns (UserStatus) {
        return _getUserStatus(user);
    }

    function register(User memory user) public {
        UserStatus userStatus = _getUserStatus(msg.sender);

        require(userStatus == UserStatus.NOT_FOUND, "User already exists");

        pending[msg.sender] = user;

        emit UserRegistered(msg.sender, user);
    }

    function validateUser(User memory user) private pure {
        user.name.validateNotEmpty("User name is empty");
        user.cellphone.validateNotEmpty("User cellphone is empty");
        user.email.validateNotEmpty("User email is empty");
    }

    function approve(address userAddress) public onlyRole(APPROVER_ROLE) {
        User memory userToApprove = getUser(userAddress, pending);

        delete pending[userAddress];
        registered[userAddress] = userToApprove;

        emit UserApproved(userAddress);
    }

    function denyUser(address userAddress) public onlyRole(APPROVER_ROLE) {
        User memory user = getUser(userAddress, pending);

        delete pending[userAddress];

        emit UserDenied(userAddress);
    }

    function getUser(address userAddress, mapping (address => User) storage users)
    private view returns (User memory) {
        User memory user = users[userAddress];

        require(user.name.isEmpty(), "User not found");

        return user;
    }

    function user(address user) public view returns(User memory) {
        require(user == msg.sender, "You can only see your profile");

        return registered[user];
    }

    function _authorizeUpgrade(address newImplementation)
    internal
    onlyRole(UPGRADER_ROLE)
    override
    {}
}