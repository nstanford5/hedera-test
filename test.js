/**
 * Broken: Current hypothesis is that the error is related to the account information
 *  I think we are using the account before its finalized? Or reference to the account public
 *  or private key is wrong.
 */
require('dotenv').config()
const {
  PrivateKey,
  AccountId,
  TransferTransaction,
  Hbar,
  AccountInfoQuery,
  Client,
  PublicKey,
  Cache,
  toAccountId,
} = require('@hashgraph/sdk');

// generate an ECDSA key-pair

// const newPrivateKey = PrivateKey.generateECDSA();
// console.log(`The raw private key (use this for JSON RPC wallet import): ${newPrivateKey.toStringRaw()}`);

// const newPublicKey = newPrivateKey.publicKey;

// // account publickey alias
// const aliasAccountId = newPublicKey.toAccountId(0, 0);
// console.log(`The alias account id: ${aliasAccountId}`);
// console.log(`The public key: ${newPublicKey}`);

console.log(`Starting...`);
//const operatorAccountId = AccountId._fromProtobuf(newPublicKey);
// console.log(`Operator Account Id Accepted: ${operatorAccountId}`);
// // const operatorPrivateKey = PrivateKey.fromString(newPrivateKey._key.toStringRaw());
// console.log(`Operator Private Key Accepted: ${operatorPrivateKey}`);

const operatorAccountId = '0.0.49100228';
const operatorPrivateKey = 'bf988c03f204d6fa83a8b101c2d85fc7222b790547c80115b43a6a2ade5144a9';
const pubKey = PublicKey.fromString('0268462367cde34bb7012f7b89b585879fea66d0e665e28982bba364530c36dc5a');
const aliasAccountId = pubKey.toAccountId(0, 0);

const client = Client.forTestnet();
console.log(`client set for TestNet`);
client.setOperator(operatorAccountId, operatorPrivateKey);
console.log(`setOperator complete`);

// Hbar transfers will auto-create a Hedera Account
// for long-form account Ids that do not have accounts yet
const tokenTransferTxn = async (senderAccountId, receiverAccountId, hbarAmount) => {
  console.log(`Entering tokenTransferTxn...`);
  const transferToAliasTx = new TransferTransaction()
    .addHbarTransfer(senderAccountId, new Hbar(-hbarAmount))
    .addHbarTransfer(receiverAccountId, new Hbar(hbarAmount))
    .freezeWith(client);
  console.log(`Constructor complete`);

  const signedTx = await transferToAliasTx.sign(operatorPrivateKey);
  console.log(`Signing complete`);
  const txResponse = await signedTx.execute(client);
  console.log(`execute complete`);// doesn't get here, signing the transaction returns "account not found"
  await txResponse.getReceipt(client);
  console.log(`getReceipt complete`);
}

// you need these functions to be able to use await at this level
const logAccountInfo = async(accountId) => {
  const info = await new AccountInfoQuery()
    .setAccountId(accountId)
    .execute(client);

  console.log(`The normal account ID: ${info.accountId}`);
  console.log(`Account Balance: ${info.balance}`);
}

const main = async () => {
  await tokenTransferTxn(operatorAccountId, aliasAccountId, 100);
  await logAccountInfo(aliasAccountId);
}

main();