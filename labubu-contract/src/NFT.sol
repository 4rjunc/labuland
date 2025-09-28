// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    address[] public registeredPlayers;
    
    constructor(address initialOwner) 
        ERC721("LabuLand", "LABUBU") 
        Ownable(initialOwner) 
    {
        _nextTokenId = 1; // Start token IDs from 1
    }

    function mint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // Add player register logic 
        registeredPlayers.push(to);
    }

    // TODO: add function for reproduce

    function batchMint(address[] memory recipients, string[] memory uris) 
        public onlyOwner 
    {
        require(recipients.length == uris.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _nextTokenId++;
            _mint(recipients[i], tokenId);
            _setTokenURI(tokenId, uris[i]);
        }
    }

    function getCurrentTokenId() public view returns (uint256) {
        return _nextTokenId - 1;
    }

    function getNextTokenId() public view returns (uint256) {
        return _nextTokenId;
    }

    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
