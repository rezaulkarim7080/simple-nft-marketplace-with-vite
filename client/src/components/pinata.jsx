"use server";

import axios from "axios";

// Use the JWT token from Vite's environment
const jwt = import.meta.env.VITE_API_JWT;
// const jwt = process.env.VITE_API_JWT;

// Upload JSON metadata to Pinata
export const uploadJSONToIPFS = async (JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  try {
    const res = await axios.post(url, JSONBody, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    return {
      success: true,
      pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Upload a file to Pinata
export const uploadFileToIPFS = async (data) => {
  const pinataMetadata = JSON.stringify({
    name: data.get("file").name,
  });
  data.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  data.append("pinataOptions", pinataOptions);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    return {
      success: true,
      pinataURL: "https://gateway.pinata.cloud/ipfs/" + res.data.IpfsHash,
    };
  } catch (error) {
    console.log("AxiosError:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};
