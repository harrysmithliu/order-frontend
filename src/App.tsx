import { useEffect, useState } from "react";

interface Order {
  id: number;
  orderNo: string;
  username: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: string;
}

function App() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/orders?page=0&size=20")
      .then((res) => res.json())
      .then((data) => setOrders(data.content || []))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Order List</h2>
      {orders.length === 0 ? (
        <p>Loading...</p>
      ) : (
        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Order No</th>
              <th>User</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.orderNo}</td>
                <td>{o.username}</td>
                <td>{o.productName}</td>
                <td>{o.quantity}</td>
                <td>${o.totalAmount.toFixed(2)}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
