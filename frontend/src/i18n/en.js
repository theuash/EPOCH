export default {
  translation: {
    app_name: "Secure Node",
    tagline: "Secure Node — Transparent Funds. Trusted Communities.",
    subtagline: "A blockchain-powered platform that tracks every rupee of public NGO funding — end-to-end, tamper-proof, and open to all.",
    kannada_tagline: "ಸಾರ್ವಜನಿಕ ಹಣದ ಹರಿವನ್ನು ಪಾರದರ್ಶಕವಾಗಿ ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
    cta_public: "View Fund Transactions",
    cta_login: "Enter as Admin / Auditor",
    problem: {
      heading: "The Problem",
      body: "Every year, billions of rupees donated to NGOs across India go untracked. Donors have no way to verify how their money was used. Auditors work with spreadsheets that can be edited. The public has no window into fund utilisation. Trust is assumed — never proven.\n\nCorruption doesn't always look like theft. Sometimes it looks like a missing receipt, a suspiciously round payment, or funds quietly moving to a new account. Without a permanent, tamper-proof record, there is no accountability.",
      body_kn: "ಪ್ರತಿ ವರ್ಷ ಭಾರತದಾದ್ಯಂತ NGO ಗಳಿಗೆ ದಾನ ಮಾಡಿದ ಕೋಟ್ಯಂತರ ರೂಪಾಯಿಗಳ ಬಳಕೆ ಪರಿಶೀಲಿಸಲಾಗುವುದಿಲ್ಲ. ದಾನಿಗಳಿಗೆ ತಮ್ಮ ಹಣ ಹೇಗೆ ಬಳಸಲಾಯಿತು ಎಂದು ತಿಳಿಯಲು ಯಾವುದೇ ಮಾರ್ಗವಿಲ್ಲ."
    },
    solution: {
      heading: "Our Solution",
      body: "Secure Node puts every NGO transaction on a blockchain ledger that nobody — not even the platform itself — can alter after the fact. Every payment is recorded with a timestamp, a document hash, and a permanent block signature. Three roles keep each other in check: admins submit transactions, auditors review and resolve flags, and the public can verify every entry in real time.",
      card1_title: "Tamper-Proof Ledger",
      card1_body: "Every transaction is hash-chained to the one before it. Alter one record and the entire chain breaks — detected instantly.",
      card1_kn: "ಪ್ರತಿ ವ್ಯವಹಾರವನ್ನು ಹ್ಯಾಶ್ ಚೈನ್ನಲ್ಲಿ ದಾಖಲಿಸಲಾಗುತ್ತದೆ.",
      card2_title: "Multi-Role Access",
      card2_body: "Admins write. Auditors verify. The public watches. No single party has unchecked control over the system.",
      card2_kn: "ನಿರ್ವಾಹಕರು, ಲೆಕ್ಕಪರಿಶೋಧಕರು ಮತ್ತು ಸಾರ್ವಜನಿಕರಿಗೆ ಪ್ರತ್ಯೇಕ ಪ್ರವೇಶ.",
      card3_title: "Automatic Flagging",
      card3_body: "Smart contracts automatically flag suspicious patterns — unusual payment frequency, round-number transfers, and large payments to new recipients.",
      card3_kn: "ಸ್ಮಾರ್ಟ್ ಕಾಂಟ್ರಾಕ್ಟ್ಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅನುಮಾನಾಸ್ಪದ ವ್ಯವಹಾರಗಳನ್ನು ಗುರುತಿಸುತ್ತವೆ."
    },
    how: {
      heading: "How It Works",
      step1_title: "Admin Submits a Transaction",
      step1_body: "An NGO admin logs in via MetaMask wallet and submits a fund transfer — receiver details, amount, category, and a mandatory receipt upload. The receipt is hashed and stored on-chain. A second admin must approve before it commits.",
      step2_title: "Smart Contracts Validate",
      step2_body: "Three smart contracts run automatically: FundTransfer records the transaction permanently, FlagEngine checks it against three fraud detection rules, and AuditTrail chains it to the previous block and updates the Merkle root.",
      step3_title: "Auditor Reviews Flags",
      step3_body: "If any rule is triggered, the transaction is flagged on-chain. An auditor reviews the flagged entry, investigates, and writes resolution notes — also stored permanently on the blockchain.",
      step4_title: "Public Verifies in Real Time",
      step4_body: "Anyone can open the public dashboard, browse all committed transactions, filter by category or date, and verify the chain is intact. If something looks wrong, they can raise a concern directly from the dashboard."
    },
    features: {
      heading: "Key Features",
      f1: "Blockchain hash-chaining — every block linked to the previous, breaks on tampering",
      f2: "Multi-signature approval — two admin wallets required per transaction",
      f3: "Document hash verification — receipt SHA-256 stored permanently on-chain",
      f4: "Three auto-flag rules — velocity breach, round number, new payee large transfer",
      f5: "Role-based access — MetaMask for admin/auditor, email login for public",
      f6: "Real-time chain integrity check — one API call shows intact or tampered",
      f7: "Raise Concern — public users can flag suspicious entries to auditors",
      f8: "Bilingual UI — full English and Kannada support throughout"
    },
    chain: {
      label: "Live Chain Status",
      label_kn: "ನೇರ ಚೈನ್ ಸ್ಥಿತಿ",
      intact: "✓ Chain Intact — No Tampering Detected",
      tampered: "⚠ Tamper Detected — Chain Integrity Compromised"
    },
    footer: {
      tagline: "Secure Node — Built for transparency, powered by blockchain.",
      tagline_kn: "ಸೆಕ್ಯೂರ್ ನೋಡ್ — ಪಾರದರ್ಶಕತೆಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ.",
      view_txns: "View Transactions",
      auditor_login: "Auditor Login",
      admin_login: "Admin Login",
      github: "GitHub"
    },
    nav: {
      home: "Home",
      admin: "Admin",
      auditor: "Auditor",
      public: "Public Dashboard",
      flagged: "Flagged",
      login: "Login"
    },
    status: {
      chain_intact: "Chain Intact",
      tamper_detected: "Tamper Detected",
      committed: "Committed",
      flagged: "Flagged",
      under_review: "Under Review",
      resolved: "Resolved"
    },
    table: {
      date: "Date",
      receiver: "Receiver Name",
      category: "Category",
      amount: "Amount",
      status: "Status",
      hash: "Block Hash"
    },
    flags: {
      velocity_breach: "Unusual payment frequency",
      round_number_suspicious: "Suspicious round amount",
      new_payee_large_transfer: "Large transfer to new recipient"
    },
    buttons: {
      enter: "Enter",
      submit: "Submit",
      approve: "Approve",
      resolve: "Resolve",
      connect_wallet: "Connect Wallet",
      email_login: "Email Login"
    },
    flagged: {
      title: "Flagged Transactions",
      subtitle: "Transactions auto-flagged by smart contract detection rules — overspend exceeding 3× avg monthly budget without milestone approval, or vendor repeat rate above 80%."
    }
  }
};
