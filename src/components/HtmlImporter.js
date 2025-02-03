import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
const HTMLImporter = ({ path }) => {
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
    return _jsx("div", { dangerouslySetInnerHTML: { __html: htmlContent } });
};
export default HTMLImporter;
