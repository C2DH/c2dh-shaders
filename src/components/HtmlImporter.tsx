import React, { useEffect, useState } from "react";

interface HTMLImporterProps {
  path: string;
}

const HTMLImporter: React.FC<HTMLImporterProps> = ({ path }) => {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        return response.text();
      })
      .then((data) => setHtmlContent(data))
      .catch((error) => console.error(error));
  }, [path]);
  console.log(path);
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default HTMLImporter;
