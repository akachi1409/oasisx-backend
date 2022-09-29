/* eslint-disable max-len */
const { Router } = require("express");
const { recoverTypedSignature_v4 } = require("eth-sig-util");
const router = new Router({ mergeParams: true });
const Transaction = require("../../models/Transaction")
const contractJson = require("../../contract/contract.json")
// const Contract = require("web3-eth-contract");
const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(process.env.ALCHEMY_URL);
// Contract.setProvider(process.env.ALCHEMY_URL);

router.get("/list", async(req, res)=>{
  console.log("Get list of transaction.")
  try{
    Transaction.find({}, (err, transactions)=>{
      if (err){
        return res.status(500).json({ success: false, error: "Server error" });
      }
      res.json({success: true, transactions: transactions})
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
})
router.post("/verify", async (req, res) => {
  try{
    const sign = req.body.sign;
    const msgParams = req.body.msgParams
    console.log("MsgParams:", msgParams);
    console.log("TYPED SIGNED:" +(sign));

    const data = JSON.parse(msgParams);
    const recovered = recoverTypedSignature_v4({
      data: data,
      sig: sign,
    });
    console.log("recovered", recovered);

    const tokenID = data.message.tokenID;
    const minter = data.message.minter;
    console.log("minter", minter, tokenID);
    if (minter == recovered){
      
      const newTransaction = new Transaction ({
        signer: minter,
        tokenID: tokenID,
      })
      await newTransaction.save();
      const account = web3.eth.accounts.privateKeyToAccount('0x' + process.env.P_KEY);
      web3.eth.accounts.wallet.add(account);
      console.log("Account:", account);
      web3.eth.defaultAccount = account.address;
      var contract =  new web3.eth.Contract(
        contractJson, 
        process.env.CONTEACT_URL, {
          from: web3.eth.defaultAccount
        });
      await contract.methods.mint(
        minter, 1
      )
      .send({
        from : web3.eth.defaultAccount,
        gasLimit: "100000",
        gas: 300000,
        gasPrice: '10000000000'
      },async function(err, result) {
                const transaction =await Transaction.findOne({
                  signer: minter,
                  tokenID: tokenID
                })
                if (err) {
                  if (transaction){
                    transaction.status = 2;
                  }
                  console.error(err);
                  return res.json({success:true, message: "Get error in minting : " + err})
                }
                else {
                  console.log("Result:", result);
                  if (transaction){
                    transaction.hash = result;
                    transaction.status = 3;
                  }
                  await transaction.save();
                  return res.json({success:true, message: "Success in Minting with " + minter + " with token ID " + tokenID + "in hash " + result})
                }
            })
      // return res.json({success:true})
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
  
});
module.exports = router;
