import { useContext, useEffect, useState } from "react";
import { WalletContext } from "../context/wallet";
import MarketplaceJson from "../../marketplace.json";
import { ethers } from "ethers";
import axios from "axios";
import NFTCard from "./NFTCard";
///
//
const MarketPlace = () => {
  ////////
  ////
  const [items, setItems] = useState();
  const { isConnected, signer } = useContext(WalletContext);

  ////
  ///

  async function getNFTitems() {
    const itemsArray = [];
    if (!signer) return;
    let contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );

    /////

    let transaction = await contract.getAllListedNFTs();
    for (const i of transaction) {
      const tokenId = parseInt(i.tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      const meta = (await axios.get(tokenURI)).data;
      const price = ethers.formatEther(i.price);

      const item = {
        price,
        tokenId,
        seller: i.seller,
        owner: i.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
      };

      itemsArray.push(item);
    }
    return itemsArray;
  }
  ////////////////
  /////
  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsArray = await getNFTitems();
        setItems(itemsArray);
      } catch (error) {
        console.error("Error fetching NFT items:", error);
      }
    };

    fetchData();
  }, [isConnected]);

  ////////////////
  /////
  return (
    <div>
      {" "}
      <div>
        {isConnected ? (
          <>
            <div className="p-5">
              <h2>NFT Marketplace</h2>
              {items?.length > 0 ? (
                <div className="grid grid-cols-3">
                  {items?.map((value, index) => (
                    <NFTCard item={value} key={index} />
                  ))}
                </div>
              ) : (
                <div className="text-xl text-center m-auto">
                  No NFT Listed Now...
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-xl text-center m-auto">
            You are not connected...
          </div>
        )}
      </div>
    </div>
  );
};
export default MarketPlace;
