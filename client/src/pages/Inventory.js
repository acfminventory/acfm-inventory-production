import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { ProductsContext } from "../contexts/ProductsContext";
import { NavLink } from "react-router-dom";
import Error from "../components/Error";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Inventory() {
  const { user, setUser } = useContext(UserContext);
  const { products } = useContext(ProductsContext);
  const [errors, setErrors] = useState([]);
  const [vis, setVis] = useState(false);
  const [shelf, setShelf] = useState(1); // Default shelf selection
  const [row, setRow] = useState("A"); // Default row selection
  const [contents, setContents] = useState([
    { product_id: "", concentration: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(""); // State for filtering by product
  const [expires, setExpires] = useState(""); // State for expiration date
  const showToastMessage = () => {
    toast("Container added!");
  };

  useEffect(() => {
    if (user && user.containers) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Calculate 2 years from today
    const today = new Date();
    const twoYearsFromNow = new Date(
      today.getFullYear() + 2,
      today.getMonth(),
      today.getDate()
    );
    // Format the date as YYYY-MM-DD for the input field
    const formattedDate = twoYearsFromNow.toISOString().slice(0, 10);
    setExpires(formattedDate);
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleVis = () => {
    setVis(!vis);
  };

  const handleShelfChange = (e) => {
    setShelf(parseInt(e.target.value));
  };

  const handleRowChange = (e) => {
    setRow(e.target.value);
  };

  const handleContentChange = (index, e) => {
    const { name, value } = e.target;
    const updatedContents = [...contents];
    updatedContents[index][name] = value;
    setContents(updatedContents);
  };

  const addContentField = () => {
    setContents([...contents, { product_id: "", concentration: "" }]);
  };

  const removeContentField = (index) => {
    // Check if this is the last content field, if so, disable removal
    if (contents.length === 1) {
      return;
    }
    const updatedContents = [...contents];
    updatedContents.splice(index, 1);
    setContents(updatedContents);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Calculate 2 years from today
    const today = new Date();
    const twoYearsFromNow = new Date(
      today.getFullYear() + 2,
      today.getMonth(),
      today.getDate()
    );
    // Format the date as YYYY-MM-DD for the input field
    const formattedDate = twoYearsFromNow.toISOString().slice(0, 10);

    const container = {
      user_id: user.id,
      shelf: shelf,
      row: row,
      expires: formattedDate, // Update expires to formattedDate
      contents_attributes: contents, // Ensure contents are correctly nested
    };

    fetch("/containers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ container }),
    })
      .then((r) => {
        if (r.ok) {
          // Update the expires state in user.containers
          r.json().then((container) => {
            container.expires = formattedDate;
            console.log(container);
            setUser((prevUser) => ({
              ...prevUser,
              containers: [...prevUser.containers, container],
            }));
            setShelf(1); // Reset to default after submission
            setRow("A"); // Reset to default after submission
            setContents([{ product_id: "", concentration: "" }]);
            setVis(false);
            showToastMessage();
          });
        } else {
          r.json().then((err) => setErrors(err.errors));
        }
      })
      .catch((error) => {
        console.error("Error adding container:", error);
      });
  };

  const handleProductFilterChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  // Filter containers based on selected product
  const filteredContainers = selectedProduct
    ? user.containers.filter((container) =>
        container.contents.some(
          (content) => content.product_id === parseInt(selectedProduct)
        )
      )
    : user.containers;

  // Sorting containers alphanumerically by shelf and row
  const sortedContainers = filteredContainers.slice().sort((a, b) => {
    // Sort by shelf first
    if (a.shelf !== b.shelf) {
      return a.shelf - b.shelf;
    }
    // Then sort by row alphabetically
    return a.row.localeCompare(b.row);
  });

  // Sort products alphabetically by name
  const sortedProducts = products
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  // Calculate the maximum number of contents in any container
  const maxContents = Math.max(
    ...user.containers.map((container) => container.contents.length),
    0
  );

  const tableRows = sortedContainers.map((container) => {
    // Calculate 3 months from today
    const today = new Date();
    const threeMonthsFromNow = new Date(
      today.getFullYear(),
      today.getMonth() + 3,
      today.getDate()
    );

    return (
      <tr key={container.id}>
        <td>
          <NavLink to={`/containers/${container.id}`} className="navlink">
            <span
              style={{
                color:
                  new Date(container.expires) < threeMonthsFromNow
                    ? "red"
                    : "inherit",
              }}
            >
              {container.expires.slice(0, 10)}
            </span>
          </NavLink>
        </td>
        <td>
          <NavLink to={`/containers/${container.id}`} className="navlink">
            {container.shelf}
          </NavLink>
        </td>
        <td>
          <NavLink to={`/containers/${container.id}`} className="navlink">
            {container.row}
          </NavLink>
        </td>
        {container.contents.map((content, index) => (
          <td key={index}>
            <NavLink to={`/containers/${container.id}`} className="navlink">
              {content.concentration}%{" "}
              {
                products.find((product) => product.id === content.product_id)
                  ?.name
              }
            </NavLink>
          </td>
        ))}
      </tr>
    );
  });

  return (
    <>
      <div className="total-containers flex-row">
        <p>
          <b>{user.containers.length}</b> Containers in Inventory
        </p>
      </div>
      <div className="center margin-3em">
        <button onClick={handleVis} className="blue-btn">
          {vis ? "Cancel" : "Add a Container"}
        </button>
        <div>
          {vis ? (
            <form onSubmit={handleSubmit}>
              <div className="flex-column">
                <div className="flex-row">
                  <label>
                    Shelf
                    <select value={shelf} onChange={handleShelfChange} required>
                      {[...Array(10).keys()].map((num) => (
                        <option key={num + 1} value={num + 1}>
                          {num + 1}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Row
                    <select value={row} onChange={handleRowChange} required>
                      {["A", "B", "C", "D", "E"].map((char) => (
                        <option key={char} value={char}>
                          {char}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Expiration Date
                  <input
                    type="date"
                    value={expires}
                    onChange={(e) => setExpires(e.target.value)}
                    required
                  />
                </label>
                {contents.map((content, index) => (
                  <div className="flex-row" key={index}>
                    <select
                      value={content.product_id}
                      onChange={(e) => handleContentChange(index, e)}
                      name="product_id"
                      // required
                    >
                      <option value="">Select a product</option>
                      {sortedProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    <label>
                      <input
                        type="number"
                        placeholder="Concentration"
                        step="0"
                        value={content.concentration}
                        onChange={(e) => handleContentChange(index, e)}
                        name="concentration"
                        // required
                      />
                    </label>
                    {/* Disable remove button if it's the last content field */}
                    <button
                      className="grey-button  remove-btn"
                      type="button"
                      onClick={() => removeContentField(index)}
                      disabled={contents.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {errors.map((err) => (
                  <Error key={err}>{err}</Error>
                ))}
                <button
                  className="grey-button margin-top-small"
                  type="button"
                  onClick={addContentField}
                >
                  Add More Contents
                </button>
              </div>
              <button type="submit" className="blue-btn container-submit">
                Submit Container
              </button>
            </form>
          ) : null}
        </div>
      </div>
      <div className="flex-row filter-products">
        <label>
          Filter by Product:
          <select
            value={selectedProduct}
            onChange={handleProductFilterChange}
            className="margin-left"
          >
            <option value="">All Products</option>
            {sortedProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="center">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Expiration Date</th>
              <th>Shelf</th>
              <th>Row</th>
              <th colSpan={maxContents}>Contents</th>
            </tr>
          </thead>
          <tbody>{tableRows}</tbody>
        </table>
      </div>
      <ToastContainer autoClose={2000} />
    </>
  );
}

export default Inventory;
