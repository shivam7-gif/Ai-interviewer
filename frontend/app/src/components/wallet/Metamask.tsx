import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectWallet() {
  if (!window.ethereum) {
    alert("Please install Metamask");
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    console.log("Wallet:", accounts[0]);
    console.log("Signer:", await signer.getAddress());

    return { accounts, provider, signer };
  } catch (err) {
    console.error(err);
    throw err;
  }
}
