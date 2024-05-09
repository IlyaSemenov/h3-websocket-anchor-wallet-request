import { Buffer } from "node:buffer"

import { web3 } from "@coral-xyz/anchor"
import { type NamedRequestCallbacks, defineNamedRequestCallbacks, websocketRequest } from "h3-websocket-request/client"

import type { Wallet } from "../wallet-request-handler"

export async function walletRequest<T>(path: string, wallet: Wallet, data?: unknown, callbacks?: NamedRequestCallbacks) {
  return await websocketRequest<T>(
    path,
    { wallet: wallet.publicKey.toBase58(), data },
    defineNamedRequestCallbacks({
      async signTransaction(txSerialized: unknown, versioned: boolean) {
        const txBuf = Buffer.from(txSerialized as any)
        const tx = versioned ? web3.VersionedTransaction.deserialize(txBuf) : web3.Transaction.from(txBuf)
        const tx1 = await wallet.signTransaction(tx)
        return tx1.serialize()
      },
      ...callbacks,
    }),
  )
}
