import "./App.css";
import { Show, SignInButton, UserButton } from "@clerk/react";

function App() {
  return (
    <>
      <h1>Welcome to the app</h1>

      <Show when="signed-out">
        <SignInButton mode="modal">Login</SignInButton>
      </Show>

      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}

export default App;