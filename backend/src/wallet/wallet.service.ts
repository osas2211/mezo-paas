import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { env_config } from 'src/lib/config';

@Injectable()
export class WalletService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(env_config.mezoRpcUrl);
  }

  generateWallet() {
    const wallet = ethers.Wallet.createRandom(this.provider);

    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic?.phrase,
    };
  }

  async signTransaction(
    privateKey: string,
    to: string,
    valueInBTC: string, // BTC is gas token on Mezo
  ) {
    const wallet = new ethers.Wallet(privateKey, this.provider);

    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(valueInBTC),
    });

    return tx.hash;
  }

  async signMessage(privateKey: string, message: string) {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    return await wallet.signMessage(message);
  }

  async signContractCall(
    privateKey: string,
    contractAddress: string,
    abi: ethers.InterfaceAbi,
    method: string,
    args: unknown[],
  ): Promise<string> {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    const contract = new ethers.Contract(contractAddress, abi, wallet);
    const tx = await contract[method](...args);
    return tx.hash;
  }
}
