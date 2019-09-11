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
const { Wavelet, Contract, TAG_TRANSFER, SetOption } = require('wavelet-client');

const JSBI = require('jsbi');
const BigInt = JSBI.BigInt;

const client = new Wavelet('https://testnet.perlin.net');

(async () => {
    console.log(await client.getNodeInfo());

    console.log(await client.getAccount('400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'));

    try {
        const transfer = await client.getTransaction('9eba6ea46d551c60af17837a29a472680043fdf6c9b5de16beb33b3b1b569660');
        console.log(Wavelet.parseTransaction(Wavelet.Tag(transfer.tag), Wavelet.payload(transfer.payload)));

        const call = await client.getTransaction('42ec15463eb14d93a63960ade358d15554cb3c6d733670a7e69b96c6f3ec69b4');
        console.log(Wavelet.parseTransaction(Wavelet.Tag(call.tag), Wavelet.payload(transfer.payload)));

        const stake = await client.getTransaction('5fe8bac3b084c568bf49397333034dcc1d6818756da470fcb3675b95eee68bcd');
        console.log(Wavelet.parseTransaction(Wavelet.Tag(stake.tag), Wavelet.payload(transfer.payload)));

    } catch (err) {
        console.error(err);
    }

    const wallet = Wavelet.loadWalletFromPrivateKey('87a6813c3b4cf534b6ae82db9b1409fa7dbd5c13dba5858970b56084c4a930eb400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405');
    const account = await client.getAccount(Buffer.from(wallet.publicKey).toString('hex'));

    console.log(account);

    const contract = new Contract(client, Contract.ContractId('61820bc6796380c12347f69be171868b4e268204caa76ab68087cbde4f925beb'));
    await contract.init();

    console.log(contract);

    const params = [
        Contract.Raw('400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405')
    ];

    const gasLimit = JSBI.subtract(BigInt(account.balance), BigInt(1000000));
    const testResult = contract.test(
        wallet,
        'balance',
        SetOption('amount', BigInt(0)),
        Contract.Params(params)
    );

    console.log(testResult);

    const callResult = await contract.call(
        wallet,
        'balance',
        Contract.Amount(0),
        Contract.GasLimit(gasLimit),
        Contract.GasDeposit(0),
        Contract.Params(params)
    );

    console.log(callResult);

    const consensusPoll = await client.pollConsensus(Wavelet.RoundEnded(console.log));
    const transactionsPoll = await client.pollTransactions(Wavelet.TransactionApplied(console.log), Wavelet.Tag(TAG_TRANSFER), Wavelet.Creator('400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'));
    const accountsPoll = await client.pollAccounts(Wavelet.AccountUpdated(console.log), Wavelet.Id('400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'));

    for (let i = 0; i < 100; i++) {
        await client.transfer(wallet,
            'e49e8be205a00edb45de8183a4374e362efc9a4da56dd7ba17e2dd780501e49f',
            Contract.Amount(1000)
        );
    }
})();
