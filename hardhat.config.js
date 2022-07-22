require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: process.env.ATTACKER_RPC_URL,
      accounts: [process.env.ATTACKER_PRIVATE_KEY]
    }
  }
};
