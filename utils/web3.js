import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
const contractAddress = 'YOUR_CONTRACT_ADDRESS_HERE';
const abi = [/* ABI from compiled contract */];
const viurlToken = new web3.eth.Contract(abi, contractAddress);

async function rewardUser(userAddress, amount) {
    const accounts = await web3.eth.getAccounts();
    await viurlToken.methods.rewardUser(userAddress, amount).send({ from: accounts[0] });
}

export { web3, viurlToken, rewardUser };
