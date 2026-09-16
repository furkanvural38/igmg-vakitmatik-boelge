// src/app/routes.tsx
import { createHashRouter, redirect } from "react-router-dom";
import { CityAppWrapper } from "./CityAppWrapper";
import { StatusScreen } from "./StatusScreen";

/** Wird angesteuert, wenn keine Stadt in der URL steht. */
const DEFAULT_CITY = "hannover";

// HashRouter, weil die Anzeige unter QtWebEngine/Anthias ohne History-Server läuft.
export const router = createHashRouter([
    {
        path: "/:cityKey",
        element: <CityAppWrapper />,
        errorElement: (
            <StatusScreen
                tone="error"
                title="Fehler beim Routen"
                detail="Bitte eine gültige Stadt-URL aufrufen."
            />
        ),
    },
    {
        path: "/",
        loader: () => redirect(`/${DEFAULT_CITY}`),
    },
    {
        path: "*",
        element: (
            <StatusScreen
                title="Bitte Stadt-URL aufrufen"
                detail={
                    <span className="font-mono text-brand">
                        /hannover · /braunschweig · /wolfsburg
                    </span>
                }
            />
        ),
    },
]);
