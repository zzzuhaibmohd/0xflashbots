const { ethers, providers, Wallet, utils, Transaction } = require("ethers");
const { FlashbotsBundleProvider, FlashbotsBundleResolution } = require("@flashbots/ethers-provider-bundle");
const { exit } = require("process")
require('dotenv').config()

const FLASHBOT_URL = process.env.FLASHBOT_RPC;
const hahaToken = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

const main = async () => {
    if(process.env.SPONSOR_PRIVATE_KEY === undefined || process.env.VICTIM_PRIVATE_KEY === undefined){
        console.log("Please set the SPONSOR_PRIVATE_KEY / VICTIM_KEY");
        exit(1);
    }

    //using the Goerli public rpc endpoint
    const provider = new providers.JsonRpcProvider("https://rpc.goerli.mudit.blog");

    //Identify using "authSigner" to the flashbot miner and sign the transaction bundle
    const authSigner = Wallet.createRandom();

    const flashbotProvider = await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        FLASHBOT_URL
    );

    const sponsor = new Wallet(process.env.SPONSOR_PRIVATE_KEY).connect(provider);
    const victim = new Wallet(process.env.VICTIM_PRIVATE_KEY).connect(provider);

    //custom ABI that helps with transfer of tokens & checking current balance of an address
    //create an interface for the ABI
    const customABI = [
        "function transfer(address to, uint256 amount) external returns (bool)",
        "function balanceOf(address account) external view returns (uint256)"
    ];
    const iface = new utils.Interface(customABI);

    provider.on("block", async (blockNumber) => {
        console.log("BLOCK#" , blockNumber);

        //the blockNumber we want our tx bundle to be part of
        //we keep pushing this transaction to every new block that is mined until our tx is mined
        const targetBlockNumber = blockNumber + 1;

        // Code to check hahaToken balance of the Victim
        // const hahaTokenContract = new ethers.Contract(hahaToken, customABI, provider);

        // const victimBalance = (await hahaTokenContract.balanceOf(victim.address)).toString();
        // console.log(victimBalance);

        // the values for maxFeePerGas and maxPriorityFeePerGas are hardcoded
        // I will update the code to pick calculate this dynamically
        const sendTxBundle = await flashbotProvider.sendBundle([
                {
                    signer: sponsor,
                    transaction: {
                        chainId: 5,
                        type: 2,
                        to: victim.address,
                        value: utils.parseEther("0.01"),
                        maxFeePerGas: utils.parseUnits("3", "gwei"),                  
                        maxPriorityFeePerGas: utils.parseUnits("2", "gwei")
                    }
                },
                {
                    signer: victim,
                    transaction: {
                        chainId: 5,
                        type: 2,
                        to: hahaToken,
                        gasLimit: "50000",
                        data: iface.encodeFunctionData("transfer", [
                            sponsor.address,
                            utils.parseEther("0.01"),
                        ]),
                        maxFeePerGas: utils.parseUnits("3", "gwei"),                  
                        maxPriorityFeePerGas: utils.parseUnits("2", "gwei"),
                        nonce: await provider.getTransactionCount(victim.address)
                    }
                },
            ],
            targetBlockNumber
        );

        if ("error" in sendTxBundle){
            console.log(sendTxBundle.error.message);
            return;
        }

        //wait for the txResponse
        const ackTx = await sendTxBundle.wait();
        if(ackTx === FlashbotsBundleResolution.BundleIncluded){
            console.log("Message included in the BLOCK#" + targetBlockNumber);
            exit(0);
        }
        else if(ackTx === FlashbotsBundleResolution.BlockPassedWithoutInclusion){
            console.log("Message not included in the BLOCK#" + targetBlockNumber);
        }
        else if(ackTx === FlashbotsBundleResolution.AccountNonceTooHigh){
            console.log("Nonce TOO HIGH!!!");
            exit(1);
        }

    });
};

main();