import React, { useState } from "react";
import * as mammoth from "mammoth";

export default function WordNestedParser() {
  const [jsonData, setJsonData] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const rawText = result.value;
      const parsed = parseToTree(rawText);
      setJsonData(parsed);
    } catch (err) {
      console.error("Ошибка чтения файла:", err);
    }
  };

  const parseToTree = (text) => {
    const lines = text.split(/\r?\n/).map(l => l.trim());
    const root = [];
    const stack = []; 

    const isHeading = (line) => {
      if (!line) return false;
      if (/^\d+(\.\d+)*\s+/.test(line)) return true; 
      if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s+/.test(line)) return true; 
      if (/^(Тема|Глава|Раздел)\b/i.test(line)) return true; 
      if (line.length < 60 && line === line.toUpperCase() && /[А-ЯA-Z]/.test(line)) return true; 
      return false;
    };

    const getLevel = (line) => {
      const numMatch = line.match(/^(\d+(\.\d+)*)/);
      if (numMatch) {
        return numMatch[1].split(".").length;
      }
      return 1; 
    };

    lines.forEach(line => {
      if (isHeading(line)) {
        const level = getLevel(line);
        const newSection = { title: line, content: [], children: [] };

     
        while (stack.length >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          root.push(newSection);
        } else {
          stack[stack.length - 1].children.push(newSection);
        }

        stack.push(newSection);
      } else if (line) {
        if (stack.length === 0) {
          const untitled = { title: "Без темы", content: [line], children: [] };
          root.push(untitled);
          stack.push(untitled);
        } else {
          stack[stack.length - 1].content.push(line);
        }
      }
    });

    return root;
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Загрузите Word (.docx)</h2>
      <input type="file" accept=".docx" onChange={handleFileChange} />
      <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
        {jsonData ? JSON.stringify(jsonData, null, 2) : "JSON появится здесь..."}
      </pre>
    </div>
  );
}
