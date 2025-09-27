// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/NFT.sol";

contract DebugMintNFTScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address nftContract = vm.envAddress("NFT_CONTRACT");
        address recipient = vm.envAddress("RECIPIENT_ADDRESS");
        string memory tokenURI = vm.envString("TOKEN_URI");
        
        console.log("=== Debug Info ===");
        console.log("NFT Contract:", nftContract);
        console.log("Recipient:", recipient);
        console.log("Token URI:", tokenURI);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        
        // Check if contract exists
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(nftContract)
        }
        console.log("Contract code size:", codeSize);
        
        if (codeSize == 0) {
            console.log("ERROR: No contract found at address!");
            return;
        }
        
        vm.startBroadcast(deployerPrivateKey);
        
        MyNFT nft = MyNFT(nftContract);
        
        // Check owner
        try nft.owner() returns (address owner) {
            console.log("Contract owner:", owner);
            console.log("Is deployer owner?", owner == vm.addr(deployerPrivateKey));
        } catch {
            console.log("ERROR: Failed to get contract owner");
            vm.stopBroadcast();
            return;
        }
        
        // Try to mint
        try nft.mint(recipient, tokenURI) {
            uint256 tokenId = nft.getCurrentTokenId();
            console.log("SUCCESS: Minted NFT #%d to %s", tokenId, recipient);
            console.log("Token URI:", tokenURI);
        } catch Error(string memory reason) {
            console.log("ERROR: Mint failed with reason:", reason);
        } catch (bytes memory lowLevelData) {
            console.log("ERROR: Mint failed with low-level error");
            console.logBytes(lowLevelData);
        }
        
        vm.stopBroadcast();
    }
}
