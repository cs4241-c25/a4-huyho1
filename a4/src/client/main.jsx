import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import App from "./App";
import Login from "./Login";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<App />} />
                <Route path="*" element={<Navigate to="/login" />} /> {}
            </Routes>
        </Router>
    </React.StrictMode>
);
