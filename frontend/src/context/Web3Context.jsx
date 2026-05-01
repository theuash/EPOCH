import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';
import addresses from '../contracts/addresses.json';
import FundTransferABI from '../contracts/FundTransfer.json';
import FlagEngineABI from '../contracts/FlagEngine.json';
import AuditTrailABI from '../contracts/AuditTrail.json';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState({});

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        setAccount(accounts[0]);
        setContracts({
          fundTransfer: new ethers.Contract(addresses.FundTransfer, FundTransferABI.abi, signer),
          flagEngine: new ethers.Contract(addresses.FlagEngine, FlagEngineABI.abi, signer),
          auditTrail: new ethers.Contract(addresses.AuditTrail, AuditTrailABI.abi, signer)
        });
        return accounts[0];
      } catch (err) { console.error(err); }
    } else { alert("Install MetaMask!"); }
  };

  return (
    <Web3Context.Provider value={{ account, contracts, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
