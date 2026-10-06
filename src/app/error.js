"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Something went wrong</h1>

        <p>
          We encountered an unexpected error. Please try again.
        </p>

        <button onClick={() => reset()}>
          Try again
        </button>
      </div>
    </main>
  );
}