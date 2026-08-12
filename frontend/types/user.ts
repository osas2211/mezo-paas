export type UserI = {
  user: {
    wallet: WalletI | null
  } & {
    id: string
    email: string
    name: string
    createdAt: Date
    updatedAt: Date
    role: RoleEnum;
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
  creditBalance: string
  stakedBalance: string
}

export type TransactionI = {
  id: string
  userId: string
  amount: string
  type: TransactionType
  status: TransactionStatus
  action: TransactionAction
  title: string
  createdAt: Date
  updatedAt: Date
}

export enum RoleEnum {
  REGULAR_DEVELOPER = "REGULAR_DEVELOPER",
  PRO_DEVELOPER = "PRO_DEVELOPER",
}

export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}
export enum TransactionStatus {
  Pending = "Pending",
  Success = "Success",
  Failed = "Failed",
}
export enum TransactionAction {
  Transfer = "Transfer",
  Deposit = "Deposit",
  Withdraw = "Withdraw",
  Billing = "Billing",
  Stake = "Stake",
}
