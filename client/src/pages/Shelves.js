import { useContext, useState, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { ProductsContext } from "../contexts/ProductsContext";
import { useNavigate } from "react-router-dom";
import Error from "../components/Error";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "../components/Modal";
import { GrPowerReset } from "react-icons/gr";

function Shelves() {
  const { loading: productsLoading } = useContext(ProductsContext);
  const { user, setUser } = useContext(UserContext);
  const teams = user.teams || [];
  const { products } = useContext(ProductsContext);
  const [errors, setErrors] = useState([]);
  const [shelf, setShelf] = useState(1);
  const [row, setRow] = useState("A");
  const [contents, setContents] = useState([
    { product_id: "", concentration: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedConcentration, setSelectedConcentration] = useState("");
  const [selectedProduct2, setSelectedProduct2] = useState("");
  const [selectedConcentration2, setSelectedConcentration2] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [expires, setExpires] = useState("");
  const [filterExpiresSoon, setFilterExpiresSoon] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [modalType, setModalType] = useState("premix"); // 'premix' or 'concentrate'

  const showToastMessage = () => {
    toast("Container added!", {
      className: "custom-toast",
      progressClassName: "Toastify__progress-bar",
    });
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalToggle = () => {
    if (isModalOpen) {
      resetFormToDefaults();
    }
    setIsModalOpen(!isModalOpen);
  };
  const navigate = useNavigate();
  const handleResetFilters = () => {
    setSelectedProduct("");
    setSelectedConcentration("");
    setSelectedProduct2("");
    setSelectedConcentration2("");
    setSelectedTeam("");
    setShelf(1);
    setRow("A");
    setFilterExpiresSoon(false);
  };

  useEffect(() => {
    if (user && user.containers && products) {
      setLoading(false);
    }
  }, [user, products]);

  useEffect(() => {
    const today = new Date();
    const sixMonthsFromNow = new Date(
      today.getFullYear(),
      today.getMonth() + 6,
      today.getDate()
    );
    const formattedDate = sixMonthsFromNow.toISOString().slice(0, 10);
    setExpires(formattedDate);
  }, []);

  if (loading || !user.containers || productsLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

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

  function handleExpiresChange(event) {
    setExpires(event.target.value.slice(0, 10)); // Slice date to exclude time
  }

  function handleQuantityChange(e) {
    setQuantity(e.target.value);
  }

  const addContentField = () => {
    setContents([...contents, { product_id: "", concentration: "" }]);
  };

  const removeContentField = (index) => {
    if (contents.length === 1) {
      return;
    }
    const updatedContents = [...contents];
    updatedContents.splice(index, 1);
    setContents(updatedContents);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const container = {
      user_id: user.id,
      shelf: shelf,
      row: row,
      expires: expires,
      contents_attributes: contents,
      team_id: selectedTeam,
      quantity: quantity,
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
          r.json().then((containers) => {
            // Update here to handle an array of containers
            containers.forEach((newContainer) => {
              newContainer.expires = expires; // Update expires if necessary
            });
            setUser((prevUser) => ({
              ...prevUser,
              containers: [...prevUser.containers, ...containers], // Spread the new containers
            }));
            // Reset state after adding containers
            setShelf(1);
            setRow("A");
            setQuantity(1);
            setContents([{ product_id: "", concentration: "" }]);
            setSelectedTeam("");
            setIsModalOpen(false);
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

  const handleConcentrationFilterChange = (e) => {
    setSelectedConcentration(e.target.value);
  };

  const handleProductFilterChange2 = (e) => {
    setSelectedProduct2(e.target.value);
  };

  const handleConcentrationFilterChange2 = (e) => {
    setSelectedConcentration2(e.target.value);
  };

  const handleAddPremix = () => {
    resetFormToDefaults();
    const today = new Date();
    const sixMonthsFromNow = new Date(
      today.getFullYear(),
      today.getMonth() + 6,
      today.getDate()
    );
    const formattedDate = sixMonthsFromNow.toISOString().slice(0, 10);
    setExpires(formattedDate);
    setModalType("premix");
    setIsModalOpen(true);
  };

  const handleAddConcentrate = () => {
    resetFormToDefaults();
    const today = new Date();
    const twoYearsFromNow = new Date(
      today.getFullYear() + 2,
      today.getMonth(),
      today.getDate()
    );
    const formattedDate = twoYearsFromNow.toISOString().slice(0, 10);
    // Set default team to Facilities for concentrates
    const facilitiesTeam = teams.find((team) => team.name === "Facilities");
    setSelectedTeam(facilitiesTeam ? facilitiesTeam.id : "");
    setModalType("concentrate");
    // Set concentration to 100% by default
    setContents([{ product_id: "", concentration: "100" }]);
    setIsModalOpen(true);
    setExpires(formattedDate);
  };

  const filteredContainers = user.containers.filter((container) => {
    const firstFilterMatch = container.contents.some(
      (content) =>
        (!selectedProduct ||
          content.product_id === parseInt(selectedProduct)) &&
        (!selectedConcentration ||
          content.concentration === parseFloat(selectedConcentration))
    );

    const secondFilterMatch = container.contents.some(
      (content) =>
        (!selectedProduct2 ||
          content.product_id === parseInt(selectedProduct2)) &&
        (!selectedConcentration2 ||
          content.concentration === parseFloat(selectedConcentration2))
    );

    const teamFilterMatch =
      !selectedTeam || container.team.id === parseInt(selectedTeam);

    const isExpiringSoon =
      new Date(container.expires) <
      new Date(new Date().setMonth(new Date().getMonth() + 3));

    return (
      firstFilterMatch &&
      secondFilterMatch &&
      teamFilterMatch &&
      (!filterExpiresSoon || isExpiringSoon)
    );
  });

  const sortedContainers = filteredContainers.slice().sort((a, b) => {
    if (a.shelf !== b.shelf) {
      return b.shelf - a.shelf;
    }
    return a.row.localeCompare(b.row);
  });

  const sortedProducts = products
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  const uniqueConcentrations = [
    ...new Set(
      user.containers.flatMap((container) =>
        container.contents.map((content) => content.concentration)
      )
    ),
  ].sort((a, b) => a - b);

  const maxContents = Math.max(
    ...user.containers.map((container) => container.contents.length),
    0
  );

  const tableRows = sortedContainers.map((container) => {
    if (!container.contents || container.contents.length === 0) {
      return (
        <tr key={container.id}>
          <td colSpan={maxContents + 4}>No contents available</td>
        </tr>
      );
    }

    const sortedContents = container.contents.slice().sort((a, b) => {
      return b.concentration - a.concentration;
    });

    const today = new Date();
    const threeMonthsFromNow = new Date(
      today.getFullYear(),
      today.getMonth() + 3,
      today.getDate()
    );

    return (
      <tr
        key={container.id}
        onClick={() => navigate(`/containers/${container.id}`)}
        className="clickable-row"
      >
        <td>
          <span
            style={{
              color:
                new Date(container.expires) < threeMonthsFromNow
                  ? "rgb(202, 11, 11)"
                  : "inherit",
            }}
          >
            {container.expires.slice(0, 10)}
          </span>
        </td>
        <td>{container.team.name}</td>
        <td>{container.shelf}</td>
        <td>{container.row}</td>
        <td className="contents__td">
          {sortedContents.map((content, index) => {
            const product = products.find(
              (product) => product.id === content.product_id
            );
            return (
              <div className="contents__container" key={index}>
                <div>{content.concentration}%</div>{" "}
                <div>{product ? product.name : "Refresh the page"}</div>{" "}
              </div>
            );
          })}
        </td>
      </tr>
    );
  });

  const resetFormToDefaults = () => {
    setContents([{ product_id: "", concentration: "" }]);
    setSelectedTeam("");
    setQuantity(1);
  };

  return (
    <>
      <div>
        <div>
          <Modal
            isOpen={isModalOpen}
            onClose={handleModalToggle}
            className="modal"
          >
            <form className="form add-form" onSubmit={handleSubmit}>
              <div className="flex-column flex-column--modal">
                <div className="flex-row">
                  {modalType === "premix" && (
                    <label className="form__label">
                      Team
                      <select
                        name="team"
                        className="button"
                        value={selectedTeam || ""}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        required
                      >
                        <option value="">Select a team</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="form__label">
                    Shelf
                    <select
                      name="shelf"
                      className="button"
                      value={shelf}
                      onChange={handleShelfChange}
                      required
                    >
                      {[...Array(32).keys()].map((num) => (
                        <option key={num + 1} value={num + 1}>
                          {num + 1}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form__label">
                    Row
                    <select
                      name="row"
                      className="button"
                      value={row}
                      onChange={handleRowChange}
                      required
                    >
                      {["A", "B", "C", "D", "E"].map((char) => (
                        <option key={char} value={char}>
                          {char}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form__label">
                    Expiration Date
                    <input
                      name="expiration_date"
                      type="date"
                      value={expires}
                      onChange={handleExpiresChange}
                      required
                    />
                  </label>
                </div>

                {contents.map((content, index) => (
                  <div className="flex-row" key={index}>
                    <select
                      className="button product__select"
                      value={content.product_id}
                      onChange={(e) => handleContentChange(index, e)}
                      name="product_id"
                      required
                    >
                      <option value="">Select a product</option>
                      {sortedProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    {modalType === "premix" && (
                      <label className="form__label">
                        <input
                          className="concentration-input"
                          type="number"
                          placeholder="%"
                          step="0"
                          value={content.concentration}
                          onChange={(e) => handleContentChange(index, e)}
                          name="concentration"
                          required
                        />
                      </label>
                    )}
                    {modalType === "premix" && (
                      <button
                        className="button button--remove"
                        type="button"
                        onClick={() => removeContentField(index)}
                        disabled={contents.length === 1}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}

                {modalType === "premix" && (
                  <button
                    className="button button--remove"
                    type="button"
                    onClick={addContentField}
                  >
                    Add More Contents
                  </button>
                )}
              </div>
              <div className="quantity-select__container">
                <label htmlFor="quantity">Quantity:</label>
                <select
                  className="button button--add"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </div>

              <button type="submit" className="button">
                {quantity > 1 ? "Submit Containers" : "Submit Container"}
              </button>
              {errors.map((err) => (
                <Error key={err}>{err}</Error>
              ))}
            </form>
          </Modal>
        </div>
        <div className="filter-container">
          <div className="filter-container__filter-group">
            <label className="filter">
              <select
                value={selectedConcentration}
                onChange={handleConcentrationFilterChange}
                className="button button--filter filter__option"
                name="select-concentration-1"
              >
                <option value="">All Concentrations</option>
                {uniqueConcentrations.map((concentration) => (
                  <option key={concentration} value={concentration}>
                    {concentration}%
                  </option>
                ))}
              </select>
            </label>
            <label>
              <select
                value={selectedProduct}
                onChange={handleProductFilterChange}
                className="button button--filter product__select"
                name="select-product-1"
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
          <div className="filter-container__filter-group">
            <label className="filter">
              <select
                value={selectedConcentration2}
                onChange={handleConcentrationFilterChange2}
                className="button button--filter filter__option"
                name="select-concentration-2"
              >
                <option value="">All Concentrations</option>
                {uniqueConcentrations.map((concentration) => (
                  <option key={concentration} value={concentration}>
                    {concentration}%
                  </option>
                ))}
              </select>
            </label>
            <label>
              <select
                value={selectedProduct2}
                onChange={handleProductFilterChange2}
                className="button button--filter product__select"
                name="select-product-2"
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
          <div className="filter-container__filter-group">
            <label className="filter">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="button button--filter"
                name="select-team"
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            className="filter__button--toggle--expiring"
            onClick={() => setFilterExpiresSoon((prev) => !prev)}
          >
            {filterExpiresSoon ? "Show All Containers" : "Show Expiring Soon"}
          </button>
          <button
            onClick={handleResetFilters}
            className="reset-button"
            alt="reset button"
          >
            <GrPowerReset className="reset-button__image" />
          </button>
        </div>

        <div>
          <div className="flex-column">
            <div className="add-buttons">
              <button
                className="button button--add modal-button"
                onClick={handleAddPremix}
              >
                Add Premix
              </button>
              <button
                className="button button--add modal-button"
                onClick={handleAddConcentrate}
              >
                Add Concentrate
              </button>
            </div>

            <span className="flex-column__span">
              Selected Prescription: {tableRows.length} Containers
            </span>
          </div>
        </div>
        <div className="inventory-table-container">
          {filteredContainers.length > 0 ? (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Expires</th>
                  <th>Team</th>
                  <th>Shelf</th>
                  <th>Row</th>
                  <th colSpan={maxContents}>Contents</th>
                </tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
          ) : (
            <p className="error">
              There are no containers in inventory with that prescription.
            </p>
          )}
        </div>
        <ToastContainer />
      </div>
    </>
  );
}

export default Shelves;
