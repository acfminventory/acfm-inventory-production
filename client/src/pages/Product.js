import { useContext, useState } from "react";
import { ProductsContext } from "../contexts/ProductsContext";
import { useNavigate, Link, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Modal from "../components/Modal"; // Import the Modal component
import "react-toastify/dist/ReactToastify.css";

function Product() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  let { id } = useParams();
  id = parseInt(id);
  const { products, setProducts } = useContext(ProductsContext);
  const product = products.find((product) => product.id === parseInt(id));

  const showToastMessage = () => {
    toast(`Product removed!`);
  };

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
      .then(() => {
        const updatedProducts = products.filter((product) => product.id !== id);
        showToastMessage();
        setTimeout(() => {
          setProducts(updatedProducts);
          navigate("/products");
        }, 2000);
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
      });
  }

  return (
    <div className="container">
      <div className="product">
        <h1>{product.name}</h1>
        <p>EPA Reg: {product.epa_reg}</p>
        <div className="product-options-wrapper">
          <div className="product-options">
            <Link to={`/products/${id}/edit`}>
              <button className="btn button-width link-button">Edit</button>
            </Link>
            <button
              className="remove-btn button-width"
              onClick={() => setIsModalOpen(true)} // Open the modal
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Modal for delete confirmation */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Are you sure you want to remove this product?</h2>
        <p className="errors">
          Warning: This action will remove the product from all containers that
          include it.
        </p>
        <div className="modal-buttons">
          <button className="btn" onClick={handleDelete}>
            Yes
          </button>
          <button
            className="btn"
            onClick={() => setIsModalOpen(false)} // Close the modal on No
          >
            No
          </button>
        </div>
      </Modal>

      <ToastContainer autoClose={2000} />
    </div>
  );
}

export default Product;
