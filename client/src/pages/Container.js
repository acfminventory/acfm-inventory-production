import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ProductsContext } from "../contexts/ProductsContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Container() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, setUser } = useContext(UserContext);
  const { products } = useContext(ProductsContext);
  const [expirationClass, setExpirationClass] = useState(""); // State to manage expiration class

  const container = user.containers.find(
    (container) => container.id === parseInt(id)
  );

  const showToastMessage = () => {
    toast("Container removed!", {
      className: "custom-toast",
      progressClassName: "Toastify__progress-bar",
    });
  };
  useEffect(() => {
    if (container) {
      const today = new Date();
      const expires = new Date(container.expires);
      const threeMonthsFromNow = new Date(
        today.getFullYear(),
        today.getMonth() + 3,
        today.getDate()
      );

      if (expires < threeMonthsFromNow) {
        setExpirationClass("text-red"); // Set text to red if expiration is within 3 months
      } else {
        setExpirationClass(""); // Clear the class if expiration is not within 3 months
      }
    }
  }, [container]);

  if (!container) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  function handleDelete() {
    fetch(`/containers/${id}`, {
      method: "DELETE",
    })
      .then((r) => {
        if (!r.ok) {
          return r.json().then((error) => {
            throw new Error(error.error || "Failed to delete container");
          });
        }
        if (r.status === 204) {
          return {};
        }
        return r.json();
      })
      .then(() => {
        const updatedContainers = user.containers.filter(
          (container) => container.id !== parseInt(id)
        );
        showToastMessage();
        setTimeout(() => {
          setUser({ ...user, containers: updatedContainers });
          navigate(-1);
        }, 1000);
      })
      .catch((error) => {
        console.error("Error deleting container:", error);
      });
  }

  // Calculate the number of contents in the container
  const numContents = container.contents.length;

  // Sort the contents by concentration in descending order
  const sortedContents = container.contents
    .slice()
    .sort((a, b) => b.concentration - a.concentration);

  const handleBack = () => {
    // Save current scroll position before navigating
    navigate("/");
  };

  return (
    <div className="flex-column-center page-height">
      <button onClick={handleBack} className="button">
        Back to Shelves
      </button>
      <table className="inventory-table margin-top-4em">
        <thead>
          <tr>
            <th>Expires</th>
            <th>Team</th>
            <th>Shelf</th>
            <th>Row</th>
            <th colSpan={numContents + 1}>Contents</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={expirationClass}>
              {container.expires.slice(0, 10)}
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
        </tbody>
      </table>
      <div className="product-options-wrapper">
        <div className="product-options">
          <Link
            to={`/containers/${id}/edit`}
            className="button button-width link-button"
          >
            Edit
          </Link>
          <button className="button--remove" onClick={handleDelete}>
            Remove
          </button>
        </div>
      </div>
      <ToastContainer autoClose={1000} />
    </div>
  );
}

export default Container;
