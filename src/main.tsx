import './polyfills';
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import "./styles/index.css";
// src/main.tsx – ganz oben



const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root-Element (#root) fehlt in index.html");

ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

