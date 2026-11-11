import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { authService } from '../services/authServices'
import '../styles/Login.css'

const Login = () => {

    const[username,setUsername] = useState('');
    const[password,setPassword] = useState('');
    const[error,setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await authService.login(username,password);
            navigate("/");
        } catch (error) {
            setError('Login failed. Please check your credentials. ');
            console.error('Login error',error);
        }
    };
  
    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Login</h2>
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input 
                            type="text"
                            name="username" 
                            id="username" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                         />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password"
                            name="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                         />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                    <p>Don&apos;t have an account ? <Link to='/signup'> Signup</Link></p>
                </form>
            </div>
        </div>
    );
};

export default Login;
