export type UserI = {
  user: {
    wallet: WalletI | null
  } & {
    id: string
    email: string
    name: string
    createdAt: Date
    updatedAt: Date
  }
  message: string
}

export type WalletI = {
  id: string
  createdAt: Date
  updatedAt: Date
  encryptedPK: string
  address: string
  encryptedMnemonic: string
  userId: string
  balance: string
}