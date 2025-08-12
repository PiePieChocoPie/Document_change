import React, { useState } from "react";
import * as mammoth from "mammoth";

export default function WordUniversalParser() {
  const [jsonData, setJsonData] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const rawText = result.value;
      const parsed = parseUniversal(rawText);
      setJsonData(parsed);
    } catch (err) {
      console.error("Ошибка чтения файла:", err);
    }
  };

  const parseUniversal = (text) => {
    const lines = text.split(/\r?\n/).map(l => l.trim());
    const data = [];
    let currentSection = null;

    const isHeading = (line) => {
      if (!line) return false;

      
      if (/^\d+(\.\d+)*\s+/.test(line)) return true;

      
      if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s+/.test(line)) return true;

 
      if (/^(Тема|Глава|Раздел)\b/i.test(line)) return true;

   
      if (line.length < 60 && line === line.toUpperCase() && /[А-ЯA-Z]/.test(line)) return true;

    
      return false;
    };

    lines.forEach((line, idx) => {
      if (isHeading(line)) {
        currentSection = { title: line, content: [] };
        data.push(currentSection);
      } else if (line) {
        if (!currentSection) {
          currentSection = { title: "Без темы", content: [] };
          data.push(currentSection);
        }
        currentSection.content.push(line);
      }
    });

    return data;
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
