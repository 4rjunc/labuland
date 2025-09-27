# NFT 

## test 
`forge test`

## deploy NFT
`forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify`

## mint NFT
`forge script script/MintNFT.s.sol:MintNFTScript --rpc-url $SEPOLIA_RPC_URL --broadcast`


## way of javascript

```
import { ethers } from 'ethers';

// Connect to existing NFT contract
const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
const wallet = new ethers.Wallet('PRIVATE_KEY', provider);

const contractAddress = '0x...'; // Existing NFT contract
const abi = [...]; // Contract ABI

const contract = new ethers.Contract(contractAddress, abi, wallet);

// Mint NFT
async function mintNFT(recipientAddress, tokenURI) {
    const tx = await contract.mint(recipientAddress, tokenURI);
    await tx.wait();
    console.log('NFT minted:', tx.hash);
}
```
