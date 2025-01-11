import React, { useContext, useMemo } from "react";
import { UserContext } from "../contexts/UserContext";
import { ProductsContext } from "../contexts/ProductsContext";

function Totals() {
  const { user } = useContext(UserContext);
  const { products } = useContext(ProductsContext);

  const uniquePrescriptions = useMemo(() => {
    const prescriptionMap = new Map();

    user.containers.forEach((container) => {
      const filteredContents = container.contents.filter(
        (content) => content.concentration < 100 // Exclude 100% concentration
      );

      if (filteredContents.length > 0) {
        // Sort by concentration in descending order, and by product name in case of a tie
        const sortedPrescription = filteredContents
          .map((content) => {
            const product = products.find((p) => p.id === content.product_id);
            const productName = product ? product.name : "Unknown Product";
            return { concentration: content.concentration, productName };
          })
          .sort((a, b) => {
            // Sort first by concentration, then by product name (alphabetically) if concentrations are equal
            if (b.concentration !== a.concentration) {
              return b.concentration - a.concentration;
            }
            return a.productName.localeCompare(b.productName);
          });

        const keyString = JSON.stringify(sortedPrescription);

        // Tally the prescription
        if (prescriptionMap.has(keyString)) {
          prescriptionMap.set(keyString, prescriptionMap.get(keyString) + 1);
        } else {
          prescriptionMap.set(keyString, 1);
        }
      }
    });

    // Convert prescriptionMap to an array for rendering
    return Array.from(prescriptionMap.entries()).map(
      ([keyString, quantity]) => {
        const prescription = JSON.parse(keyString);
        return {
          prescription,
          quantity,
        };
      }
    );
  }, [user.containers, products]);

  // Create an object to hold the count of containers per product with 100% concentration
  const productCounts = {};

  // Initialize the productCounts with all product IDs and set the count to 0
  products.forEach((product) => {
    productCounts[product.id] = 0;
  });

  // Count the containers with 100% concentration for each product
  user.containers.forEach((container) => {
    container.contents.forEach((content) => {
      if (content.concentration === 100) {
        productCounts[content.product_id] += 1;
      }
    });
  });

  // Sort products by name in ascending alphabetical order
  const sortedProducts = [...products].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const concentrateComps = sortedProducts.map((product) => (
    <tr key={product.id}>
      <td>{product.name}</td>
      <td>{productCounts[product.id]}</td>
    </tr>
  ));

  const totalPrescriptions = uniquePrescriptions.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalConcentrates = Object.values(productCounts).reduce(
    (total, count) => total + count,
    0
  );

  return (
    <div className="inventory-container">
      <div className="table-container">
        <h2 className="h2">Concentrate Inventory</h2>
        <div className="table-total">Total Containers: {totalConcentrates}</div>
        <table className="table margin-top-1em">
          <thead>
            <tr className="table-header-row">
              <th>Product</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>{concentrateComps}</tbody>
        </table>
      </div>
      <div className="inventory-table-container inventory-table-container--premix">
        <h2 className="inventory-table-container__title">Premix Inventory</h2>
        <div className="inventory-table-total">
          Total Containers: {totalPrescriptions}
        </div>
        <table className="teams-table">
          <thead>
            <tr>
              <th>Prescription</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {uniquePrescriptions
              .sort((a, b) => b.quantity - a.quantity)
              .map((item, index) => (
                <tr key={index}>
                  <td className="premix-table__td">
                    {item.prescription.map((entry, idx) => (
                      <div key={idx} className="prescription-item">
                        <div>{entry.concentration}%</div>
                        <div>{entry.productName}</div>
                      </div>
                    ))}
                  </td>
                  <td className="totals__table-td">{item.quantity}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Totals;
