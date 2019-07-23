# `wavelet-client`

[![crates.io](https://img.shields.io/npm/v/wavelet-client.svg)](https://www.npmjs.com/package/wavelet-client)
[![Discord Chat](https://img.shields.io/discord/458332417909063682.svg)](https://discord.gg/dMYfDPM)

A developer-friendly stateless HTTP client for interacting with a Wavelet node. Wrriten in JavaScript.

The entire source code of this client was written to just fit within a single JavaScript file to make
the underlying code simple and easy to understand. The client has a _very_ minimal set of dependencies
that are well-audited.

The client has been tested to work on both NodeJS alongside on the browser. As a warning, the client uses
some newer language features such as big integers which may require a polyfill.

## Setup

```shell
yarn add wavelet-client
```

## Usage

```javascript
const {Wavelet, Contract, TAG_TRANSFER} = require('..');

const JSBI = require('jsbi');
const BigInt = JSBI.BigInt;

const client = new Wavelet("http://127.0.0.1:9000");

(async () => {
    console.log(await client.getNodeInfo());

    console.log(await client.getAccount('400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'));

    const transfer = await client.getTransaction('805e4ff2a9955b804e32579166c8a54e07e3f1c161702254d8778e4805ea12fc');
    console.log(Wavelet.parseTransaction(transfer.tag, transfer.payload));

    const call = await client.getTransaction('9a8746b7bf7a84af7fbd41520a841e96907bee71a88560af7e6996cfb7682891');
    console.log(Wavelet.parseTransaction(call.tag, call.payload));

    const stake = await client.getTransaction('673ef140f8a47980d8684a47bf639624d7a4d8470ad30c1a66a4f417f69ab84a');
    console.log(Wavelet.parseTransaction(stake.tag, stake.payload));

    const wallet = Wavelet.loadWalletFromPrivateKey('87a6813c3b4cf534b6ae82db9b1409fa7dbd5c13dba5858970b56084c4a930eb400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405');
    const account = await client.getAccount(Buffer.from(wallet.publicKey).toString("hex"));

    const contract = new Contract(client, '52bb52e0440ce0aa7a7d2018f5bac21d6abde64f5b9498615ce2bef332bd487a');
    await contract.init();

    console.log(contract.test(wallet, 'balance', BigInt(0),
        {
            type: 'raw',
            value: '400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'
        },
    ));

    console.log(await contract.call(wallet, 'balance', BigInt(0), BigInt(0), JSBI.subtract(BigInt(account.balance), BigInt(1000000)),
        {
            type: 'raw',
            value: '400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'
        },
    ));

    const consensusPoll = await client.pollConsensus({onRoundEnded: console.log});
    const transactionsPoll = await client.pollTransactions({onTransactionApplied: console.log}, {tag: TAG_TRANSFER, creator: "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"});
    const accountsPoll = await client.pollAccounts({onAccountUpdated: console.log}, {id: "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"});

    for (let i = 0; i < 100; i++) {
        await client.transfer(wallet, 'e49e8be205a00edb45de8183a4374e362efc9a4da56dd7ba17e2dd780501e49f', BigInt(1000000));
    }
})();
```