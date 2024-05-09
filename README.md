# h3-websocket-anchor-wallet-request

Define `h3` request handler where the server receives an Anchor Wallet-like object and can call `signTransaction` on it. The actual signing is performed on the client side. Uses `h3-websocket-request` under the hood.

## Install

```sh
npm install h3-websocket-anchor-wallet-request
```

## Use

Create `server/api/my-handler.ts`:

```ts
import { defineWalletRequestHandler } from "h3-websocket-anchor-wallet-request"

export default defineWalletRequestHandler<{ input: string }>(async ({ wallet, data }) => {
  // Use client-provided data.
  const tx = await prepareTransaction(wallet.publicKey, data.input)
  // Request the client to sign the transaction.
  const signedTx = await wallet.signTransaction(tx)
  const txId = await blockchain.push(signedTx)
  // Return result to the client.
  return { txId }
})
```

In the client-side code, call the handler with:

```ts
import { walletRequest } from "h3-websocket-anchor-wallet-request/client"
import { useAnchorWallet } from "solana-wallets-vue"

const wallet = useAnchorWallet()

const { txId } = await walletRequest<{ txId: string }>(
  "/my-handler",
  wallet.value,
  { input: "user input" }
)
```
