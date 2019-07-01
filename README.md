# `wavelet-client`

[![Discord Chat](https://img.shields.io/discord/458332417909063682.svg)](https://discord.gg/dMYfDPM)
[![crates.io](https://img.shields.io/npm/v/wavelet-client.svg)](https://www.npmjs.com/package/wavelet-client)

A developer-friendly stateless HTTP client for interacting with a Wavelet node written in JavaScript.

The entire source code of this client was written to just fit within a single JavaScript file to make
the underlying code simple and easy to understand. The client has a _very_ minimal set of dependencies that are well-audited.

Note that the documentation below was auto-generated; hence why certain subtleties in documentation are not
shown here. Given that the source code is just a single file, it is recommended to read the documentation
and how the client works straight from the source code while working with it.


## Usage

```javascript
(async() => {
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
    
    const contract = new Contract(client, '013d98b973067e91025137e6913cd61a3ec9814b57e90c22621291863ea082a2');
    await contract.init();
    
    console.log(contract.test('balance', 0n,
        {
            type: 'raw',
            value: '400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'
        },
    ));
    
    console.log(await contract.call(wallet, 'balance', 0n, BigInt(account.balance) - 1000000n,
        {
            type: 'raw',
            value: '400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405'
        },
    ));
    
    client.pollConsensus({onRoundEnded: console.log});
    client.pollTransactions({onTransactionApplied: console.log}, {tag: TAG_TRANSFER, creator: "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"});
    client.pollAccounts({onAccountUpdated: console.log}, {id: "400056ee68a7cc2695222df05ea76875bc27ec6e61e8e62317c336157019c405"});
    
    for (let i = 0; i < 100; i++) {
        await client.transfer(wallet, 'e49e8be205a00edb45de8183a4374e362efc9a4da56dd7ba17e2dd780501e49f', 1000000n);
    }
})()
```

<a name="Wavelet"></a>

## Wavelet
**Kind**: global class  

* [Wavelet](#Wavelet)
    * [new Wavelet(host, [opts])](#new_Wavelet_new)
    * _instance_
        * [.getNodeInfo([opts])](#Wavelet+getNodeInfo) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.getTransaction(id, [opts])](#Wavelet+getTransaction) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.getAccount(id, [opts])](#Wavelet+getAccount) ⇒ <code>Promise.&lt;{public\_key: string, nonce: bigint, balance: bigint, stake: bigint, reward: bigint, is\_contract: boolean, num\_mem\_pages: bigint}&gt;</code>
        * [.getCode(string}, [opts])](#Wavelet+getCode) ⇒ <code>Promise.&lt;Uint8Array&gt;</code>
        * [.getMemoryPages(id, num_mem_pages, [opts])](#Wavelet+getMemoryPages) ⇒ <code>Promise.&lt;Uint8Array&gt;</code>
        * [.transfer(wallet, recipient, amount, [gas_limit], [func_name], [func_payload], [opts])](#Wavelet+transfer) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.placeStake(wallet, amount, [opts])](#Wavelet+placeStake) ⇒ <code>Promise.&lt;\*&gt;</code>
        * [.withdrawStake(wallet, amount, [opts])](#Wavelet+withdrawStake) ⇒ <code>Promise.&lt;\*&gt;</code>
        * [.withdrawReward(wallet, amount, [opts])](#Wavelet+withdrawReward) ⇒ <code>Promise.&lt;\*&gt;</code>
        * [.deployContract(wallet, code, gas_limit, [params], [opts])](#Wavelet+deployContract) ⇒ <code>Promise.&lt;\*&gt;</code>
        * [.sendTransaction(wallet, tag, payload, [opts])](#Wavelet+sendTransaction) ⇒ <code>Promise.&lt;\*&gt;</code>
        * [.pollAccounts(callbacks, opts)](#Wavelet+pollAccounts)
        * [.pollTransactions(callbacks, opts)](#Wavelet+pollTransactions)
        * [.pollConsensus(callbacks)](#Wavelet+pollConsensus)
        * [.pollWebsocket(endpoint, [params], [callback])](#Wavelet+pollWebsocket)
    * _static_
        * [.generateNewWallet()](#Wavelet.generateNewWallet) ⇒ <code>nacl.SignKeyPair</code>
        * [.loadWalletFromPrivateKey(private_key_hex)](#Wavelet.loadWalletFromPrivateKey) ⇒ <code>nacl.SignKeyPair</code>
        * [.parseTransaction(tag, payload)](#Wavelet.parseTransaction) ⇒ <code>Object</code> \| <code>Object</code> \| <code>Array</code> \| <code>Object</code>

<a name="new_Wavelet_new"></a>

### new Wavelet(host, [opts])
A client for interacting with the HTTP API of a Wavelet node.


| Param | Type | Description |
| --- | --- | --- |
| host | <code>string</code> | Address to the HTTP API of a Wavelet node. |
| [opts] | <code>Object</code> | Default options to be passed for making any HTTP request calls using this client instance (optional). |

<a name="Wavelet+getNodeInfo"></a>

### wavelet.getNodeInfo([opts]) ⇒ <code>Promise.&lt;Object&gt;</code>
Query for information about the node you are connected to.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>Object</code> | Options to be passed on for making the specified HTTP request call (optional). |

<a name="Wavelet+getTransaction"></a>

### wavelet.getTransaction(id, [opts]) ⇒ <code>Promise.&lt;Object&gt;</code>
Query for details of a transaction.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Hex-encoded transaction ID. |
| [opts] | <code>Object</code> | Options to be passed on for making the specified HTTP request call (optional). |

<a name="Wavelet+getAccount"></a>

### wavelet.getAccount(id, [opts]) ⇒ <code>Promise.&lt;{public\_key: string, nonce: bigint, balance: bigint, stake: bigint, reward: bigint, is\_contract: boolean, num\_mem\_pages: bigint}&gt;</code>
Query for details of an account; whether it be a smart contract or a user.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Hex-encoded account/smart contract address. |
| [opts] | <code>Object</code> | Options to be passed on for making the specified HTTP request call (optional). |

<a name="Wavelet+getCode"></a>

### wavelet.getCode(string}, [opts]) ⇒ <code>Promise.&lt;Uint8Array&gt;</code>
Query for the raw WebAssembly code of a smart contract.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type | Description |
| --- | --- | --- |
| string} |  | id Hex-encoded ID of the smart contract. |
| [opts] | <code>Object</code> | Options to be passed on for making the specified HTTP request call (optional). |

<a name="Wavelet+getMemoryPages"></a>

### wavelet.getMemoryPages(id, num_mem_pages, [opts]) ⇒ <code>Promise.&lt;Uint8Array&gt;</code>
Query for the amalgamated WebAssembly VM memory of a given smart contract.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  
**Returns**: <code>Promise.&lt;Uint8Array&gt;</code> - The memory of the given smart contract, which may be used to
 initialize a WebAssembly VM with (either on browser/desktop).  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | Hex-encoded ID of the smart contract. |
| num_mem_pages | <code>number</code> | Number of memory pages the smart contract has. |
| [opts] | <code>Object</code> | Options to be passed on for making the specified HTTP request call (optional). |

<a name="Wavelet+transfer"></a>

### wavelet.transfer(wallet, recipient, amount, [gas_limit], [func_name], [func_payload], [opts]) ⇒ <code>Promise.&lt;Object&gt;</code>
Transfer some amount of PERLs to a recipient, or invoke a function on
a smart contract should the recipient specified be a smart contract.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| wallet | <code>nacl.SignKeyPair</code> |  |  |
| recipient | <code>string</code> |  | Hex-encoded recipient/smart contract address. |
| amount | <code>bigint</code> |  | Amount of PERLs to send. |
| [gas_limit] | <code>bigint</code> | <code>0</code> | Gas limit to expend for invoking a smart contract function (optional). |
| [func_name] | <code>string</code> |  | Name of the function to invoke on a smart contract (optional). |
| [func_payload] | <code>Uint8Array</code> |  | Binary-serialized parameters to be used to invoke a smart contract function (optional). |
| [opts] | <code>Object</code> |  | Options to be passed on for making the specified HTTP request call (optional). |

<a name="Wavelet+placeStake"></a>

### wavelet.placeStake(wallet, amount, [opts]) ⇒ <code>Promise.&lt;\*&gt;</code>
Stake some amount of PERLs which is deducted from your wallets balance.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>nacl.SignKeyPair</code> |  |
| amount | <code>bigint</code> |  |
| [opts] | <code>Object</code> | Options to be passed on for making the specified HTTP request call (optional). |

<a name="Wavelet+withdrawStake"></a>

### wavelet.withdrawStake(wallet, amount, [opts]) ⇒ <code>Promise.&lt;\*&gt;</code>
Withdraw stake, which is immediately converted into PERLS into your balance.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type |
| --- | --- |
| wallet | <code>nacl.SignKeyPair</code> | 
| amount | <code>bigint</code> | 
| [opts] | <code>Object</code> | 

<a name="Wavelet+withdrawReward"></a>

### wavelet.withdrawReward(wallet, amount, [opts]) ⇒ <code>Promise.&lt;\*&gt;</code>
Request a withdrawal of reward; which after some number of consensus
rounds will then convert into PERLs into your balance.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>nacl.SignKeyPair</code> |  |
| amount | <code>bigint</code> |  |
| [opts] | <code>Object</code> | Options to be passed on for making the specified HTTP request call (optional). |

<a name="Wavelet+deployContract"></a>

### wavelet.deployContract(wallet, code, gas_limit, [params], [opts]) ⇒ <code>Promise.&lt;\*&gt;</code>
Deploy a smart contract with a specified gas limit and set of parameters.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>nacl.BoxKeyPair</code> |  |
| code | <code>Uint8Array</code> |  |
| gas_limit | <code>bigint</code> |  |
| [params] | <code>Object</code> |  |
| [opts] | <code>Object</code> | Options to be passed on for making the specified HTTP request call (optional). |

<a name="Wavelet+sendTransaction"></a>

### wavelet.sendTransaction(wallet, tag, payload, [opts]) ⇒ <code>Promise.&lt;\*&gt;</code>
Send a transaction on behalf of a specified wallet with a designated
tag and payload.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type | Description |
| --- | --- | --- |
| wallet | <code>nacl.SignKeyPair</code> |  |
| tag | <code>number</code> |  |
| payload | <code>Uint8Array</code> |  |
| [opts] | <code>Object</code> | Options to be passed on for making the specified HTTP request call (optional). |

<a name="Wavelet+pollAccounts"></a>

### wavelet.pollAccounts(callbacks, opts)
Poll for updates to accounts.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type |
| --- | --- |
| callbacks |  | 
| opts | <code>Object</code> | 

<a name="Wavelet+pollTransactions"></a>

### wavelet.pollTransactions(callbacks, opts)
Poll for updates to either all transactions in the ledger, or transactions made by a certain sender, or
transactions made by a certain creator, or transactions with a specific tag, or just a single transaction.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type |
| --- | --- |
| callbacks |  | 
| opts | <code>Object</code> | 

<a name="Wavelet+pollConsensus"></a>

### wavelet.pollConsensus(callbacks)
Poll for finality of consensus rounds, or the pruning of consensus rounds.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param |
| --- |
| callbacks | 

<a name="Wavelet+pollWebsocket"></a>

### wavelet.pollWebsocket(endpoint, [params], [callback])
A generic setup function for listening for websocket events from a Wavelet node.

**Kind**: instance method of [<code>Wavelet</code>](#Wavelet)  

| Param | Type | Description |
| --- | --- | --- |
| endpoint | <code>string</code> | Websocket endpoint. |
| [params] | <code>Object</code> | Query parameters to connect to the endpoint with. |
| [callback] | <code>Object</code> | Callback function for each new event from the websocket. |

<a name="Wavelet.generateNewWallet"></a>

### Wavelet.generateNewWallet() ⇒ <code>nacl.SignKeyPair</code>
Randomly generate a new Wavelet wallet.

**Kind**: static method of [<code>Wavelet</code>](#Wavelet)  
<a name="Wavelet.loadWalletFromPrivateKey"></a>

### Wavelet.loadWalletFromPrivateKey(private_key_hex) ⇒ <code>nacl.SignKeyPair</code>
Load a Wavelet wallet given a hex-encoded private key.

**Kind**: static method of [<code>Wavelet</code>](#Wavelet)  
**Returns**: <code>nacl.SignKeyPair</code> - Wavelet wallet.  

| Param | Type | Description |
| --- | --- | --- |
| private_key_hex | <code>string</code> | Hex-encoded private key. |

<a name="Wavelet.parseTransaction"></a>

### Wavelet.parseTransaction(tag, payload) ⇒ <code>Object</code> \| <code>Object</code> \| <code>Array</code> \| <code>Object</code>
Parse a transactions payload content into JSON.

**Kind**: static method of [<code>Wavelet</code>](#Wavelet)  
**Returns**: <code>Object</code> \| <code>Object</code> \| <code>Array</code> \| <code>Object</code> - Decoded payload of a transaction.  

| Param | Type | Description |
| --- | --- | --- |
| tag | <code>TAG\_NOP</code> \| <code>TAG\_TRANSFER</code> \| <code>TAG\_CONTRACT</code> \| <code>TAG\_STAKE</code> \| <code>TAG\_BATCH</code> | Tag of a transaction. |
| payload | <code>string</code> | Binary-serialized payload of a transaction. |

## Contract
**Kind**: global class  

* [Contract](#Contract)
    * [new Contract(client, contract_id)](#new_Contract_new)
    * [.setRoundIndex(round_idx)](#Contract+setRoundIndex)
    * [.setRoundID(round_id)](#Contract+setRoundID)
    * [.setTransactionID(transaction_id)](#Contract+setTransactionID)
    * [.setSenderID(sender_id)](#Contract+setSenderID)
    * [.test(func_name, amount_to_send, ...func_params)](#Contract+test) ⇒ <code>Object</code>
    * [.call(wallet, func_name, amount_to_send, gas_limit, ...func_params)](#Contract+call) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.parseFunctionParams(...params)](#Contract+parseFunctionParams) ⇒ <code>Uint8Array</code>
    * [.rebuildContractPayload()](#Contract+rebuildContractPayload)
    * [.fetchAndPopulateMemoryPages()](#Contract+fetchAndPopulateMemoryPages) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.init()](#Contract+init) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_Contract_new"></a>

### new Contract(client, contract_id)
A Wavelet smart contract execution simulator.


| Param | Type | Description |
| --- | --- | --- |
| client | [<code>Wavelet</code>](#Wavelet) | Client instance which is connected to a single Wavelet node. |
| contract_id | <code>string</code> | Hex-encoded ID of a smart contract. |

<a name="Contract+setRoundIndex"></a>

### contract.setRoundIndex(round_idx)
Sets the consensus round index for all future simulated smart contract calls.

**Kind**: instance method of [<code>Contract</code>](#Contract)  

| Param | Type | Description |
| --- | --- | --- |
| round_idx | <code>bigint</code> | Consensus round index. |

<a name="Contract+setRoundID"></a>

### contract.setRoundID(round_id)
Sets the consensus round ID for all future simulated smart contract calls.

**Kind**: instance method of [<code>Contract</code>](#Contract)  

| Param | Type | Description |
| --- | --- | --- |
| round_id | <code>string</code> | A 64-letter hex-encoded consensus round ID. |

<a name="Contract+setTransactionID"></a>

### contract.setTransactionID(transaction_id)
Sets the ID of the transaction used to make all future simulated smart contract calls.

**Kind**: instance method of [<code>Contract</code>](#Contract)  

| Param | Type | Description |
| --- | --- | --- |
| transaction_id | <code>string</code> | A 64-letter ex-encoded transaction ID. |

<a name="Contract+setSenderID"></a>

### contract.setSenderID(sender_id)
Sets the sender ID for all future simulated smart contract calls.

**Kind**: instance method of [<code>Contract</code>](#Contract)  

| Param | Type | Description |
| --- | --- | --- |
| sender_id | <code>string</code> | A 64-letter hex-encoded sender wallet address ID. |

<a name="Contract+test"></a>

### contract.test(func_name, amount_to_send, ...func_params) ⇒ <code>Object</code>
Simulates a call to the smart contract. init() must be called to initialize the WebAssembly VM
before calls may be performed against this specified smart contract.

**Kind**: instance method of [<code>Contract</code>](#Contract)  

| Param | Type | Description |
| --- | --- | --- |
| func_name | <code>string</code> | Name of the smart contract function to call. |
| amount_to_send | <code>bigint</code> | Amount of PERLs to send simultaneously to the smart contract  while calling a function. |
| ...func_params | <code>Object</code> | Variadic list of arguments. |

<a name="Contract+call"></a>

### contract.call(wallet, func_name, amount_to_send, gas_limit, ...func_params) ⇒ <code>Promise.&lt;Object&gt;</code>
Performs an official call to a specified smart contract function with a provided gas limit, and a variadic list
of arguments under a provided Wavelet wallet instance.

**Kind**: instance method of [<code>Contract</code>](#Contract)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Response from the Wavelet node.  

| Param | Type | Description |
| --- | --- | --- |
| wallet |  | Wavelet wallet. |
| func_name |  | Name of the smart contract function to call. |
| amount_to_send |  | Amount of PERLs to send simultaneously to the smart contract while calling a function. |
| gas_limit |  | Gas limit to expend for invoking a smart contract function. |
| ...func_params | <code>Object</code> | Variadic list of arguments. |

<a name="Contract+parseFunctionParams"></a>

### contract.parseFunctionParams(...params) ⇒ <code>Uint8Array</code>
Parses smart contract function parameters as a variadic list of arguments, and translates
them into an array of bytes suitable for passing on to a single smart contract invocation call.

**Kind**: instance method of [<code>Contract</code>](#Contract)  
**Returns**: <code>Uint8Array</code> - Parameters serialized into bytes.  

| Param | Type | Description |
| --- | --- | --- |
| ...params | <code>Object</code> | Variadic list of arguments. |

<a name="Contract+rebuildContractPayload"></a>

### contract.rebuildContractPayload()
Based on updates to simulation settings for this smart contract, re-build the
smart contracts payload.

**Kind**: instance method of [<code>Contract</code>](#Contract)  
<a name="Contract+fetchAndPopulateMemoryPages"></a>

### contract.fetchAndPopulateMemoryPages() ⇒ <code>Promise.&lt;void&gt;</code>
Fetches and re-loads the memory of the backing WebAssembly VM for this smart contract; optionally
growing the number of memory pages associated to the VM should there be not enough memory to hold
any new updates to the smart contracts memory. init() must be called before this function may be
called.

**Kind**: instance method of [<code>Contract</code>](#Contract)  
<a name="Contract+init"></a>

### contract.init() ⇒ <code>Promise.&lt;void&gt;</code>
Downloads smart contract code from the Wavelet node if available, and initializes
a WebAssembly VM to simulate function calls against the contract.

**Kind**: instance method of [<code>Contract</code>](#Contract)  

## PayloadBuilder
**Kind**: global class  

* [PayloadBuilder](#PayloadBuilder)
    * [new PayloadBuilder()](#new_PayloadBuilder_new)
    * [.resizeIfNeeded(size)](#PayloadBuilder+resizeIfNeeded)
    * [.writeByte(n)](#PayloadBuilder+writeByte)
    * [.writeInt16(n)](#PayloadBuilder+writeInt16)
    * [.writeInt32(n)](#PayloadBuilder+writeInt32)
    * [.writeInt64(n)](#PayloadBuilder+writeInt64)
    * [.writeUint16(n)](#PayloadBuilder+writeUint16)
    * [.writeUint32(n)](#PayloadBuilder+writeUint32)
    * [.writeUint64(n)](#PayloadBuilder+writeUint64)
    * [.writeBytes(buf)](#PayloadBuilder+writeBytes)
    * [.getBytes()](#PayloadBuilder+getBytes) ⇒ <code>Uint8Array</code>

<a name="new_PayloadBuilder_new"></a>

### new PayloadBuilder()
A payload builder made for easier handling of binary serialization of
data for Wavelet to ingest.

<a name="PayloadBuilder+resizeIfNeeded"></a>

### payloadBuilder.resizeIfNeeded(size)
Resizes the underlying buffer should it not be large enough to handle
some chunk of data to be appended to buffer.

**Kind**: instance method of [<code>PayloadBuilder</code>](#PayloadBuilder)  

| Param | Type | Description |
| --- | --- | --- |
| size | <code>number</code> | Size of data to be appended to the buffer. |

<a name="PayloadBuilder+writeByte"></a>

### payloadBuilder.writeByte(n)
Write a single byte to the payload buffer.

**Kind**: instance method of [<code>PayloadBuilder</code>](#PayloadBuilder)  

| Param | Type | Description |
| --- | --- | --- |
| n | <code>number</code> | A single byte. |

<a name="PayloadBuilder+writeInt16"></a>

### payloadBuilder.writeInt16(n)
Write an signed little-endian 16-bit integer to the payload buffer.

**Kind**: instance method of [<code>PayloadBuilder</code>](#PayloadBuilder)  

| Param | Type |
| --- | --- |
| n | <code>number</code> | 

<a name="PayloadBuilder+writeInt32"></a>

### payloadBuilder.writeInt32(n)
Write an signed little-endian 32-bit integer to the payload buffer.

**Kind**: instance method of [<code>PayloadBuilder</code>](#PayloadBuilder)  

| Param | Type |
| --- | --- |
| n | <code>number</code> | 

<a name="PayloadBuilder+writeInt64"></a>

### payloadBuilder.writeInt64(n)
Write a signed little-endian 64-bit integer to the payload buffer.

**Kind**: instance method of [<code>PayloadBuilder</code>](#PayloadBuilder)  

| Param | Type |
| --- | --- |
| n | <code>bigint</code> | 

<a name="PayloadBuilder+writeUint16"></a>

### payloadBuilder.writeUint16(n)
Write an unsigned little-endian 16-bit integer to the payload buffer.

**Kind**: instance method of [<code>PayloadBuilder</code>](#PayloadBuilder)  

| Param | Type |
| --- | --- |
| n | <code>number</code> | 

<a name="PayloadBuilder+writeUint32"></a>

### payloadBuilder.writeUint32(n)
Write an unsigned little-endian 32-bit integer to the payload buffer.

**Kind**: instance method of [<code>PayloadBuilder</code>](#PayloadBuilder)  

| Param | Type |
| --- | --- |
| n | <code>number</code> | 

<a name="PayloadBuilder+writeUint64"></a>

### payloadBuilder.writeUint64(n)
Write an unsigned little-endian 64-bit integer to the payload buffer.

**Kind**: instance method of [<code>PayloadBuilder</code>](#PayloadBuilder)  

| Param | Type |
| --- | --- |
| n | <code>bigint</code> | 

<a name="PayloadBuilder+writeBytes"></a>

### payloadBuilder.writeBytes(buf)
Write a series of bytes to the payload buffer.

**Kind**: instance method of [<code>PayloadBuilder</code>](#PayloadBuilder)  

| Param | Type |
| --- | --- |
| buf | <code>ArrayBufferLike</code> | 

<a name="PayloadBuilder+getBytes"></a>

### payloadBuilder.getBytes() ⇒ <code>Uint8Array</code>
Returns the raw bytes of the payload buffer.

**Kind**: instance method of [<code>PayloadBuilder</code>](#PayloadBuilder) 