import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import addresses from '../contracts/addresses.json';
import FundTransferABI from '../contracts/FundTransfer.json';
import FlagEngineABI from '../contracts/FlagEngine.json';
import AuditTrailABI from '../contracts/AuditTrail.json';
import { FlagService } from '../services/FlagService';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState({});
  const [flagService, setFlagService] = useState(null);
  const [flags, setFlags] = useState([]);
  const flagServiceRef = useRef(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        setAccount(accounts[0]);

        const fundTransferContract = new ethers.Contract(
          addresses.FundTransfer,
          FundTransferABI.abi,
          signer
        );
        const flagEngineContract = new ethers.Contract(
          addresses.FlagEngine,
          FlagEngineABI.abi,
          signer
        );
        const auditTrailContract = new ethers.Contract(
          addresses.AuditTrail,
          AuditTrailABI.abi,
          signer
        );

        setContracts({
          fundTransfer: fundTransferContract,
          flagEngine: flagEngineContract,
          auditTrail: auditTrailContract
        });

        // Initialize FlagService for monitoring
        const service = new FlagService(flagEngineContract, provider);
        flagServiceRef.current = service;
        setFlagService(service);

        // Start monitoring with callback
        service.startMonitoring((activeFlags) => {
          setFlags(activeFlags);
        });

        return accounts[0];
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Install MetaMask!");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (flagServiceRef.current) {
        flagServiceRef.current.stopMonitoring();
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        contracts,
        connectWallet,
        flagService,
        flags,
        flagSummary: flagService ? flagService.getSummary() : { total: 0, critical: 0, overSpends: 0 }
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
