import { useParams } from "react-router-dom";
import { useContext } from "react";
import { ProductsContext } from "../contexts/ProductsContext";
import { useNavigate } from "react-router-dom";

function Product() {
  const navigate = useNavigate();
  let { id } = useParams();
  id = parseInt(id);
  const { products, setProducts } = useContext(ProductsContext);
  const product = products.find((product) => product.id === parseInt(id));

  if (!product) {
    return <p>Product not found</p>;
  }

  function handleDelete() {
    fetch(`/products/${id}`, {
      method: "DELETE",
    })
      .then((r) => {
        if (!r.ok) {
          throw new Error("Failed to delete product");
        }
        if (r.status === 204) {
          return {};
        }
        return r.json();
      })
      .then((deletedProduct) => {
        const updatedProducts = products.filter((product) => product.id !== id);
        setProducts(updatedProducts);
        navigate("/products");
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
        // Handle error (e.g., show a notification to the user)
      });
  }

  return (
    <div className="container">
      <div className="product">
        <h1>{product.name}</h1>
        <p>EPA Reg: {product.epa_reg}</p>
        <div className="product-options">
          <span>Edit</span> <span onClick={handleDelete}>Remove</span>
        </div>
      </div>
    </div>
  );
}

export default Product;
