"use client";

import { useState } from "react";

export default function Carousel() {
  const images = [
    "/1.png",
    "/2.webp",
    "/3.jpg",
    "/4.webp",
    "/5.webp",
  ];

  const [index, setIndex] = useState(0);

  return (
    <div style={{ textAlign: "center" }}>
      <img
        src={images[index]}
        style={{ width: 260, height: 260, borderRadius: 12, objectFit: "cover" }}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}>
          ⬅
        </button>

        <button onClick={() => setIndex((i) => (i + 1) % images.length)}>
          ➡
        </button>
      </div>
    </div>
  );
}