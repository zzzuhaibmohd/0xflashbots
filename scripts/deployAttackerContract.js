const hre = require("hardhat");

async function main() {
  
  // Attcker 0x4d1de8Ed2B90B368aB65F675d981ad8C6FFA2C26
  const deployer = "0x4d1de8Ed2B90B368aB65F675d981ad8C6FFA2C26";

  console.log("Deploying contracts with the account:", deployer);

  const FundMe = await ethers.getContractFactory("FundMe");
  const FundMeContract = await FundMe.deploy();

  console.log("FundMe Contract address:", FundMeContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//npx hardhat run scripts/deployAttackerContract.js --network goerli
