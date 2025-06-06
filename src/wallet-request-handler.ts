import { Buffer } from "node:buffer"

import { web3 } from "@coral-xyz/anchor"
import type { AnchorProvider } from "@coral-xyz/anchor"
import { defineWebsocketRequestHandler } from "h3-websocket-request"
import type { WebsocketRequestContext } from "h3-websocket-request"

export type Wallet = AnchorProvider["wallet"]

export interface WalletRequestContext<T> extends WebsocketRequestContext<T> {
  wallet: Wallet
}

export type WalletRequestHandler<T> = (ctx: WalletRequestContext<T>) => Promise<unknown>

export function defineWalletRequestHandler<T>(handler: WalletRequestHandler<T>) {
  return defineWebsocketRequestHandler<{ wallet: string, data: T }>(async (ctx) => {
    const { wallet: walletAddress, data } = ctx.data
    const wallet: Wallet = {
      publicKey: new web3.PublicKey(walletAddress),
      async signTransaction(tx) {
        const versioned = tx instanceof web3.VersionedTransaction
        const tx1Serialized = await ctx.callback([
          "signTransaction",
          tx.serialize({ requireAllSignatures: false }),
          versioned,
        ])
        const tx1Buf = Buffer.from(tx1Serialized as any)
        const tx1 = versioned ? web3.VersionedTransaction.deserialize(Uint8Array.from(tx1Buf)) : web3.Transaction.from(tx1Buf)
        return tx1 as typeof tx
      },
      async signAllTransactions(txs) {
        throw new Error("Not implemented.")
        return txs
      },
    }
    return await handler({ ...ctx, data, wallet })
  })
}
