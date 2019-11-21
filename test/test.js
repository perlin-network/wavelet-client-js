const { Wavelet, Contract, TAG_TRANSFER, Buffer, JSBI } = require("..");

const client = new Wavelet("http://127.0.0.1:9000");
(async () => {
  console.log(await client.getNodeInfo());
  //
  console.log(await client.getAccount('696937c2c8df35dba0169de72990b80761e51dd9e2411fa1fce147f68ade830a'));
  //
  //     const transfer = await client.getTransaction('805e4ff2a9955b804e32579166c8a54e07e3f1c161702254d8778e4805ea12fc');
  //     console.log(Wavelet.parseTransaction(transfer.tag, transfer.payload));
  //
  const wallet = Wavelet.loadWalletFromPrivateKey(
    "87a6813c3b4cf534b6ae82db9b1409fa7dbd5c13dba5858970b56084c4a930eb400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"
  );

  const account = await client.getAccount(
    Buffer.from(wallet.publicKey).toString("hex")
  );

  //
  // const contract = new Contract(
  //   client,
  //   "4356a0898ade0af559a3506a4bd788ecee313bffe58a3fb6ff383f35bcf7e7eb"
  // );
  // await contract.init();
  // //
  //     console.log(contract.test(wallet, 'balance', JSBI.BigInt(0),
  //         {
  //             type: 'raw',
  //             value: '400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'
  //         },
  //     ));

  //     console.log(await contract.call(wallet, 'balance',
  //         JSBI.BigInt(0),
  //         JSBI.subtract(JSBI.BigInt(account.balance), JSBI.BigInt(1000000)),
  //         JSBI.BigInt(0),
  //         {
  //             type: 'raw',
  //             value: '400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'
  //         },
  //     ));
  // //
  await client.pollConsensus({
    onRoundEnded: data => console.log("consensus", data)
  });
  const recipient =
    "696937c2c8df35dba0169de72990b80761e51dd9e2411fa1fce147f68ade830a";

  await new Promise(resolve => setTimeout(resolve, 2000));
  await client.pollTransactions(
    { onTransactionApplied: res => console.log("res", res) },
    { tag: TAG_TRANSFER }
  );
  try {
    for (let i = 0; i < 3; i++) {
      client.transfer(wallet, recipient, JSBI.BigInt(1000));
    }
  } catch (err) {
    console.log(err);
  }

  await client.pollAccounts(
    { onAccountUpdated: data => console.log("sender updated", data.balance) },
    { id: account.public_key }
  );
  await client.pollAccounts(
    {
      onAccountUpdated: data => console.log("recipient updated", data.balance)
    },
    { id: recipient }
  );
})();
