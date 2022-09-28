/* eslint-disable max-len */
const { Router } = require("express");
const { recoverTypedSignature_v4 } = require("eth-sig-util");
const router = new Router({ mergeParams: true });
const Transaction = require("../../models/Transaction")
const contractJson = require("../../contract/contract.json")
const Contract = require("web3-eth-contract");
Contract.setProvider(process.env.ALCHEMY_URL);

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

      var contract = new Contract(contractJson, process.env.CONTRACT_URL);
      return res.json({success:true})
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
  
});
module.exports = router;
