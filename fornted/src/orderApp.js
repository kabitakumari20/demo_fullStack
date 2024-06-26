import React, { useEffect, useState } from 'react';
import axios from 'axios';

// API URL
const API_URL = 'http://localhost:8000/api';

// Helper functions for API calls
const api = {
  addOrder: async (user, body) => {
    try {
      const response = await axios.post(`${API_URL}/order/addOrder`, body,
        // {
        //   headers: { Authorization: `Bearer ${user.token}` }
        // }
      );
      return response.data;
    } catch (error) {
      console.error('Error while ordering product:', error.response || error.message);
      throw error;
    }
  },

  getOrderList: async (user) => {
    try {
      const response = await axios.get(`${API_URL}/order/getOrderList`,
        // {
        //   headers: { Authorization: `Bearer ${user.token}` }
        // }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting order list:', error.response || error.message);
      throw error;
    }
  },
};

const OrderForm = () => {
  const user = {
    token: 'your-token-here' // Replace with actual token
  };

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.getOrderList(user);
        setOrders(response.result); // Adjust if response structure differs
      } catch (error) {
        console.error('Error fetching orders:', error.response || error.message);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/product/getProductList`);
        setProducts(response.data.result); // Assuming the API returns a 'result' field with the products
      } catch (error) {
        console.error('Error fetching product list:', error);
      }
    };

    fetchOrders();
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productId = e.target.productId.value;
    try {
      await api.addOrder(user, { productId });
      const response = await api.getOrderList(user);
      setOrders(response.result);
    } catch (error) {
      console.error('Error submitting order:', error.response || error.message);
    }
  };

  return (
    <div>
      <h1>Order Management</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Select Product:
          <select name="productId">
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.productName}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Order Product</button>
      </form>

      <h1>Order List</h1>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Product Name</th>
            <th>Claimed</th>
            <th>Approve Status</th>
            <th>Delivery Status</th>
            <th>Total Amount</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.orderId}</td>
              <td>{order.productName}</td>
              <td>{order.isClimed ? 'Yes' : 'No'}</td>
              <td>{order.approveStatus}</td>
              <td>{order.deliveryStatus}</td>
              <td>{order.totalAmount}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>{new Date(order.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderForm;
