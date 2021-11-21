import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "@symfoni/hardhat-react";
import "hardhat-typechain";
import "@typechain/ethers-v5";

// require('hardhat-ethernal');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      chainId: 1337,
      accounts: [{
        balance: "10000000000000000000000",
        privateKey: "0xe87d780e4c31c953a68aef2763df56599c9cfe73df4740fc24c2d0f5acd21bae",
      }, {
        balance: "10000000000000000000000",
        privateKey: "0xe87d780e4c31c953a68aef2763df56599c9cfe73df4740fc24c2d0f5acd21eee",
      },{
        balance: "10000000000000000000000",
        privateKey: "0xe87d780e4c31c953a68aef2763df56599c9cfe73df4740fc24c2d0f5acd21eaa",
      },{
        balance: "10000000000000000000000",
        privateKey: "0xe87d780e4c31c953a68aef2763df56599c9cfe73df4740fc24c2d0f5acd21eea",
      }]
    },
    devmoon: {
      url: 'http://127.0.0.1:9933',
      chainId: 1281,
      accounts: ["0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133"]
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
          },
        },
      },
    ],
  },
};

export default config;
