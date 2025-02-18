import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate(); // React Router for navigation

    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (result.success) {
            navigate("/home");
        } else {
            setErrorMessage("Invalid username or password.");
        }
    };

    const handleGitHubLogin = () => {
        window.location.href = "/auth/github";
    };

    return (
        <div className="bg-blue-100 flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-center text-gray-800">Sign In</h2>

                {errorMessage && <div className="text-red-500 text-sm mb-2">{errorMessage}</div>}

                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg transition">
                        Sign In
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">or</p>
                    <button
                        onClick={handleGitHubLogin}
                        className="w-full mt-3 bg-gray-800 text-white py-2 rounded-lg transition"
                    >
                        Login with GitHub
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
