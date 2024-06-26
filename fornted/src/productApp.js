import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/product';

const api = {
    addProduct: async (user, body) => {
        try {
            const response = await axios.post(`${API_URL}/addProduct`, body, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error adding product:', error.response || error.message);
            throw error;
        }
    },
    getProductList: async (user) => {
        try {
            const response = await axios.get(`${API_URL}/getProductList`
                // , {
                //     headers: { Authorization: `Bearer ${user.token}` }
                // }
            );
            console.log("API response:", response);
            return response.data;
        } catch (error) {
            if (error.response) {
                console.error('Error response:', error.response);
            } else {
                console.error('Error message:', error.message);
            }
            throw error;
        }
    },
    updateProductById: async (user, id, body) => {
        try {
            const response = await axios.put(`${API_URL}/updateProductById/${id}`, body, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating product by ID:', error.response || error.message);
            throw error;
        }
    },
    deleteProductById: async (user, id) => {
        try {
            const response = await axios.delete(`${API_URL}/deleteProductById/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting product by ID:', error.response || error.message);
            throw error;
        }
    },
}

const ProducatApp = () => {
    const user = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjZkZDBlM2Q0NDVhODg0Mzk5YjVlOTUiLCJpYXQiOjE3MTg0NzI5NTF9.bRcGbpsldubP4HclvCXN_YulBMWf_dnV3OqA355qMzY'
    };

    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState({
        productName: '', colour: '', size: '', deliveryTime: '', price: '', description: "",
        quantity: ''

    });
    const [productId, setProductId] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.getProductList(user);
                setProducts(response.result);
            } catch (error) {
                console.error('Error fetching products:', error.response || error.message);
            }
        };

        fetchProducts();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prevProduct) => ({
            ...prevProduct,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (productId) {
                await api.updateProductById(user, productId, product);
            } else {
                await api.addProduct(user, product);
            }
            // Refresh the product list
            const response = await api.getProductList(user);
            setProducts(response.result);
            // Reset the form
            setProduct({
                productName: '', colour: '', size: '', deliveryTime: '', price: '', description: "", quantity: ''

            });
            setProductId(null);
        } catch (error) {
            console.error('Error submitting product:', error.response || error.message);
        }
    };

    const handleEdit = (id) => {
        const productToEdit = products.find(product => product._id === id);
        setProduct(productToEdit);
        setProductId(id);
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteProductById(user, id);
            // Refresh the product list
            const response = await api.getProductList(user);
            setProducts(response.result);
        } catch (error) {
            console.error('Error deleting product:', error.response || error.message);
        }
    };

    return (
        <div>
            <h1>Product Management</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="productName"
                    value={product.productName}
                    onChange={handleChange}
                    placeholder="Product Name"
                    required
                />
                <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    placeholder="Price"
                    required
                />
                <select
                    name="colour"
                    value={product.colour}
                    onChange={handleChange}
                >
                    <option value="">Select colour</option>
                    <option value="GREEN">GREEN</option>
                    <option value="RED">RED</option>
                    <option value="YELLOW">YELLOW</option>
                    <option value="PINK">PINK</option>
                    <option value="ASK-BLUE">ASK-BLUE</option>
                    <option value="ORANGE">ORANGE</option>
                    <option value="BLACK">BLACK</option>
                    <option value="other">Other</option>
                </select>
                <select
                    name="size"
                    value={product.size}
                    onChange={handleChange}
                >
                    <option value="">Select Size</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="XXXL">XXXL</option>
                </select>
                <input
                    type="text"
                    name="deliveryTime"
                    value={product.deliveryTime}
                    onChange={handleChange}
                    placeholder="Delivery Time"
                />
                <input
                    type="text"
                    name="description"
                    value={product.description}
                    onChange={handleChange}

                    placeholder="Description"
                />

                <input
                    type="text"
                    name="quantity"
                    value={product.quantity}
                    placeholder="Quantity"
                />
                <button type="submit">{productId ? 'Update' : 'Submit'}</button>
            </form>

            <h2>Product List</h2>
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Colour</th>
                        <th>Size</th>
                        <th>Price</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Delivery Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product._id}>
                            <td>{product.productName}</td>
                            <td>{product.colour}</td>
                            <td>{product.size}</td>
                            <td>{product.price}</td>
                            <td>{product.description}</td>
                            <td>{product.quantity}</td>
                            <td>{product.deliveryTime}</td>
                            <td>
                                <button onClick={() => handleEdit(product._id)}>Edit</button>
                                <button onClick={() => handleDelete(product._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProducatApp;
