import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

// Hàm tạo class card bằng cách mô phỏng cva đơn giản
function policyCard({ size = "default", shadow = "bold" }) {
  const base =
    "transition-transform transform rounded-2xl p-6 bg-white dark:bg-neutral-900 overflow-y-auto max-h-[80vh]";

  const sizeMap = {
    default: "w-full md:w-[600px]",
    large: "w-full md:w-[800px]",
  };

  const shadowMap = {
    subtle: "shadow-md",
    bold: "shadow-2xl",
  };

  return `${base} ${sizeMap[size]} ${shadowMap[shadow]}`;
}

function Policy() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/policy/Policy.md")
      .then((res) => res.text())
      .then((text) => setContent(text));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-neutral-200 dark:to-neutral-3000 flex items-center justify-center p-4">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className={policyCard({ size: "default", shadow: "bold" })}
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      >
        <div className="prose dark:prose-invert prose-indigo max-w-none text-white">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </motion.div>
    </div>
  );
}

export default Policy;
