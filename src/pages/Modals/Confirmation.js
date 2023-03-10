import React, { useRef } from "react";
import { identity } from "bitclout-sdk";
import { CgCloseO } from "react-icons/cg";
import "./Confirmation.css";

const host = "https://deso-backend.herokuapp.com";
const recieverAddress =
  "BC1YLh89nsbp6TYyoPUu4UXUSdaCSP7eN5rkMGgZuQSRQgpp3ibf9P6";
const Confirmation = ({
  handleModal,
  ukey,
  handleData,
  NotificationManager,
}) => {
  const closeRef = useRef(null);

  const getTransactionHex = async () => {
    try {
      const response = await fetch(`${host}/api/v0/send-deso`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          SenderPublicKeyBase58Check: ukey,
          RecipientPublicKeyOrUsername: recieverAddress,
          AmountNanos: 2000000000,
          // AmountNanos: 300000,
          MinFeeRateNanosPerKb: 1000,
        }),
      });
      const json = await response.json();
      console.log(json);
      if (json.error) {
        NotificationManager.error("Insufficient Balance.", "Sorry!");
      } else {
        const transHex = await json.TransactionHex;
        console.log(transHex);
        const approve = await identity.launch(`/approve?tx=${transHex}`);
        // console.log(approve);
        const signedTransHex = await approve.signedTransactionHex;
        console.log(signedTransHex);
        if (signedTransHex) {
          console.log("valid");
          handleData(signedTransHex, true, 1);
        } else {
          console.log("false,transhex");
        }
        const resp = await fetch(`${host}/api/v0/submit-transaction`, {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            TransactionHex: signedTransHex,
          }),
        });
        // console.log(hex);
        console.log(resp);
        // console.log(validity);
      }
    } catch (error) {
      console.log(
        "Unable to mint from your DESO account ! Please check your wallet !",
        1000
      );
    }
  };

  const handleAllowBtn = async () => {
    console.log("allowbutton clicked");
    getTransactionHex();
    closeRef.current.click();
  };
  return (
    <>
      <div className="modalBackground">
        <div className="modalContainer">
          <div className="titleCloseBtn">
            <button
              onClick={() => {
                handleModal(false);
              }}
            >
              <CgCloseO size={35} style={{ color: "#032854" }} />
            </button>
          </div>
          <div className="titleconfirmation">
            <h1>Are you sure to continue?</h1>
          </div>
          <div className="body">
            <p>
              Please allow access to your account to mint NFT. We are requesting
              you to grant<b> 2 $DESO</b> for NFT to mint.
            </p>
          </div>
          <div className="footer">
            <button
              onClick={() => {
                handleModal(false);
              }}
              id="cancelBtn"
              ref={closeRef}
            >
              Cancel
            </button>
            <button onClick={handleAllowBtn}>Allow</button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Confirmation;
