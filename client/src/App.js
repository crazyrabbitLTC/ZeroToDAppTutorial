import React, { Component } from "react";
import getWeb3, { getGanacheWeb3 } from "./utils/getWeb3";
import NFTToken from "./components/NFTToken/index";
import { Loader } from "rimble-ui";

import styles from "./App.module.scss";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storageValue: 0,
      web3: null,
      accounts: null,
      contract: null,
      route: window.location.pathname.replace("/", ""),
      appReady: false
    };
  }

  getGanacheAddresses = async () => {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  };

  componentDidMount = async () => {
    let appReady = false;
    const loadApp = async () => {
      try {
        const isProd = process.env.NODE_ENV === "production";
        if (!isProd) {
          // Get network provider and web3 instance.
          const web3 = await getWeb3();
          const ganacheAccounts = await this.getGanacheAddresses();
          // Use web3 to get the user's accounts.
          const accounts = await web3.eth.getAccounts();
          // Get the contract instance.
          const networkId = await web3.eth.net.getId();
          const isMetaMask = web3.currentProvider.isMetaMask;
          let balance =
            accounts.length > 0
              ? await web3.eth.getBalance(accounts[0])
              : web3.utils.toWei("0");
          balance = web3.utils.fromWei(balance, "ether");

          ///ADD HERE:
          const NFTToken = require("../../contracts/NFTToken.sol");
          let deployedNetwork = null;
          let instance = null;

          if (NFTToken.networks) {
            deployedNetwork = NFTToken.networks[networkId.toString()];
            if (deployedNetwork) {
              instance = new web3.eth.Contract(
                NFTToken.abi,
                deployedNetwork && deployedNetwork.address
              );
              appReady = true;
            }
            if (window.ethereum) {
              window.ethereum.on("accountsChanged", function(accounts) {
                window.location.reload();
              });
            }
          }
          this.setState({
            web3,
            ganacheAccounts,
            accounts,
            contract: instance,
            balance,
            networkId,
            isMetaMask,
            appReady
          });
        }
      } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(error);
      }
    };

    loadApp();
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  renderLoader() {
    return (
      <div className={styles.loader}>
        <Loader size="80px" color="red" />
        <h3> Loading Web3, accounts, and contract...</h3>
        <p> Unlock your metamask </p>
      </div>
    );
  }

  render() {
    if (!this.state.web3) {
      return this.renderLoader();
    }
    return (
      <div className={styles.App}>
        <h1>Token Wallet</h1>

        {/* <Web3Info {...this.state} /> */}
        {this.state.appReady ? (
          <NFTToken {...this.state} />
        ) : (
          <div>App not Ready</div>
        )}
      </div>
    );
  }
}

export default App;
