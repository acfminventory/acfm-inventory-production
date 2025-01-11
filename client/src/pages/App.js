import "../styles/App.css";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { ProductsContext } from "../contexts/ProductsContext";
import Login from "./Login";
import { Routes, Route } from "react-router-dom";
import NavBar from "../components/NavBar";
import Products from "./Products";
import Shelves from "./Shelves";
import Product from "./Product";
import EditProduct from "./EditProduct";
import Container from "./Container";
import EditContainer from "./EditContainer";
import Footer from "../components/Footer";
import Totals from "./Totals";
import Help from "./Help";
import NotFound from "./NotFound";
import Teams from "./Teams";
import Team from "./Team";
import { FilterProvider } from "../contexts/FilterContext";

function App() {
  const { user, loading: userLoading } = useContext(UserContext);
  const { loading: productsLoading } = useContext(ProductsContext);

  if (userLoading || productsLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="content-wrap">
          <Login />
        </div>
      </div>
    );
  }

  return (
    <FilterProvider>
      <div className="page">
        <div className="page__content">
          <header className="page__header">
            <NavBar />
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Shelves />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<Product />} />
              <Route path="/products/:id/edit" element={<EditProduct />} />
              <Route path="/containers/:id" element={<Container />} />
              <Route path="/containers/:id/edit" element={<EditContainer />} />
              <Route path="/totals" element={<Totals />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:id" element={<Team />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
        <Footer />
      </div>
    </FilterProvider>
  );
}

export default App;
