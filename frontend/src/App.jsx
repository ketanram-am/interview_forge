import {
  Show,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/react";

import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/problems"
          element={
            <Show when="signed-in" fallback={<Navigate to={"/"} />}>
              <ProblemsPage />
            </Show>
          }
        />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;

// tw, daisyui, react-router, react-hot-toast,
// todo: react-query aka tanstack query, axios