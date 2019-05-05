import React, { Component } from "react";
import { PublicAddress, Blockie, Button, Input } from "rimble-ui";
import styles from "./NFTToken.module.scss";
import { isArray } from "util";
import { DH_CHECK_P_NOT_SAFE_PRIME } from "constants";

export default class NFTToken extends Component {
  state = {
    totalSupply: 0,
    userBalance: 0,
    userTokens: [],
    addressBar: "...ETH Address",
    tokenId: "",
    lastCheckedBlock: null
  };

  subscriptionTo = null;
  subscriptionFrom = null;

  componentDidMount = async () => {
    await this.userTokenBalance();
    await this.refreshOnTokenTrasnfer();
  };

  async refreshOnTokenTrasnfer() {
    const { accounts, contract } = this.props;
    const filterTo = { to: accounts[0] };
    const filterFrom = { from: accounts[0] };

    const to = await contract.events
      .Transfer({
        filter: filterTo,
        fromBlock: this.state.lastCheckedBlock + 1
      })
      .on("data", event => {
        // Check out your Event
        // console.log(event);
      });

    const from = await contract.events
      .Transfer({
        filter: filterFrom,
        fromBlock: this.state.lastCheckedBlock + 1
      })
      .on("data", event => {
        // Check out your Event
        // console.log(event);
      });

    //Store your subscriptions to be unsubscribed at unmounting
    this.subscriptionTo = to;
    this.subscriptionFrom = from;

    //Here are your subscriptions for cleanup
    //console.log("TO/FROM: ", to, from);
  }

  async userTokenBalance() {
    const { accounts, contract, web3 } = this.props;
    let userBalance = await contract.methods.balanceOf(accounts[0]).call();
    let totalSupply = await contract.methods.totalSupply().call();
    const filterTo = { to: accounts[0] };
    const filterFrom = { from: accounts[0] };
    const lastCheckedBlock = await web3.eth.getBlockNumber();
    let userTokens;

    //Get the list of tokens sent to this address
    const countTransfersToAddress = await contract.getPastEvents("Transfer", {
      filter: filterTo,
      fromBlock: 0,
      toBlock: "latest"
    });

    //Get the list of tokens this address sent away
    const countTransfersFromAddress = await contract.getPastEvents("Transfer", {
      filter: filterFrom,
      fromBlock: 0,
      toBlock: "latest"
    });

    //Function to Calculate the Total Users Balance
    const getTokenBalance = (to, from) => {
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

      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] === 0) {
            delete obj[key];
          }
        }
      }

      return Object.keys(obj);
    };

    //Get Users token balance
    userTokens = getTokenBalance(
      countTransfersToAddress,
      countTransfersFromAddress
    );

    this.setState({
      ...this.state,
      totalSupply,
      userBalance,
      userTokens,
      lastCheckedBlock
    });
  }

  handleAddressBarChange = event => {
    console.log("The change is: ", event.target.value);
    this.setState({ ...this.state, addressBar: event.target.value });
  };

  handleSendTokenSubmit = async event => {
    event.preventDefault();
    const { accounts, contract, web3 } = this.props;

    if (web3.utils.isAddress(this.state.addressBar)) {
      let tx = contract.methods
        .transferFrom(accounts[0], this.state.addressBar, this.state.tokenId)
        .send({ from: accounts[0], gas: 5000000 });
      console.log(tx);
      this.setState({ ...this.state, addressBar: "" });
    } else {
      let addressBar = "Invalid Address";
      this.setState({ ...this.state, addressBar });
    }
  };

  handleSelectToken = event => {
    let tokenId = event;
    this.setState({ ...this.state, tokenId });
  };

  handleMintToken = async event => {
    const { accounts, contract, web3 } = this.props;
    let color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    let background = "#" + Math.floor(Math.random() * 16777215).toString(16);
    let seed = web3.utils.randomHex(32);
    let uri = { seed, color, background };
    uri = JSON.stringify(uri);

    let tokenId = this.state.totalSupply + 1;

    try {
      let mint = await contract.methods
        .mintWithTokenURI(accounts[0], tokenId, uri)
        .send({ from: accounts[0], gas: 5000000 });
    } catch (error) {
      console.log(error);
    }
  };

  componentWillUnmount() {
    if (this.subscriptionFrom) this.subscriptionFrom.unsubscribe();
    if (this.subscriptionTo) this.subscriptionTo.unsubscribe();
  }

  render() {
    const { userTokens, contract } = this.props;
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
              <div
                className={styles.token}
                onClick={event => this.handleSelectToken(item)}
              >
                <Blockie
                  className={styles.token}
                  opts={{
                    seed: item,
                    color: "#dfe",
                    bgcolor: "#a71",
                    size: 15,
                    scale: 3
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          Selected token:
          <div>{this.state.tokenId}</div>
        </div>
        <div>
          <form>
            <label>
              Name:
              <Input
                type="text"
                placeholder={this.state.addressBar}
                name="name"
                onChange={this.handleAddressBarChange}
              />
            </label>
          </form>
          <Button onClick={event => this.handleMintToken(event)}>
            Mint Token
          </Button>
          <Button
            onClick={event => this.handleSendTokenSubmit(event)}
            value="Submit"
          >
            Send Token
          </Button>
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
