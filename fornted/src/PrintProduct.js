import React, { useState } from 'react'
import axios from 'axios'

function PrintProduct() {
    const [product, setProduct] = useState([{}])
    const res = axios.get("http://localhost:8000/api/product/getProducatList")
    setProduct(res.data)
    return (
        <div>

        </div>
    )
}

export default PrintProduct
