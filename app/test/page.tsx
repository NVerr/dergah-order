"use client";

import { useState } from "react";

export default function TestPage() {
  const [count, setCount] = useState(0);

  return (
    <main style={{ padding: 40, fontSize: 24 }}>
      <p>Zähler: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          fontSize: 24,
          padding: "20px 40px",
          background: "blue",
          color: "white",
          marginTop: 20,
        }}
      >
        Klick mich
      </button>
    </main>
  );
}
