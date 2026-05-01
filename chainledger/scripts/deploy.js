import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy FlagEngine
  const FlagEngine = await hre.ethers.getContractFactory("FlagEngine");
  const flagEngine = await FlagEngine.deploy();
  await flagEngine.waitForDeployment();
  console.log("FlagEngine deployed to:", await flagEngine.getAddress());

  // Deploy AuditTrail
  const AuditTrail = await hre.ethers.getContractFactory("AuditTrail");
  const auditTrail = await AuditTrail.deploy();
  await auditTrail.waitForDeployment();
  console.log("AuditTrail deployed to:", await auditTrail.getAddress());

  // Deploy FundTransfer
  const FundTransfer = await hre.ethers.getContractFactory("FundTransfer");
  const fundTransfer = await FundTransfer.deploy(await flagEngine.getAddress(), await auditTrail.getAddress());
  await fundTransfer.waitForDeployment();
  console.log("FundTransfer deployed to:", await fundTransfer.getAddress());

  // Link contracts
  await flagEngine.setFundTransferContract(await fundTransfer.getAddress());
  await auditTrail.setContracts(await fundTransfer.getAddress(), await flagEngine.getAddress());
  
  // Grant roles to secondary accounts
  const [admin1, admin2, auditor] = await hre.ethers.getSigners();
  const ADMIN_ROLE = await fundTransfer.ADMIN_ROLE();
  const AUDITOR_ROLE = await auditTrail.AUDITOR_ROLE();
  
  await fundTransfer.grantRole(ADMIN_ROLE, admin2.address);
  await auditTrail.grantRole(AUDITOR_ROLE, auditor.address);
  
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
    const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", `${name}.sol`, `${name}.json`);
    const data = fs.readFileSync(artifactPath);
    fs.writeFileSync(path.join(contractsDir, `${name}.json`), data);
  });

  console.log("ABIs copied to frontend/src/contracts/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
