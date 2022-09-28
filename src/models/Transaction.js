const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    signer: {type:String, required: true},
    tokenID: {type: Number, required: true}, 
    status: {type: Number, default:1},
    // 1 for request, 2 for fail, 3 for minted
})

const Transaction = mongoose.model("Transaction", transactionSchema)
module.exports = Transaction;