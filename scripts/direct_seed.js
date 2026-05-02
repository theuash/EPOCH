import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  // Hardhat Account 0 & 1
  const admin1 = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);
  const admin2 = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);

  const addresses = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "frontend", "src", "contracts", "addresses.json")));
  const FundTransferABI = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "frontend", "src", "contracts", "FundTransfer.json"))).abi;

  const FundTransfer = new ethers.Contract(addresses.FundTransfer, FundTransferABI, admin1);
  const FundTransferAdmin2 = new ethers.Contract(addresses.FundTransfer, FundTransferABI, admin2);
  
  let nonceAdmin1 = await admin1.getNonce();
  let nonceAdmin2 = await admin2.getNonce();
  
  async function fullTransfer(name, addr, amount, cat, docHash, desc) {
    console.log(`Submitting ${name}...`);
    const tx = await FundTransfer.submitTransaction(name, addr, amount, cat, docHash, desc, { nonce: nonceAdmin1++ });
    const receipt = await tx.wait();
    const txId = (await FundTransfer.nextTxId()) - 1n;
    
    console.log(`Approving ${txId}...`);
    await FundTransferAdmin2.approveTransaction(txId, { nonce: nonceAdmin2++ });
    console.log(`Transaction ${txId} for ${name} completed.\n`);
    return txId;
  }

  console.log("Seeding real transactions...");

  // 1-3. Clean transactions
  await fullTransfer("Alice", "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", 5000, 0, "hash1", "Monthly Salary");
  await fullTransfer("Office Supplies", "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc", 12000, 1, "hash2", "Stationery");
  await fullTransfer("Hospital Clinic", "0x90f79bf6eb2c4f870365e785982e1f101e93b906", 8000, 2, "hash3", "Medical Camp");

  // 4. New Payee Large Transfer Flag (assuming >3x avg budget triggers it)
  await fullTransfer("New NGO Partner", "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65", 110000, 1, "hash4", "New Project Kickoff");

  // 5. Round Number Flag
  await fullTransfer("Infrastructure Corp", "0x9965507d1a056bc2f20f17a8f884ad7468b81093", 30000, 1, "hash5", "Construction milestone");

  // 6-9. Velocity Breach Flag
  const receiver6 = "0x976ea74026e726554db657fa54763abd0c3a0aa9";
  await fullTransfer("Vendor X", receiver6, 1000, 4, "hash6", "Part 1");
  await fullTransfer("Vendor X", receiver6, 1000, 4, "hash7", "Part 2");
  await fullTransfer("Vendor X", receiver6, 1000, 4, "hash8", "Part 3");
  await fullTransfer("Vendor X", receiver6, 1000, 4, "hash9", "Part 4 (Velocity Breach)");

  // 10. Another clean one
  await fullTransfer("School Support", "0x14dc832149c533261299e717e84e626008b35cb6", 4500, 3, "hash10", "Books for kids");

  console.log("Seeding completed successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
