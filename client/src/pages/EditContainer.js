import { useContext, useState, useEffect } from "react";
import { ProductsContext } from "../contexts/ProductsContext";
import { UserContext } from "../contexts/UserContext";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditContainer() {
  const navigate = useNavigate();
  let { id } = useParams();
  id = parseInt(id);

  const { user, setUser } = useContext(UserContext);
  const { products } = useContext(ProductsContext);
  const [errors, setErrors] = useState([]);

  let container = user.containers.find((container) => container.id === id);

  const [shelf, setShelf] = useState(container?.shelf || "");
  const [row, setRow] = useState(container?.row || "");
  const [contents, setContents] = useState(container?.contents || []);
  const [expires, setExpires] = useState(container?.expires.slice(0, 10) || ""); // Ensure only the date part
  const [team, setTeam] = useState(container?.team?.id || ""); // Use team ID for initial state

  const showToastMessage = () => {
    toast("Container updated!", {
      className: "custom-toast",
      progressClassName: "Toastify__progress-bar",
    });
  };

  useEffect(() => {
    if (container) {
      setShelf(container.shelf);
      setRow(container.row);
      setContents(
        container.contents.map((content) => ({
          ...content,
          id: content.id || null,
        }))
      );
      setExpires(container.expires.slice(0, 10) || "");
      setTeam(container.team?.id || "");
    }
  }, [container]);

  function handleShelfChange(event) {
    setShelf(event.target.value);
  }

  function handleRowChange(event) {
    setRow(event.target.value);
  }

  function handleContentChange(index, key, value) {
    const updatedContents = [...contents];
    if (key === "product_id") {
      updatedContents[index][key] = value;
    } else if (key === "concentration") {
      updatedContents[index][key] = value === "" ? null : parseFloat(value);
    }
    setContents(updatedContents);
  }

  function handleAddContent() {
    setContents([...contents, { product_id: "", concentration: null }]);
  }

  function handleRemoveContent(index) {
    if (contents.length === 1 && !contents[index]._destroy) {
      // Prevent removal if only one content is left and it's not marked for destruction
      toast.error("Cannot remove the last content.");
      return;
    }

    // Mark the content for deletion if it is not already marked
    const updatedContents = contents.map((content, idx) =>
      idx === index ? { ...content, _destroy: true } : content
    );
    setContents(updatedContents);
  }

  function handleExpiresChange(event) {
    setExpires(event.target.value.slice(0, 10)); // Slice date to exclude time
  }

  function handleTeamChange(event) {
    setTeam(event.target.value); // Set team state to selected value
  }

  function handleSubmit(event) {
    event.preventDefault();

    const updatedContainer = {
      id: container.id,
      shelf,
      row,
      expires: expires,
      team_id: team,
      contents_attributes: contents.map((content) => ({
        id: content.id || null, // Add ID if it exists; otherwise, set to null
        product_id: content.product_id,
        concentration: content.concentration,
        _destroy: content._destroy || false, // Include _destroy if it exists
      })),
    };

    fetch(`/containers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ container: updatedContainer }),
    })
      .then((r) => {
        if (!r.ok) {
          return r.json().then((data) => {
            throw new Error(
              data.errors
                ? data.errors.join(", ")
                : "Failed to update container"
            );
          });
        }
        return r.json();
      })
      .then((updatedContainer) => {
        const updatedContainers = user.containers.map((c) =>
          c.id === id ? updatedContainer : c
        );
        setUser({ ...user, containers: updatedContainers });
        showToastMessage();
        setTimeout(() => {
          navigate("/");
        }, 1000);
      })
      .catch((error) => {
        setErrors([error.message]); // Set the error message in the errors state
        console.error("Error updating container:", error);
      });
  }

  if (!container) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="edit-container">
      <form className="edit-container__form" onSubmit={handleSubmit}>
        <div className="edit-container__form-row">
          <label className="edit-container__label">
            Team
            <select
              className="edit-container__select button"
              value={team}
              onChange={handleTeamChange}
            >
              {user.teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="edit-container__label">
            Shelf
            <select
              className="edit-container__select button"
              value={shelf}
              onChange={handleShelfChange}
            >
              {[...Array(32).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
          <label className="edit-container__label">
            Row
            <select
              className="edit-container__select button"
              value={row}
              onChange={handleRowChange}
            >
              {["A", "B", "C", "D", "E"].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="edit-container__label">
            Expires:
            <input
              className="edit-container__input"
              type="date"
              value={expires}
              onChange={handleExpiresChange}
              name="expires"
            />
          </label>
        </div>

        {contents.map(
          (content, index) =>
            !content._destroy && (
              <div key={index} className="edit-container__form-row">
                <label className="edit-container__label">
                  Product
                  <select
                    className="edit-container__select button product__select"
                    value={content.product_id}
                    required
                    onChange={(e) =>
                      handleContentChange(
                        index,
                        "product_id",
                        parseInt(e.target.value)
                      )
                    }
                  >
                    <option value="">Select a product</option>
                    {products
                      .slice() // Create a copy of the products array to avoid mutating the original array
                      .sort((a, b) => a.name.localeCompare(b.name)) // Sort the products alphabetically by name
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="edit-container__label">
                  Concentration
                  <input
                    className="edit-container__input--concentration"
                    type="number"
                    required
                    step="any"
                    value={
                      content.concentration === null
                        ? ""
                        : content.concentration
                    }
                    onChange={(e) =>
                      handleContentChange(
                        index,
                        "concentration",
                        e.target.value
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  className="edit-container__button button--remove"
                  onClick={() => handleRemoveContent(index)}
                  disabled={contents.length === 1 && !content._destroy} // Disable the button if there's only one content that is not marked for destruction
                >
                  X
                </button>
              </div>
            )
        )}
        <button
          type="button"
          className="edit-container__button button button--remove"
          onClick={handleAddContent}
        >
          Add More Contents
        </button>
        <button type="submit" className="edit-container__button button">
          Submit
        </button>
        <div className="error">
          {errors.map((error, index) => (
            <p key={index} className="error-message">
              {error}
            </p>
          ))}
        </div>
      </form>
      <ToastContainer autoClose={1000} />
    </div>
  );
}

export default EditContainer;
