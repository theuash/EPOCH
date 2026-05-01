import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [admin1, admin2] = await hre.ethers.getSigners();
  const addresses = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "frontend", "src", "contracts", "addresses.json")));

  const FundTransfer = await hre.ethers.getContractAt("FundTransfer", addresses.FundTransfer);
  
  // Helper to submit and approve
  async function fullTransfer(name, addr, amount, cat, docHash, desc) {
    const tx = await FundTransfer.connect(admin1).submitTransaction(name, addr, amount, cat, docHash, desc);
    const receipt = await tx.wait();
    const event = receipt.logs.find(l => l.fragment && l.fragment.name === 'TransactionSubmitted');
    const txId = event.args[0];
    
    await FundTransfer.connect(admin2).approveTransaction(txId);
    console.log(`Transaction ${txId} for ${name} completed.`);
    return txId;
  }

  console.log("Seeding transactions...");

  // 1-3. Clean transactions
  await fullTransfer("Alice", "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", 5000, 0, "hash1", "Monthly Salary");
  await fullTransfer("Office Supplies", "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc", 12000, 1, "hash2", "Stationery");
  await fullTransfer("Hospital Clinic", "0x90f79bf6eb2c4f870365e785982e1f101e93b906", 8000, 2, "hash3", "Medical Camp");

  // 4. New Payee Large Transfer Flag
  await fullTransfer("New NGO Partner", "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65", 11000, 1, "hash4", "New Project Kickoff");

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

  console.log("Seeding completed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
