import { useContext, useState } from "react";
import { WalletContext } from "./../context/wallet";
import { useNavigate } from "react-router-dom";
import { uploadFileToIPFS, uploadJSONToIPFS } from "./pinata";
import { ethers } from "ethers";
import marketplace from "../../marketplace.json";
import styles from "./sellNFT.module.css";
//////
////

const SellNFT = () => {
  //////
  ///

  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState();
  const [message, updateMessage] = useState("");
  const [btn, setBtn] = useState(false);
  const [btnContent, setBtnContent] = useState("List NFT");
  const router = useNavigate();
  const { isConnected, signer } = useContext(WalletContext);

  /////
  async function onFileChange(e) {
    try {
      const file = e.target.files[0];
      const data = new FormData();
      data.set("file", file);
      setBtn(false);
      updateMessage("Uploading image... Please don't click anything!");
      const response = await uploadFileToIPFS(data);
      if (response.success === true) {
        setBtn(true);
        updateMessage("");
        setFileURL(response.pinataURL);
      }
    } catch (e) {
      console.log("Error during file upload...", e);
    }
  }

  //////
  ///

  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    if (!name || !description || !price || !fileURL) {
      updateMessage("Please fill all the fields!");
      return -1;
    }

    const nftJSON = {
      name,
      description,
      price,
      image: fileURL,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        return response.pinataURL;
      }
    } catch (e) {
      console.log("Error uploading JSON metadata: ", e);
    }
  }
  ///
  /////
  async function listNFT(e) {
    e.preventDefault(); // Prevents default form submission behavior
    try {
      setBtnContent("Processing...");
      const metadataURL = await uploadMetadataToIPFS();
      if (metadataURL === -1) return;

      updateMessage("Uploading NFT...Please dont click anythying!");

      let contract = new ethers.Contract(
        marketplace.address,
        marketplace.abi,
        signer
      );
      const price = ethers.parseEther(formParams.price);

      let transaction = await contract.createToken(metadataURL, price);
      await transaction.wait();

      setBtnContent("List NFT");
      setBtn(false);
      updateMessage("");
      updateFormParams({ name: "", description: "", price: "" });
      alert("Successfully listed your NFT!");
      // router.push("/");
    } catch (e) {
      alert("Upload error", e);
    }
  }
  //////
  //

  return (
    <div>
      {isConnected ? (
        <div className="bg-blue-200 min-h-screen flex items-center">
          <div className="w-full">
            <h2 className="text-center text-blue-400 font-bold text-2xl uppercase mb-10">
              Upload your NFT
            </h2>
            <div className="bg-white p-10 rounded-lg shadow md:w-3/4 mx-auto lg:w-1/2">
              {/* /////   FORM  ///////////////  */}
              <form onSubmit={listNFT}>
                <div className="mb-5">
                  <label
                    htmlFor="name"
                    className="block mb-2 font-bold text-gray-600"
                  >
                    NFT name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Put in your fullname."
                    className="border border-gray-300 shadow p-3 w-full rounded mb-"
                    value={formParams.name}
                    onChange={(e) =>
                      updateFormParams({ ...formParams, name: e.target.value })
                    }
                  />
                </div>
                {/* ////////////////////  */}
                <div className="mb-5">
                  <label
                    htmlFor="Description"
                    className="block mb-2 font-bold text-gray-600"
                  >
                    NFT description
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Put in your fullname."
                    className="border border-gray-300 shadow p-3 w-full rounded mb-"
                    value={formParams.description}
                    onChange={(e) =>
                      updateFormParams({
                        ...formParams,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                {/* ////////////////////  */}
                <div className="mb-5">
                  <label
                    htmlFor="Price"
                    className="block mb-2 font-bold text-gray-600"
                  >
                    Price (in Eth)
                  </label>
                  <input
                    type="number"
                    name="number"
                    placeholder="Put in your fullname."
                    className="border border-gray-300 shadow p-3 w-full rounded mb-"
                    value={formParams.price}
                    onChange={(e) =>
                      updateFormParams({ ...formParams, price: e.target.value })
                    }
                  />
                </div>
                {/* ////////////////////  */}
                <div className="mb-5">
                  <label
                    htmlFor="Price"
                    className="block mb-2 font-bold text-gray-600"
                  >
                    Upload NFT
                  </label>
                  <input
                    type="file"
                    name="number"
                    placeholder="Put in your fullname."
                    className="border border-gray-300 shadow p-3 w-full rounded mb-"
                    onChange={onFileChange}
                  />
                </div>
                {/* ///////////////////////  SUBMIT BTN //////////////////////// */}
                {/* 
                <button
                  type="submit"
                  className="block w-full bg-blue-500 text-white font-bold p-4 rounded-lg"
                  onClick={listNFT}
                >
                  Submit
                </button> */}

                {/* ///// */}

                <div className={styles.msg}>{message}</div>
                <button
                  type="submit"
                  className={
                    btn
                      ? `${styles.btn} ${styles.activebtn}`
                      : `${styles.btn} ${styles.inactivebtn}`
                  }
                >
                  {btnContent === "Processing..." && (
                    <span className={styles.spinner} />
                  )}
                  {btnContent}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div>Connect Your Wallet to Continue...</div>
      )}
    </div>
  );
};

export default SellNFT;
