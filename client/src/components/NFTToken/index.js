import React, { Component } from "react";
import { PublicAddress, Blockie, Button, Input } from "rimble-ui";
import styles from "./NFTToken.module.scss";
import { isArray } from "util";
import { DH_CHECK_P_NOT_SAFE_PRIME } from "constants";

export default class NFTToken extends Component {
  state = {
    totalSupply: 0,
    userBalance: 0,
    userTokens: []
  };

  componentDidMount = async () => {
    const { networkId, accounts, balance, isMetaMask, contract } = this.props;
    let userBalance = await contract.methods.balanceOf(accounts[0]).call();
    let totalSupply = await contract.methods.totalSupply().call();
    const filterTo = { to: accounts[0] };
    const filterFrom = { from: accounts[0] };
    let userTokens;

    const countTransfersToAddress = await contract.getPastEvents("Transfer", {
      filter: filterTo,
      fromBlock: 0,
      toBlock: "latest"
    });

    const countTransfersFromAddress = await contract.getPastEvents("Transfer", {
      filter: filterFrom,
      fromBlock: 0,
      toBlock: "latest"
    });

    const getUserTokenBalance = (to, from) => {
      let obj = {};
      to.forEach(el => {
        if (obj[el.returnValues.tokenId]) {
          obj[el.returnValues.tokenId] += 1;
        } else {
          obj[el.returnValues.tokenId] = 1;
        }
      });

      from.forEach(el => {
        if (obj[el.returnValues.tokenId]) {
          obj[el.returnValues.tokenId] -= 1;
        }
      });

      return Object.keys(obj);
    };
    
    userTokens = getUserTokenBalance(countTransfersToAddress, countTransfersFromAddress);

    this.setState({ ...this.state, totalSupply, userBalance, userTokens });
  };

  listTokens = list => {
    list.map();
  };

  mintToken = async (event) => {
    console.log("Click eVent: ", event);
    const { accounts, contract, web3} = this.props;
    let color = '#'+Math.floor(Math.random()*16777215).toString(16);
    let background = '#'+Math.floor(Math.random()*16777215).toString(16);
    let seed = web3.utils.randomHex(32);
    let uri = {seed, color, background};
    uri = JSON.stringify(uri);

    let tokenId = this.state.totalSupply+1;
    console.log("Here!");
    try {
      let mint = await contract.methods.mintWithTokenURI(accounts[0],tokenId, uri).send({from: accounts[0], gas: 5000000});
      console.log(mint);
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    const { userTokens, contract } = this.props;
    // console.dir(contract);
    return (
      <div className={styles.web3}>
        <h3>NFT Token Wallet:</h3>
        <div className={styles.dataPoint}>
          <div className={styles.label}>Contract Address:</div>
          <div className={styles.valueSmall}>{contract._address}</div>
        </div>
        <div className={styles.dataPoint}>
          <div className={styles.label}>Tokens:</div>
          <div className={styles.tokenList}>
            {this.state.userTokens.map((item, i) => (
              <div className={styles.token}>
                <Blockie opts={{ seed: item, color: "#dfe", bgcolor: "#a71", size: 15, scale: 3 }} />
              </div>
            ))}
          </div>
        </div>
        <div>
        <Input type="text" placeholder="...ETH address" />
          <Button onClick={(event) => this.mintToken(event)}>Mint Token</Button>
          <Button >Send Token</Button>
        </div>

        {/* <h3> Your Web3 Info </h3>
        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Network:
          </div>
          <div className={styles.value}>
            {networkId} - {this.renderNetworkName(networkId)}
          </div>
        </div>
        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Your address:
          </div>
          <div className={styles.value}>
            <PublicAddress address={accounts[0]}/>
            <Blockie
              opts={{seed: accounts[0], size: 15, scale: 3}} />
          </div>
        </div>
        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Your ETH balance:
          </div>
          <div className={styles.value}>
            {balance}
          </div>
        </div>
        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Using Metamask:
          </div>
          <div className={styles.value}>
            {isMetaMask ? 'YES' : 'NO'}
          </div>
        </div> */}
      </div>
    );
  }
}
