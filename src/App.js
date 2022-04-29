/* global AlgoSigner */
import './App.css';
import {Button, Container, Header, Message} from "semantic-ui-react";
import {useState, useCallback} from "react";
const algosdk = require('algosdk');

const server = "https://testnet-algorand.api.purestake.io/ps2";
const port = "";
const token = {
	"x-api-key": "2LxTVLTC1B7dcrl3Zljj517E9uqYjP8A6vjt6PAm" // fill in yours
};
let client = new algosdk.Algodv2(token, server, port);
/**
 * React Component displaying a title, a button doing some (AlgoSigner-related) actions
 * and a message with the result.
 *
 * @param buttonAction is a (potentially async) function called when clicking on the button
 *   and returning the result to be displayed
 */
const ExampleAlgoSigner = ({title, buttonText, buttonAction}) => {
  const [result, setResult] = useState("");

  const onClick = useCallback(async () => {
    const r = await buttonAction();
    setResult(r);
  }, [buttonAction]);

  return (
    <>
      <Header as="h2" dividing>{title}</Header>
      <Button primary={true} onClick={onClick}>{buttonText}</Button>
      <Message>
        <code>
          {result}
        </code>
      </Message>
    </>
  );
};

// The following components are all demonstrating some features of AlgoSigner

const CheckAlgoSigner = () => {
  const action = useCallback(() => {
    if (typeof AlgoSigner !== 'undefined') {
      return "AlgoSigner is installed.";
    } else {
      return "AlgoSigner is NOT installed.";
    }
  }, []);

  return <ExampleAlgoSigner title="CheckAlgoSigner" buttonText="Check" buttonAction={action}/>
};

const ConnectAlgoSigner = () => {
  const action = useCallback(async () => {
    try {
      const r = await AlgoSigner.connect();
      return JSON.stringify(r, null, 2);
    } catch (e) {
      console.error(e);
      return JSON.stringify(e, null, 2);
    }
  }, []);

  return <ExampleAlgoSigner title="Connect to AlgoSigner" buttonText="Connect" buttonAction={action}/>
};

const GetAccounts = () => {
  const action = useCallback(async () => {
    try {
      const r = await AlgoSigner.accounts({
        ledger: 'TestNet'
      });
      return JSON.stringify(r, null, 2);
    } catch (e) {
      console.error(e);
      return JSON.stringify(e, null, 2);
    }
  }, []);

  return <ExampleAlgoSigner title="Get TestNet Accounts" buttonText="Get Accounts" buttonAction={action}/>
};

const GetStatus = () => {

  const action = useCallback(async () => {
    let tparams = await client.getTransactionParams().do();
    const r = await AlgoSigner.accounts({
      ledger: 'TestNet'
    });

    const paytxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from:  r[0].address.toString(),
      to: "UTZQAOKXMQR7VQJZUNXH7FGMKORDNKHCHAQUAUPAZGXS4GACFRZDJQSPYM",
      amount: 100000 * 0.9,
      suggestedParams: {...tparams}
    });

    const paytxn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from:  r[0].address.toString(),
      to: "UTZQAOKXMQR7VQJZUNXH7FGMKORDNKHCHAQUAUPAZGXS4GACFRZDJQSPYM",
      amount: 100000 * 0.1,
      suggestedParams: {...tparams}
    });

    let params = await client.getTransactionParams().do();
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: r[0].address.toString(),
      assetName: 'MD',
      unitName: 'Mintdrop',
      total: 1,
      decimals: 0,
      note: AlgoSigner.encoding.stringToByteArray("This is a Mintdropz NFT"),
      defaultFrozen: false,
      assetURL: `https://gateway.pinata.cloud/ipfs/QmeXCbDBtUEphoi7t3LkHkSTYvBU9nHuZrpXFdwmZxhUGS`,
      suggestedParams: { ...params }
    });

    // let group = algosdk.assignGroupID([paytxn,txn])
    let paytxn_b64 = AlgoSigner.encoding.msgpackToBase64(paytxn.toByte());
    let txn_b64 = AlgoSigner.encoding.msgpackToBase64(txn.toByte());
    let pay1 = AlgoSigner.encoding.msgpackToBase64(paytxn1.toByte())
    let paysignedTxs
    let signedTxs
    let paysignedTxs1
    await AlgoSigner.signTxn([{txn: paytxn_b64}])
    .then((d) => {
      console.log("good")
      paysignedTxs = d;
    })
    .then(()=>{
      AlgoSigner.signTxn([{txn: txn_b64}])
      .then((result) => {
        console.log("2")
        signedTxs = result;
      })
      .then(async()=>{
       AlgoSigner.signTxn([{txn: pay1}])
       .then(async(result)=>{
        paysignedTxs1 = result
        await AlgoSigner.send({
          ledger: 'TestNet',
          tx: paysignedTxs[0].blob
        })
        .then(async(result) => {
          console.log(result.txId);
         await AlgoSigner.send({
           ledger: 'TestNet',
           tx:paysignedTxs1[0].blob
         })
         .then(async(result)=>{
          console.log(result.txId);
          await AlgoSigner.send({
            ledger: 'TestNet',
            tx: signedTxs[0].blob
          })
          .then((result) => {
            console.log(result.txId);
            
          })
         })
        })
        .catch((e) => {
          console.error(e);
          return;
        });
       })
      })
    })
    console.log("dddd")
    // Use the AlgoSigner encoding library to make the transactions base64
    // let paytxn_b64 = AlgoSigner.encoding.msgpackToBase64(paytxn.toByte());
    // let paysignedTxs
    // await AlgoSigner.signTxn([{txn: paytxn_b64}])
    // .then((d) => {
    //   console.log("good")
    //   paysignedTxs = d;
    // })
    // .catch((e) => {
    //     console.error(e);
    // });

    

    // let signedTxs;
    
    // console.log("goods",r[0])
    
    // let txn_b64 = AlgoSigner.encoding.msgpackToBase64(txn.toByte());
    // let txId;
    // await AlgoSigner.signTxn([{txn: paytxn_b64},{txn: txn_b64}])
    // .then((result) => {
    //   signedTxs = result;
    //   console.log(result)
    // })
    // .catch((e) => {
    //   console.error(e);
    //   return;
    // });
    // await AlgoSigner.send({
    //   ledger: 'TestNet',
    //   tx: signedTxs[0].blob
    // })
    // .then((result) => {
    //   txId = result.txId;
    // })
    // .catch((e) => {
    //   console.error(e);
    //   return;
    // });
    
        
    try {
      const r = await AlgoSigner.algod({
        ledger: 'TestNet',
        path: '/v2/status'
      });
      return JSON.stringify(r, null, 2);
    } catch (e) {
      console.error(e);
      return JSON.stringify(e, null, 2);
    }
  }, []);

  return <ExampleAlgoSigner title="Get TestNet Algod Status" buttonText="Get Status" buttonAction={action}/>
};

const App = () => {
  return (
    <Container className="App">
      <Header as="h1" dividing>Simple React Examples Using AlgoSigner</Header>
      <p>
        This React App shows some very simple examples using AlgoSigner.
        See <a
        href="https://purestake.github.io/algosigner-dapp-example">https://purestake.github.io/algosigner-dapp-example</a> for
        more examples.
      </p>

      <p>
        <a href="https://github.com/fabrice102/algosigner-dapp-react-example">See code in GitHub.</a>
      </p>

      <CheckAlgoSigner/>

      <ConnectAlgoSigner/>

      <GetAccounts/>

      <GetStatus/>
    </Container>
  );
};

export default App;
