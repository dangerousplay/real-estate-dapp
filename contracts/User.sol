
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";


struct User {
    string name;
    string cellphone;
    string email;
}

enum  UserStatus {
    REGISTERED, PENDING, NOT_FOUND
}


contract UserManagement is Initializable, AccessControlUpgradeable, UUPSUpgradeable {

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    User private DEPLOYER_USER = User("DEPLOYER", "DEPLOYER", "DEPLOYER");

    mapping (address => User) private registered;
    mapping (address => User) private pending;

    error ValidationFailed(string message);
    error UserAlreadyExist(UserStatus status);
    event UserRegistered(address indexed userAddress, User user);
    event UserDenied(address indexed userAddress, User user);

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
        if (bytes(registered[user].name).length > 0)
            return UserStatus.REGISTERED;

        if (bytes(pending[user].name).length > 0)
            return UserStatus.PENDING;

        return UserStatus.NOT_FOUND;
    }

    function getUserStatus(address user) external view returns (UserStatus) {
        return _getUserStatus(user);
    }

    function register(User memory user) public {
        UserStatus userStatus = _getUserStatus(msg.sender);

        if(userStatus != UserStatus.NOT_FOUND)
          revert UserAlreadyExist(userStatus);

        pending[msg.sender] = user;
    }

    function validateUser(User memory user) private pure {
        if (bytes(user.name).length < 1)
           revert ValidationFailed("User name is empty");

        if (bytes(user.cellphone).length < 1)
           revert ValidationFailed("User cellphone is empty");

        if (bytes(user.email).length < 1)
            revert ValidationFailed("User email is empty");
    }

    function approve(address userAddress) public onlyRole(APPROVER_ROLE) {
        User memory userToApprove = getUser(userAddress, pending);

        delete pending[userAddress];
        registered[userAddress] = userToApprove;
    }

    function denyUser(address userAddress) public onlyRole(APPROVER_ROLE) {
        User memory user = getUser(userAddress, pending);

        delete pending[userAddress];

        emit UserDenied(userAddress, user);
    }

    function getUser(address userAddress, mapping (address => User) storage users)
    private view returns (User memory) {
        User memory user = users[userAddress];

        require(bytes(user.name).length > 0, "User not found");

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