const { mnemonicNew, mnemonicToWalletKey } = require('@ton/crypto');
const { TonClient, WalletContractV4 } = require('@ton/ton');
const { getHttpEndpoint } = require('@orbs-network/ton-access');

(async () => {
  const mnemonics = await mnemonicNew();
  console.log("🔐 Mnemonic (SAVE THIS SECURELY):");
  console.log(mnemonics.join(" "));

  const key = await mnemonicToWalletKey(mnemonics);

  const endpoint = await getHttpEndpoint();
  const client = new TonClient({ endpoint });

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: key.publicKey,
  });

  const contract = client.open(wallet);
  const address = contract.address.toString();

  console.log(`\n📬 Wallet Address (Base64): ${address}`);
})();
