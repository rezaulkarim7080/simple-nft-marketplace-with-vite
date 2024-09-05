import React from "react";
import GetIpfsUrlFromPinata from "../../utils";
import { Link } from "react-router-dom";

const NFTCard = ({ item }) => {
  const IPFSUrl = GetIpfsUrlFromPinata(item.image);

  const limitedDescription =
    item.description.length > 100
      ? item.description.substring(0, 100) + "..."
      : item.description;

  return (
    <div className=" hover:bg-slate-100 text-center">
      <Link to={`/nft/${item.tokenId}`}>
        <div>
          <img
            className="rounded-md "
            src={IPFSUrl}
            alt=""
            width={400}
            height={360}
          />
        </div>
        <div>
          <Link to={`/nft/${item.tokenId}`}>
            <strong>{item.name}</strong>
            <p>{limitedDescription}</p>
            <p>{item.price}.eth</p>
          </Link>
        </div>
      </Link>
    </div>
  );
};

export default NFTCard;
