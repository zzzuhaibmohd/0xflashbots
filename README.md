# 0xFlashBots

Imagine your private key has been compromised and the ETH has been completely drained from your wallet by the attacker. You have some other valuable tokens still in the wallet of which the attacker is not aware. You need to send some ETH to transfer these tokens but the attacker is listening to the mempool for any incoming ETH deposits to the wallet and transfers the ETH to their account as soon as you make a deposit. 

Flashbots provides a solution to this problem by hiding these transactions from the public mempool and also bundling the transactions. So, a user can basically fund the wallet in the first transaction and then transfer the tokens in the second transaction. Flashbots makes sure that these bundled transactions are executed in the same block.

`Fundme.sol` is the attacker's malicious smart contract where the users funds are being sent. 
`LolCoin.sol` is the ERC20 token I created using Openzeppelin Contracts Wizard.

`deployAttackerContract.js` and `deployERC20Token.js` are the deploy scripts for the above mentioned contracts.

To run the attacker bot, execute the below command. Any ETH sent to the compromised address is drained.

`node src/bot.js`

To run the flashBot bundled transaction, execute the below command. 

`node src/flashbot.js`


