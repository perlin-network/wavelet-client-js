const { Wavelet, Contract, TAG_TRANSFER, JSBI, Buffer } = window["wavelet-client"];

const client = new Wavelet("https://devnet.perlin.net");

(async () => {
  console.log(Wavelet.generateNewWallet());
  const wallet = Wavelet.loadWalletFromPrivateKey(
    "ba3daa36b1612a30fb0f7783f98eb508e8f045ffb042124f86281fb41aee8705e919a3626df31b6114ec79567726e9a31c600a5d192e871de1b862412ae8e4c0"
  );

  const accountResponse = await client.getAccount(
    "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"
  );
  console.log("account", accountResponse);
  
  try {
    const txResponse = await client.transfer(
      wallet,
      "f03bb6f98c4dfd31f3d448c7ec79fa3eaa92250112ada43471812f4b1ace6467",
      0
    );
    console.log("txResponse", txResponse);
    await client.pollTransactions(
      {
        onTransactionApplied: data => {
          console.log("tx applied", data);
        }
      },
      {
        id: txResponse.id
      }
    );

    const transfer = await client.getTransaction(
      txResponse.id
    );
    console.log(Wavelet.parseTransaction(transfer.tag, transfer.payload));
  } catch (err) {
    alert(err.message || err);
  }

  const account = await client.getAccount(
    Buffer.from(wallet.publicKey).toString("hex")
  );

  console.log("account", account);
  const contract = new Contract(
    client,
    "4b6b43eba9eb8ed7402e0b7103a3eab9dfba48be05e359557d8c71f6a8513563"
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
      JSBI.subtract(JSBI.BigInt(account.balance), JSBI.BigInt(1000000)),
      1000n,
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
