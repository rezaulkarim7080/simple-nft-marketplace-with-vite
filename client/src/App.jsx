import HomePage from "./components/HomePage";
import MarketPlace from "./components/MarketPlace";
import NavBar from "./components/NavBar";
import Profile from "./components/Profile";
import List from "./components/List";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SellNFT from "./components/SellNFT";
import NftDetails from "./components/NftDetails";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/MarketPlace" element={<MarketPlace />} />
        <Route path="/List" element={<List />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/SellNFT" element={<SellNFT />} />
        <Route path="/nft/:tokenId" element={<NftDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
