const Web3 = require('web3');

// Connect to Ethereum testnet (Ropsten)
const web3 = new Web3('https://ropsten.infura.io/v3/YOUR_INFURA_PROJECT_ID');

// Replace with your contract addresses and ABI
const likeTokenAddress = '0xYourLikeTokenAddress';
const dislikeTokenAddress = '0xYourDislikeTokenAddress';
const shareTokenAddress = '0xYourShareTokenAddress';
const tokenABI = []; // Your token ABI

const likeTokenContract = new web3.eth.Contract(tokenABI, likeTokenAddress);
const dislikeTokenContract = new web3.eth.Contract(tokenABI, dislikeTokenAddress);
const shareTokenContract = new web3.eth.Contract(tokenABI, shareTokenAddress);

async function rewardUser(userAddress, tokenType, amount) {
    let contract;
    if (tokenType === 'likeToken') {
        contract = likeTokenContract;
    } else if (tokenType === 'dislikeToken') {
        contract = dislikeTokenContract;
    } else if (tokenType === 'shareToken') {
        contract = shareTokenContract;
    }

    const fromAddress = '0xYourAddress'; // Your wallet address
    const privateKey = 'yourPrivateKey'; // Your wallet private key

    const tx = {
        from: fromAddress,
        to: contract.options.address,
        data: contract.methods.transfer(userAddress, amount).encodeABI(),
        gas: 2000000,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return receipt;
}

module.exports = {
    rewardUser,
};
