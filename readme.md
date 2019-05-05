Zero To DApp! 

A ZepKit, ZeppelinOS tutorial

--tutorial in process

Requirements: 
npm install -g zos
npm install -g truffle
npm install -g ganache-cli 

Start ganache-cli

ganache-cli --deterministic

zos session --network development --timeout 3600

zos push --deploy-dependencies

zos create NFTToken
(save the address this returns) 

Enter Truffle Console:

let instance = await NFTToken.at('the address returned by zos command')

//initialize your instance

instance.initialize("Token Name", "Token Symbol", ['Address of minters(metamask)'], ['address of pausers']

//Send your metamask some tokens

web3.eth.sendTransaction({from: 'Ganache Address', to: 'Metamask address', value: 1e18})

//New terminal window

cd client

npm run start

//Browser should open and wallet should be running


