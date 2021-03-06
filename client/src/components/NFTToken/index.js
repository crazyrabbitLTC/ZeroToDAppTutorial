import React, { Component } from "react";
import { Blockie, Button, Input } from "rimble-ui";
import styles from "./NFTToken.module.scss";

export default class NFTToken extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenName: "",
      tokenSymbol: "",
      totalSupply: 0,
      userBalance: 0,
      userTokens: [],
      addressBar: "...ETH Address",
      tokenId: "",
      lastCheckedBlock: null,
      userTokenURIs: {}
    };
  }

  subscriptionTo = null;
  subscriptionFrom = null;
  subscribeToNetworkChange = null;

  componentDidMount = async () => {
    await this.userTokenBalance();
    await this.refreshOnTokenTransfer();
    await this.loadTokenDetails();
  };

  refreshOnTokenTransfer = async () => {
    const { accounts, contract } = this.props;
    const filterTo = { to: accounts[0] };
    const filterFrom = { from: accounts[0] };

    const to = await contract.events
      .Transfer({
        filter: filterTo,
        fromBlock: this.state.lastCheckedBlock + 1
      })
      .on("data", event => {
        this.userTokenBalance();
      });

    const from = await contract.events
      .Transfer({
        filter: filterFrom,
        fromBlock: this.state.lastCheckedBlock + 1
      })
      .on("data", event => {
        this.userTokenBalance();
      });

    //Store your subscriptions to be unsubscribed at unmounting
    this.subscriptionTo = to;
    this.subscriptionFrom = from;
  };

  userTokenBalance = async () => {
    const { accounts, contract, web3 } = this.props;
    let userBalance = await contract.methods.balanceOf(accounts[0]).call();
    let totalSupply = await contract.methods.totalSupply().call();
    const filterTo = { to: accounts[0] };
    const filterFrom = { from: accounts[0] };
    const lastCheckedBlock = await web3.eth.getBlockNumber();
    let userTokens;
    let userTokenURIs = {};

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

    const asyncForEach = async (array, callback) => {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    };

    const asyncTokenURILoad = async tokenArray => {
      let userTokenURIs = {};
      await asyncForEach(tokenArray, async token => {
        let tokenId = Number(token);
        userTokenURIs[tokenId] = await getTokenURI(tokenId);
      });
      return userTokenURIs;
    };

    const getTokenURI = async tokenId => {
      let uri = await contract.methods.tokenURI(tokenId).call();
      uri = JSON.parse(uri);
      return uri;
    };

    userTokenURIs = await asyncTokenURILoad(userTokens);

    this.setState({
      ...this.state,
      totalSupply,
      userBalance,
      userTokens,
      lastCheckedBlock,
      userTokenURIs
    });
  };

  loadTokenDetails = async () => {
    const { contract } = this.props;
    const tokenName = await contract.methods.name().call();
    const tokenSymbol = await contract.methods.symbol().call();
    this.setState({ ...this.state, tokenName, tokenSymbol });
  };

  handleAddressBarChange = event => {
    this.setState({ ...this.state, addressBar: event.target.value });
  };

  handleSendTokenSubmit = async event => {
    event.preventDefault();
    const { accounts, contract, web3 } = this.props;

    if (web3.utils.isAddress(this.state.addressBar)) {
      await contract.methods
        .transferFrom(accounts[0], this.state.addressBar, this.state.tokenId)
        .send({ from: accounts[0], gas: 5000000 });
      this.setState({ ...this.state, addressBar: "" });
    } else {
      this.setState({ ...this.state, addressBar: "Invalid Address" });
    }
  };

  handleSelectToken = event => {
    let tokenId = event;
    this.setState({ ...this.state, tokenId });
  };

  handleMintToken = async event => {
    const { accounts, contract, web3 } = this.props;
    let color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    let bgcolor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    let seed = web3.utils.randomHex(32);
    let uri = { seed, color, bgcolor };
    uri = JSON.stringify(uri);

    //Remember Total supply is a String here
    let tokenId = Number(this.state.totalSupply) + 1;

    try {
      await contract.methods
        .mintWithTokenURI(accounts[0], tokenId, uri)
        .send({ from: accounts[0], gas: 5000000 });
    } catch (error) {
      console.log(error);
    }
  };

  componentWillUnmount = () => {
    if (this.subscriptionFrom) this.subscriptionFrom.unsubscribe();
    if (this.subscriptionTo) this.subscriptionTo.unsubscribe();
    if (this.subscribeToNetworkChange)
      this.subscribeToNetworkChange.unsubscribe();
  };

  render = () => {
    const { contract } = this.props;
    const {
      userTokenURIs,
      userTokens,
      tokenId,
      addressBar,
      tokenName
    } = this.state;
    return (
      <div className={styles.web3}>
        <h3>{tokenName} Wallet:</h3>
        <div className={styles.dataPoint}>
          <div className={styles.label}>Contract Address:</div>
          <div className={styles.valueSmall}>{contract._address}</div>
        </div>
        <div className={styles.dataPoint}>
          <div className={styles.tokenList}>
            {userTokens.map((item, i) => {
              return (
                <div
                  className={styles.token}
                  key={userTokenURIs[item].seed}
                  onClick={event => this.handleSelectToken(item)}
                >
                  <Blockie
                    className={styles.token}
                    opts={{
                      seed: userTokenURIs[item].seed,
                      color: userTokenURIs[item].color,
                      bgcolor: userTokenURIs[item].bgcolor,
                      size: 15,
                      scale: 5
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div>
          Selected token:
          <div>{tokenId}</div>
        </div>
        <div>
          <form>
            <label>
              <Input
                type="text"
                placeholder={addressBar}
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
      </div>
    );
  };
}
