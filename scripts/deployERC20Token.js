const hre = require("hardhat");

async function main() {
  
  // Attcker 0x9988708Fc0A1b97e41378C04fdCAE83F082861f3
  const deployer = "0x9988708Fc0A1b97e41378C04fdCAE83F082861f3";

  console.log("Deploying contracts with the account:", deployer);

  const ERC20Token = await ethers.getContractFactory("LOLCOIN");
  const ERC20TokenContract = await ERC20Token.deploy();

  console.log("ERC20TokenContract address:", ERC20TokenContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//npx hardhat run scripts/deployERC20Token.js --network goerli
