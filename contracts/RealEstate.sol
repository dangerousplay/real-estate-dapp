// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "hardhat/console.sol";
import "./User.sol";
import "./validations.sol";

struct EstatePlace {
    string street;
    string number;
    string city;
    string country;
    string region;
    string neighbour;
}

enum EstateStatus { OCCUPIED, AVAILABLE }

struct Estate {
    EstatePlace place;
    EstateStatus status;
    bool isTrading;
    bool isAcceptingEstate;
    bool ownerIsHolder;
    uint256 price;
    string[] photos;
}


contract RealEstateToken is Initializable, ERC721Upgradeable, ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable, AccessControlUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using Validations for *;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    CountersUpgradeable.Counter private _tokenIdCounter;
    UserManagement private userManagement;

    mapping (uint256 => Estate) estates;

    event EstateRegistered(address indexed owner, uint256 indexed tokenId, Estate estate);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(address userManagementAddress) initializer public {
        __ERC721_init("RealEstateToken", "RET");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __AccessControl_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);

        userManagement = UserManagement(userManagementAddress);

        console.log("RealEstateToken MSG SENDER %s", msg.sender);
    }

    function safeMint(address to, Estate memory estate) public onlyRole(MINTER_ROLE) returns(uint256) {
        uint256 id = _tokenIdCounter.current();

        UserStatus owner = userManagement.getUserStatus(to);

        require(owner == UserStatus.REGISTERED, "User not registered");

        validateEstate(estate);

        _safeMint(to, id);

        estates[id] = estate;

        emit EstateRegistered(to, id, estate);

        _tokenIdCounter.increment();

        return id;
    }

    function information(uint256 tokenId) public view returns(Estate memory) {
        require(_exists(tokenId), "information: Token ID not found");

        return estates[tokenId];
    }

    function validateEstate(Estate memory estate) private {
        EstatePlace memory place = estate.place;

        place.city.validateNotEmpty("City is empty");
        place.street.validateNotEmpty("Street is empty");
        place.number.validateNotEmpty("Number is empty");
        place.country.validateNotEmpty("Country is empty");
        place.region.validateNotEmpty("Region is empty");
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
    internal
    override(ERC721Upgradeable, ERC721EnumerableUpgradeable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
    internal
    override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    {
        super._burn(tokenId);
        delete estates[tokenId];
    }

    function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
    returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721Upgradeable, ERC721EnumerableUpgradeable, AccessControlUpgradeable)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}