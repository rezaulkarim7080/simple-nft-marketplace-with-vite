import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { WalletContext } from "../context/wallet";
import GetIpfsUrlFromPinata from "../../utils";
import MarketplaceJson from "../../marketplace.json";
import { ethers } from "ethers";
import axios from "axios";

//////////////////
//
const NftDetails = () => {
  //////////////////
  const params = useParams();
  const tokenId = params.tokenId;
  const [item, setItem] = useState();
  const [msg, setmsg] = useState();
  const [btnContent, setBtnContent] = useState("Buy NFT");
  const { isConnected, userAddress, signer } = useContext(WalletContext);
  const router = useNavigate();

  /////////////////
  async function getNFTData() {
    if (!signer) return;
    let contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );
    let tokenURI = await contract.tokenURI(tokenId);
    console.log(tokenURI);
    const listedToken = await contract.getNFTListing(tokenId);
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    console.log(tokenURI);
    const meta = (await axios.get(tokenURI)).data;
    const item = {
      price: meta.price,
      tokenId,
      seller: listedToken.seller,
      owner: listedToken.owner,
      image: meta.image,
      name: meta.name,
      description: meta.description,
    };
    return item;
  }
  //////////////////
  useEffect(() => {
    async function fetchData() {
      if (!signer) return;
      try {
        const itemTemp = await getNFTData();
        setItem(itemTemp);
      } catch (error) {
        console.error("Error fetching NFT items:", error);
        setItem(null);
      }
    }

    fetchData();
  }, [isConnected]);

  /////////////////////
  async function buyNFT() {
    try {
      if (!signer) return;
      let contract = new ethers.Contract(
        MarketplaceJson.address,
        MarketplaceJson.abi,
        signer
      );
      const salePrice = ethers.parseUnits(item.price, "ether").toString();
      setBtnContent("Processing...");
      setmsg("Buying the NFT... Please Wait (Upto 5 mins)");
      let transaction = await contract.executeSale(tokenId, {
        value: salePrice,
      });
      await transaction.wait();
      alert("You successfully bought the NFT!");
      setmsg("");
      setBtnContent("Buy NFT");
      router.push("/");
    } catch (e) {
      console.log("Buying Error: ", e);
    }
  }
  /////////
  ////
  return (
    <div className="p-10">
      {isConnected ? (
        <div className="flex items-center justify-between gap-5">
          <img
            src={item?.image}
            alt=""
            width={600}
            height={520}
            className="rounded-2xl"
          />
          <div>
            <div>
              <div>
                <span>Name:</span>
                <span className="text-xl">{item?.name}</span>
              </div>
              <div>
                <span>Description:</span>
                <span className="text-xl"> {item?.description}</span>
              </div>
              <div>
                <span>Price:</span>
                <span className="text-xl font-medium">{item?.price} ETH</span>
              </div>
              <div>
                <span>Seller:</span>
                <span>{item?.seller}</span>
              </div>
            </div>
            <div>
              <div>{msg}</div>
              {userAddress.toLowerCase() === item?.seller.toLowerCase() ? (
                <div className="text-green-600 text-xl font-medium">
                  You already Own!
                </div>
              ) : (
                <button
                  onClick={() => {
                    buyNFT();
                  }}
                >
                  {btnContent === "Processing..." && <span />}
                  {btnContent}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>You are not connected...</div>
      )}
    </div>
  );
};

export default NftDetails;
