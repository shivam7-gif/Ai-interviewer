import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";

export const MetamaskConnect = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error);
        }
      }
    };
    checkConnection();

    // Listen for account changes
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      toast.error("MetaMask is not installed!");
      return;
    }
    
    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        toast.success("Wallet connected successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    // Note: Metamask doesn't actually allow apps to fully disconnect via API,
    // but we can clear it from local state.
    setAccount(null);
    toast.info("Wallet disconnected from app");
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {account ? (
        <button 
          onClick={disconnectWallet} 
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 500,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--text)",
            cursor: "pointer",
            transition: "all var(--t)"
          }}
        >
          {account.slice(0, 6)}...{account.slice(-4)}
        </button>
      ) : (
        <button 
          onClick={connectWallet} 
          disabled={isConnecting}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 500,
            background: "var(--accent)",
            border: "1px solid var(--accent-border)",
            borderRadius: "var(--radius)",
            color: "#fff",
            cursor: isConnecting ? "not-allowed" : "pointer",
            opacity: isConnecting ? 0.7 : 1,
            transition: "all var(--t)"
          }}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
};
