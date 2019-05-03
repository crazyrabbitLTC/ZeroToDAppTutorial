import React, { Component } from "react";
import { PublicAddress, Blockie } from "rimble-ui";
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
    let userTokens;
    let totalSupply = await contract.methods.totalSupply().call();

    const contractEvents = [];

    const getEvent = event => {
      const obj = {
        to: event.returnValues.to,
        from: event.returnValues.from,
        tokenId: event.returnValues.tokenId
      };
      contractEvents.push(obj);
    };

    const filterTo = { to: accounts[0] };
    const filterFrom = { from: accounts[0] };

    const transfersToUser = await contract.getPastEvents("Transfer", {
      filter: filterTo,
      fromBlock: 0,
      toBlock: "latest"
    });

    const transfersFromUser = await contract.getPastEvents("Transfer", {
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

    userTokens = getUserTokenBalance(transfersToUser, transfersFromUser);

    this.setState({ ...this.state, totalSupply, userBalance, userTokens });
  };

  listTokens = (list) => {
    list.map()
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
          {this.state.userTokens.map((item,i) => <li key={i}>{item}</li>)}
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
