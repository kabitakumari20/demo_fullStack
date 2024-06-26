import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState(""); // Use useState for state
    const [password, setPassword] = useState(""); // Use useState for state
    const navigate = useNavigate(); // Use navigate to programmatically navigate

    async function submit(e) {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8000/api/user/login", {
                email, password
            });
            // Redirect to another page upon successful registration, e.g., login
            navigate('/login');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="login">
            <h1>Login</h1>
            <form onSubmit={submit}> {/* Use onSubmit on the form */}
                <input
                    type="email"
                    onChange={(e) => setEmail(e.target.value)} // Use value instead of email
                    placeholder="Email"
                    value={email} // Add value attribute to control the input
                />
                <input
                    type="password"
                    onChange={(e) => setPassword(e.target.value)} // Use value instead of password
                    placeholder="Password"
                    value={password} // Add value attribute to control the input
                />
                <input type="submit" value="Login" />
            </form>
            <br />
            <p>OR</p>
           
        </div>
    );
};

export default Login;