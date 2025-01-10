import { useContext, useState } from "react";
import { ProductsContext } from "../contexts/ProductsContext";
import { Link } from "react-router-dom";
import Error from "../components/Error";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Products() {
  const { products, setProducts, loading } = useContext(ProductsContext);
  const [vis, setVis] = useState(false);
  const [name, setName] = useState("");
  const [epaReg, setEpaReg] = useState("");
  const [errors, setErrors] = useState([]);
  const showToastMessage = () => {
    toast("Product added!", {
      className: "custom-toast",
      progressClassName: "Toastify__progress-bar",
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  function handleNameChange(e) {
    setName(e.target.value);
  }

  function handleEpaRegChange(e) {
    setEpaReg(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newProduct = { name, epa_reg: epaReg };

    fetch("/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    }).then((r) => {
      if (r.ok) {
        r.json().then((createdProduct) => {
          setProducts((prevProducts) => [...prevProducts, createdProduct]);
          setName("");
          setEpaReg("");
          setVis(false);
          showToastMessage();
        });
      } else {
        r.json().then((err) => setErrors(err.errors));
      }
    });
  }

  if (!products) {
    return <div></div>;
  }

  // Sort products alphanumerically by name in ascending order
  const sortedProducts = products.slice().sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  let productComps = sortedProducts.map((product) => {
    return (
      <tr key={product.id}>
        <td>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </td>
        <td>{product.epa_reg}</td>
      </tr>
    );
  });

  function handleVis() {
    setVis(!vis);
  }

  return (
    <div className="table-container">
      <div className="center margin-3em">
        <button onClick={handleVis} className="button">
          {vis ? "Cancel" : "Add a Product"}
        </button>
        <div>
          {vis ? (
            <form className="form" onSubmit={handleSubmit}>
              <label className="form__label">
                Product Name
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                ></input>
              </label>
              <label className="form__label">
                EPA Reg #
                <input
                  type="text"
                  value={epaReg}
                  onChange={handleEpaRegChange}
                ></input>
              </label>
              {errors.map((err) => (
                <Error key={err}>{err}</Error>
              ))}
              <button type="submit" className="button button--submit">
                Submit Product
              </button>
            </form>
          ) : null}
        </div>
      </div>
      <table className="table">
        <thead>
          <tr className="table-header-row">
            <th>Name</th>
            <th>EPA Reg #</th>
          </tr>
        </thead>
        <tbody>{productComps}</tbody>
      </table>
      <ToastContainer autoClose={1000} />
    </div>
  );
}

export default Products;
