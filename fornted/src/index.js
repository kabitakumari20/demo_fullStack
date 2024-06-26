import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './userApp';
import Login from './login';
import Signup from './signup';
import Product from "./productApp";
import PrintProduct from './PrintProduct';
import OrderForm from "./orderApp"
const root = document.getElementById('root');

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter> { }
      <Routes>
        <Route path="/user" element={<App />} />
        {/* <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> */}
        {<Route path="/product" element={<Product />} />}
        {<Route path="/order" element={<OrderForm />} />}

        {/* {<Route path="/PrintProduct" element={<PrintProduct />} /> } */}


      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  root
);
