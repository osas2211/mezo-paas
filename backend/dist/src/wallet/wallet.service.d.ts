import { ethers } from 'ethers';
export declare class WalletService {
    private readonly provider;
    constructor();
    generateWallet(): {
        address: string;
        privateKey: string;
        mnemonic: string | undefined;
    };
    signTransaction(privateKey: string, to: string, valueInBTC: string): Promise<string>;
    signMessage(privateKey: string, message: string): Promise<string>;
    signContractCall(privateKey: string, contractAddress: string, abi: ethers.InterfaceAbi, method: string, args: unknown[]): Promise<string>;
    getBalance(address: string): Promise<string>;
    getMUSDTokenBalance(address: string): Promise<string>;
}
