import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppNav from "./components/AppNav/AppNav";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={
                    <AppNav />
                }
            />
            </Routes>
        </BrowserRouter>
    );
}