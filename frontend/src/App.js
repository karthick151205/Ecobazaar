import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from 'axios'; // <-- 1. PUTHUSA ADD PANNIRUKOM (API call panna)

/* 🌍 Pages (Ithellam unga friend odathu, appadiye irukatum) */
import Home from "./pages/Home";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetails from "./pages/ProductDetails";
import ViewSoldProducts from "./pages/ViewSoldProducts";
import MyProducts from "./pages/MyProducts";
import SellerOrders from "./pages/SellerOrders";
import SellerProfile from "./pages/SellerProfile";
import BuyerProfile from "./pages/BuyerProfile";
import BuyerOrders from "./pages/BuyerOrders";
import BuyBox from "./pages/BuyBox";
import PaymentPortal from "./pages/PaymentPortal";
import Cart from "./pages/Cart";
import AddProduct from "./pages/AddProduct";
import EcoRankPage from "./pages/EcoRankPage";
import LoginSuccess from "./pages/LoginSuccess";

/* 🔐 Popups (Appadiye irukatum) */
import LoginPopup from "./LoginPopup";
import SignupPopup from "./SignupPopup";

/* 🌿 Sample Product Images (ITHU ROMBA MUKKIYAM) */
// Namma intha images a import panni vechikanum
import cottonBag from "./assets/cotton_bag.jpg";
import brush from "./assets/brush.webp";
import note from "./assets/notes.jpg";
import power from "./assets/powerbank.jpg";

// === Ithu thaan antha "Image Problem" fix ===
// Backend la irunthu vara "cotton_bag.jpg" (string) a
// inga import panna 'cottonBag' (variable) oda link panrom
const imageMap = {
  "cotton_bag.jpg": cottonBag,
  "brush.webp": brush,
  "notes.jpg": note,
  "powerbank.jpg": power,
};

