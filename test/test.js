const { Wavelet, Contract, TAG_TRANSFER } = require("..");

const JSBI = require("jsbi");
const BigInt = JSBI.BigInt;

const client = new Wavelet("http://127.0.0.1:9000");

(async () => {
  console.log(await client.getNodeInfo());

  console.log(
    await client.getAccount(
      "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"
    )
  );

  const transfer = await client.getTransaction(
    "575cec95a7736bf7918d07f6f2b5892c1d1f89ecfd6008144f051e5a4acd63f5"
  );
  console.log(Wavelet.parseTransaction(transfer.tag, transfer.payload));

  const wallet = Wavelet.loadWalletFromPrivateKey(
    "87a6813c3b4cf534b6ae82db9b1409fa7dbd5c13dba5858970b56084c4a930eb400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"
  );
  const account = await client.getAccount(
    Buffer.from(wallet.publicKey).toString("hex")
  );

  const contract = new Contract(
    client,
    "9d57bb96f02f49029a1a83ffa7769b48eb149dd19d968d57e5ab29f25ca9e450"
  );
  await contract.init();

  console.log(
    contract.test(wallet, "balance", BigInt(0), {
      type: "raw",
      value: "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"
    })
  );

  console.log(
    await contract.call(
      wallet,
      "balance",
      BigInt(0),
      BigInt(0),
      JSBI.subtract(BigInt(account.balance), BigInt(1000000)),
      {
        type: "raw",
        value:
          "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"
      }
    )
  );

  const consensusPoll = await client.pollConsensus({
    onRoundEnded: console.log
  });
  const transactionsPoll = await client.pollTransactions(
    { onTransactionApplied: console.log },
    {
      tag: TAG_TRANSFER,
      creator:
        "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"
    }
  );
  const accountsPoll = await client.pollAccounts(
    { onAccountUpdated: console.log },
    { id: "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405" }
  );

  for (let i = 0; i < 100; i++) {
    await client.transfer(
      wallet,
      "e49e8be205a00edb45de8183a4374e362efc9a4da56dd7ba17e2dd780501e49f",
      BigInt(1000000)
    );
  }
})();
