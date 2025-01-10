import { useContext, useState } from "react";
import { ProductsContext } from "../contexts/ProductsContext";
import { useParams, useNavigate } from "react-router-dom";
import Error from "../components/Error";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditProduct() {
  const navigate = useNavigate();
  let { id } = useParams();
  id = parseInt(id);
  const { products, setProducts } = useContext(ProductsContext);
  const product = products.find((product) => product.id === parseInt(id));

  const [name, setName] = useState(product.name);
  const [epaReg, setEpaReg] = useState(product.epa_reg);
  const [errors, setErrors] = useState([]);

  const showToastMessage = () => {
    toast("Product updated!", {
      className: "custom-toast",
      progressClassName: "Toastify__progress-bar",
    });
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEpaRegChange = (e) => {
    setEpaReg(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProduct = { ...product, name, epa_reg: epaReg };

    // Make the API call to update the product in the database
    fetch(`/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    }).then((data) => {
      if (data.ok) {
        const updatedProducts = products.map((p) =>
          p.id === updatedProduct.id ? updatedProduct : p
        );
        setProducts(updatedProducts);
        showToastMessage();
        setTimeout(() => {
          navigate("/products");
        }, 2000);
      } else {
        data.json().then((err) => setErrors(err.errors));
      }
    });
  };

  return (
    <div className="edit-container">
      <form className="form" onSubmit={handleSubmit}>
        <label className="form__label">
          Name
          <input type="text" value={name} onChange={handleNameChange} />
        </label>
        <label className="form__label">
          EPA Reg
          <input type="text" value={epaReg} onChange={handleEpaRegChange} />
        </label>
        {errors.map((err) => (
          <Error key={err}>{err}</Error>
        ))}
        <button type="submit" className="button button--submit">
          Submit
        </button>
      </form>
      <ToastContainer autoClose={1000} />
    </div>
  );
}

export default EditProduct;