function App() {

  // ===== 💻 ITHU THAAN NAMMA PUTHU "SMART" LOGIC 💻 =====

  /* 🛍️ Products state, first empty ah irukum */
  const [products, setProducts] = useState([]);

  /* 💾 App start aagum pothu, data va load pannum */
  useEffect(() => {
    
    // Intha function data va API la iruntho illa localStorage la iruntho edukum
    async function loadProducts() {

      // Intha function data la irukura image string (e.g., "notes.jpg")
      // a correct image variable ku (e.g., 'note') maathum
      const mapImages = (data) => {
        if (!data) return []; // Data illana empty array anupu
        return data.map(product => ({
          ...product,
          // imageMap la irunthu correct variable a thedum, illana palaya string a vechikum
          image: imageMap[product.image] || product.image 
        }));
      };

      try {
        // === API TRY ===
        // 1. Spring Boot Backend kitta data kekkum
        const response = await axios.get("http://localhost:3080/api/products");
        
        console.log("✅ Backend Connected! Loading data from Spring Boot.");
        const rawData = response.data;
        
        // 3. Oru backup ah localStorage layum save pannikalam (unga friend ku useful)
        // Namma RAW data va (image string oda) thaan save pannanum
        localStorage.setItem("sellerProducts", JSON.stringify(rawData));

        // 4. Ippo images a map panni state la set panrom
        setProducts(mapImages(rawData));

      } catch (error) {
        // === FALLBACK ===
        // 4. Backend "OFF" la iruntha, inga error varum
        console.warn("🚫 Backend OFFLINE. Loading data from localStorage fallback.");
        
        // 5. Unga friend oda palaya code inga
        const saved = localStorage.getItem("sellerProducts");
        const localData = saved ? JSON.parse(saved) : []; // Palaya data va edukum
        
        // localStorage la irunthu edutha data kum image map pannanum
        setProducts(mapImages(localData));
      }
    }

    loadProducts(); // Intha function a App start la call panrom
  }, []); // [] pota, oru thadava mattum run aagum

  
  // ----- Intha functions ellam ippothaiku localStorage la mattum work aagatum -----
  // Namma adutha step la itha API oda connect pannalam
  // Unga friend ku ippo app crash aaga kudathu, athanala palaya logic appadiye irukatum

  /* ✅ Add New Product (Unga Friend oda palaya logic - ippothaiku) */
  const handleAddProduct = (newProduct) => {
    console.warn("Adding product to localStorage only (Backend not connected for this action yet)");
    const newId = products.length ? products[products.length - 1].id + 1 : 1;
    // Puthu product ku oru default image vechikalam
    const newProd = { id: newId, sold: 0, image: note, ...newProduct };
    
    const updatedProducts = [...products, newProd];
    setProducts(updatedProducts); // UI update pannu
    
    // Namma localStorage la save pannum pothu raw data (string) save pannanum
    // Aana ippothaiku simple ah vechikalam. Unga friend ku ithu work aagum.
    const rawUpdatedProducts = updatedProducts.map(p => ({
        ...p,
        image: Object.keys(imageMap).find(key => imageMap[key] === p.image) || 'notes.jpg' // Reverse map
    }));
    localStorage.setItem("sellerProducts", JSON.stringify(rawUpdatedProducts));
  };

  /* ✏️ Edit Product (Unga Friend oda palaya logic - ippothaiku) */
  const handleEditProduct = (updatedProduct) => {
    console.warn("Editing product in localStorage only (Backend not connected for this action yet)");
    const updatedProducts = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProducts(updatedProducts); // UI update pannu

    // Mela sonna maari, reverse map panni save pannanum
    const rawUpdatedProducts = updatedProducts.map(p => ({
        ...p,
        image: Object.keys(imageMap).find(key => imageMap[key] === p.image) || 'notes.jpg'
    }));
    localStorage.setItem("sellerProducts", JSON.stringify(rawUpdatedProducts));
  };

  /* 🗑️ Delete Product (Unga Friend oda palaya logic - ippothaiku) */
  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      console.warn("Deleting product from localStorage only (Backend not connected for this action yet)");
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts); // UI update pannu
      
      // Mela sonna maari, reverse map panni save pannanum
      const rawUpdatedProducts = updatedProducts.map(p => ({
        ...p,
        image: Object.keys(imageMap).find(key => imageMap[key] === p.image) || 'notes.jpg'
      }));
      localStorage.setItem("sellerProducts", JSON.stringify(rawUpdatedProducts));
    }
  };

  // ===== UNGA FRIEND ODA UI CODE (ROUTES) - ETHAYUM MAATHA VENAM =====
  return (
    <Router>
      <Routes>
        {/* 🏠 Home Page */}
        <Route path="/" element={<Home />} />

        {/* 👤 Buyer Pages */}
        <Route path="/BuyerDashboard" element={<BuyerDashboard />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/pages/BuyerProfile" element={<BuyerProfile />} />
        <Route path="/orders" element={<BuyerOrders />} />
        <Route path="/buybox" element={<BuyBox />} />
        <Route path="/PaymentPortal" element={<PaymentPortal />} />
        <Route path="/EcoRankPage" element={<EcoRankPage />} />
        <Route path="/cart" element={<Cart />} />

        {/* 🏪 Seller Pages (Ithu automatic ah namma puthu 'products' state a use pannikum) */}
        <Route
          path="/SellerDashboard"
          element={
            <SellerDashboard
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          }
        />
        <Route path="/view-sold-products" element={<ViewSoldProducts />} />
        <Route
          path="/my-products"
          element={
            <MyProducts
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          }
        />
        <Route path="/seller-orders" element={<SellerOrders />} />
        <Route path="/seller/profile" element={<SellerProfile />} />
        <Route
          path="/seller/add-product"
          element={<AddProduct onAddProduct={handleAddProduct} />}
        />

        {/* 🧑‍💼 Admin */}
        <Route path="/AdminDashboard" element={<AdminDashboard />} />

        {/* 🔐 Auth */}
        <Route path="/login" element={<LoginPopup />} />
        <Route path="/signup" element={<SignupPopup />} />
        <Route path="/login-success" element={<LoginSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;