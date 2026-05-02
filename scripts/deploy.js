import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
  const admin2 = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
  const auditor = new ethers.Wallet("0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", provider);
  
  console.log("Deploying contracts with the account:", deployer.address);

  function getContractData(name) {
      const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", `${name}.sol`, `${name}.json`);
      const artifact = JSON.parse(fs.readFileSync(artifactPath));
      return { abi: artifact.abi, bytecode: artifact.bytecode };
  }

  let nonce = await deployer.getNonce();

  // Deploy FlagEngine
  const flagEngineData = getContractData("FlagEngine");
  const FlagEngineFactory = new ethers.ContractFactory(flagEngineData.abi, flagEngineData.bytecode, deployer);
  const flagEngine = await FlagEngineFactory.deploy({ nonce: nonce++ });
  await flagEngine.waitForDeployment();
  console.log("FlagEngine deployed to:", await flagEngine.getAddress());

  // Deploy AuditTrail
  const auditTrailData = getContractData("AuditTrail");
  const AuditTrailFactory = new ethers.ContractFactory(auditTrailData.abi, auditTrailData.bytecode, deployer);
  const auditTrail = await AuditTrailFactory.deploy({ nonce: nonce++ });
  await auditTrail.waitForDeployment();
  console.log("AuditTrail deployed to:", await auditTrail.getAddress());

  // Deploy FundTransfer
  const fundTransferData = getContractData("FundTransfer");
  const FundTransferFactory = new ethers.ContractFactory(fundTransferData.abi, fundTransferData.bytecode, deployer);
  const fundTransfer = await FundTransferFactory.deploy(await flagEngine.getAddress(), await auditTrail.getAddress(), { nonce: nonce++ });
  await fundTransfer.waitForDeployment();
  console.log("FundTransfer deployed to:", await fundTransfer.getAddress());

  // Link contracts
  const setFundTransferTx = await flagEngine.setFundTransferContract(await fundTransfer.getAddress(), { nonce: nonce++ });
  await setFundTransferTx.wait();
  
  const setContractsTx = await auditTrail.setContracts(await fundTransfer.getAddress(), await flagEngine.getAddress(), { nonce: nonce++ });
  await setContractsTx.wait();
  
  // Grant roles to secondary accounts
  const ADMIN_ROLE = await fundTransfer.ADMIN_ROLE();
  const AUDITOR_ROLE = await auditTrail.AUDITOR_ROLE();
  
  const grantAdminTx = await fundTransfer.grantRole(ADMIN_ROLE, admin2.address, { nonce: nonce++ });
  await grantAdminTx.wait();
  
  const grantAuditorTx = await auditTrail.grantRole(AUDITOR_ROLE, auditor.address, { nonce: nonce++ });
  await grantAuditorTx.wait();
  
  console.log("Roles granted to secondary admin and auditor");
  console.log("Contracts linked successfully");

  // Save addresses to frontend
  const addresses = {
    FlagEngine: await flagEngine.getAddress(),
    AuditTrail: await auditTrail.getAddress(),
    FundTransfer: await fundTransfer.getAddress()
  };

  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );

  console.log("Addresses saved to frontend/src/contracts/addresses.json");

  // Copy ABIs
  const artifacts = ["FundTransfer", "FlagEngine", "AuditTrail"];
  artifacts.forEach(name => {
    const data = getContractData(name);
    fs.writeFileSync(path.join(contractsDir, `${name}.json`), JSON.stringify(data, null, 2));
  });

  console.log("ABIs copied to frontend/src/contracts/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
