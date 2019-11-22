declare module "blakejs" {
  /*
   *  input - the input bytes, as a string, Buffer, or Uint8Array
   *  key - optional key Uint8Array, up to 64 bytes
   *  outlen - optional output length in bytes, default 64
   */
  export function blake2b(
    input: Uint8Array,
    key?: Uint8Array,
    outlen?: number
  ): Uint8Array;
}

interface IContractResult {
  result: string | undefined;
  logs: Array<string>;
}

interface IFunctionParam {
  type: string;
  value: any;
}

interface IPollAccountsOptions {
  id?: string;
  tag?: number;
  sender?: string;
  creator?: string;
}

type PollWebsocketCallback = (data?: any) => void;

interface IPollAccountsCallbacks {
  onAccountUpdated?: PollWebsocketCallback;
}
interface IPollConsensusCallbacks {
  onRoundEnded?: PollWebsocketCallback;
  onRoundProposal?: PollWebsocketCallback;
}

interface IPollTransactionsCallbacks {
  onTransactionApplied?: PollWebsocketCallback;
  onTransactionRejected?: PollWebsocketCallback;
}
