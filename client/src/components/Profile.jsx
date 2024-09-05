import { useContext, useEffect, useState } from "react";

import { WalletContext } from "../context/wallet";

import MarketplaceJson from "../../marketplace.json";
import { ethers } from "ethers";
import axios from "axios";
import NFTCard from "./NFTCard";
const Profile = () => {
  ///
  //
  const [items, setItems] = useState();
  const [totalPrice, setTotalPrice] = useState("0");
  const { isConnected, userAddress, signer } = useContext(WalletContext);

  ////
  ///
  //
  async function getNFTitems() {
    let sumPrice = 0;
    const itemsArray = [];
    if (!signer) return;
    let contract = new ethers.Contract(
      MarketplaceJson.address,
      MarketplaceJson.abi,
      signer
    );

    let transaction = await contract.getMyNFTs();

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
      sumPrice += Number(price);
    }
    return { itemsArray, sumPrice };
  }
  ///
  //
  //
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { itemsArray, sumPrice } = await getNFTitems();
        setItems(itemsArray);
        setTotalPrice(sumPrice);
      } catch (error) {
        console.error("Error fetching NFT items:", error);
      }
    };

    fetchData();
  }, [isConnected]);

  ////
  //
  ///
  return (
    <div>
      <div>
        <div>
          {isConnected ? (
            <>
              <div>
                <span>Wallet Address:</span>
                <span>{userAddress}</span>
              </div>
              <div>
                <div>
                  <span>Number of NFTs:</span>
                  <span>{items?.length}</span>
                </div>
                <div>
                  <span>Total Value:</span>
                  <span>{totalPrice} ETH</span>
                </div>
              </div>
              <div>
                <h2>Your NFTs</h2>
                {items?.length > 0 ? (
                  <div>
                    {items?.map((value, index) => (
                      <NFTCard item={value} key={index} />
                    ))}
                  </div>
                ) : (
                  <div>You do not have any NFT...</div>
                )}
              </div>
            </>
          ) : (
            <div>You are not connected...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
