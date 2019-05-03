const { BN, constants, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const should = require('chai').should();

const NFTToken = artifacts.require('NFTToken');

contract("NFTToken", async ([_, owner, ...otherAccounts]) => {
  let NFT;
  const tokenName = "NFTToken";
  const tokenSymbol = "NFT";
  const minters = [owner];
  const pausers = [owner];
  const tokenURI = "Test URI";

  before(async function () {
    NFT = await NFTToken.new();

    NFT.methods["initialize(string,string,address[],address[])"](tokenName,tokenSymbol,minters,pausers, { from: owner, gas: 5000000 });
  });
  
  it("should have proper owner", async () => {
    (await NFT.owner()).should.equal(owner);
  });

  it("should have proper name", async () => {
    (await NFT.name()).should.equal(tokenName);
  });

  it("should have proper symbol", async () => {
    (await NFT.symbol()).should.equal(tokenSymbol);
  });

  it("should mint a NFT with URI ", async () => {
    const tokenId = 1;
    (await NFT.mintWithTokenURI(owner, tokenId, tokenURI, {from: owner}));
    (await NFT.tokenURI(tokenId)).should.equal(tokenURI);
  });


});