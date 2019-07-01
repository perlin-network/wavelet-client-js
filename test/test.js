const {Wavelet, Contract, TAG_TRANSFER} = require('..');

// const client = new Wavelet("http://127.0.0.1:9000");

(async () => {
    // console.log(await client.getNodeInfo());
    //
    // console.log(await client.getAccount('400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'));

    // const transfer = await client.getTransaction('805e4ff2a9955b804e32579166c8a54e07e3f1c161702254d8778e4805ea12fc');
    // console.log(Wavelet.parseTransaction(transfer.tag, transfer.payload));
    //
    // const call = await client.getTransaction('9a8746b7bf7a84af7fbd41520a841e96907bee71a88560af7e6996cfb7682891');
    // console.log(Wavelet.parseTransaction(call.tag, call.payload));
    //
    // const contract = await client.getTransaction('ce4c160129a296f91092e658454877d45cc7b7c152730dea525a28f2e13b2aa1');
    // console.log(Wavelet.parseTransaction(contract.tag, contract.payload));

    // const stake = await client.getTransaction('673ef140f8a47980d8684a47bf639624d7a4d8470ad30c1a66a4f417f69ab84a');
    // console.log(Wavelet.parseTransaction(stake.tag, stake.payload));

    // const wallet = Wavelet.loadWalletFromPrivateKey('87a6813c3b4cf534b6ae82db9b1409fa7dbd5c13dba5858970b56084c4a930eb400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405');
    // const account = await client.getAccount(Buffer.from(wallet.publicKey).toString("hex"));
    //
    // const contract = new Contract(client, '013d98b973067e91025137e6913cd61a3ec9814b57e90c22621291863ea082a2');
    // await contract.init();
    //
    // console.log(contract.test('balance', 0n,
    //     {
    //         type: 'raw',
    //         value: '400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'
    //     },
    // ));
    //
    // console.log(await contract.call(wallet, 'balance', 0n, BigInt(account.balance) - 1000000n,
    //     {
    //         type: 'raw',
    //         value: '400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'
    //     },
    // ));

    // client.pollConsensus({onRoundEnded: console.log});
    // client.pollTransactions({onTransactionApplied: console.log}, {tag: TAG_TRANSFER, creator: "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"});
    // client.pollAccounts({onAccountUpdated: console.log}, {id: "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"});

    // for (let i = 0; i < 100; i++) {
    //     await client.transfer(wallet, 'e49e8be205a00edb45de8183a4374e362efc9a4da56dd7ba17e2dd780501e49f', 1000000n);
    // }
})()
