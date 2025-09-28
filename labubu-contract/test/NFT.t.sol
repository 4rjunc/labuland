// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/NFT.sol";

contract MyNFTTest is Test {
    MyNFT public nft;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        
        nft = new MyNFT(owner);
    }

    function testMint() public {
        string memory uri = "https://purple-decisive-raccoon-292.mypinata.cloud/ipfs/bafkreia5nrqonopuu26iyfozaw4th4fo3rx42t7edvpl5kmb4ihh6riydi";
        
        nft.mint(user1, uri);
        
        assertEq(nft.ownerOf(1), user1);
        assertEq(nft.tokenURI(1), uri);
        assertEq(nft.getCurrentTokenId(), 1);
    }

    // function testBatchMint() public {
    //     address[] memory recipients = new address[](2);
    //     recipients[0] = user1;
    //     recipients[1] = user2;
    //
    //     string[] memory uris = new string[](2);
    //     uris[0] = "https://gateway.pinata.cloud/ipfs/QmHash1";
    //     uris[1] = "https://gateway.pinata.cloud/ipfs/QmHash2";
    //
    //     nft.batchMint(recipients, uris);
    //
    //     assertEq(nft.ownerOf(1), user1);
    //     assertEq(nft.ownerOf(2), user2);
    //     assertEq(nft.getCurrentTokenId(), 2);
    // }

    function testOnlyOwnerCanMint() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.mint(user1, "test-uri");
    }

    function testTokenCounter() public {
        assertEq(nft.getNextTokenId(), 1);
        
        nft.mint(user1, "uri1");
        assertEq(nft.getNextTokenId(), 2);
        
        nft.mint(user2, "uri2");
        assertEq(nft.getNextTokenId(), 3);
    }
}
