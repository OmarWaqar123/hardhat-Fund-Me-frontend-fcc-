// checking if metamask extension exists, the reason we wrap this in function is so our site don't request us to connect
//to metamask everytie we reload the website, instead we have to call the function to connect

//import
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balancebutton");
const Withdrawbutton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
Withdrawbutton.onclick = Withdraw;

// console.log(ethers);
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("I smell a metamask!!!");
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("connected");
        connectButton.innerHTML = "Connected";
        connectButton.style.backgroundColor = "blue";
        connectButton.style.color = "White";
    } else {
        console.log("No metamask!!");
        connectButton.innerHTML = "Please install metamask";
        connectButton.style.backgroundColor = "red";
        connectButton.style.color = "white";
    }
}
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}....`);
    if (typeof window.ethereum !== "undefined") {
        //provider / connection to the blockchain
        // Signer  / wallet / someone with some gas
        //Contract that we are interacting with
        // ^ ABI and Address

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.Fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            // Listen for the tx to be mined or listen for an event <--- we haven't learned about yet
            await listenForTransactionMined(transactionResponse, provider);
            // const transactionReceipt = await transactionResponse.wait(1);
            // console.log(transactionResponse.hash);
            // console.log(transactionReceipt.confirmations);
            console.log("Done!");
        } catch (error) {
            console.log(error);
        }
    }
}
function listenForTransactionMined(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}.......`);
    //create a listener for the blockchain
    //listen for this transaction to finish, check ethers docs for provider.once()
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            );
            resolve();
        });
    });
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function Withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing......");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMined(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    }
}
