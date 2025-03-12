import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppNav from "./components/AppNav/AppNav"; // Adjust path if needed

export default function App() {
    return (
        <BrowserRouter>
            <AppNav />
        </BrowserRouter>
    );
}