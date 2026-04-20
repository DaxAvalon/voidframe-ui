import { useState } from "react";
import { FileUpload, type UploadItem } from "voidframe";

export default function FileUploadRoute() {
  const [items, setItems] = useState<UploadItem[]>([]);
  return (
    <>
      <FileUpload
        label="Upload files"
        onValueChange={setItems}
        maxFiles={3}
      />
      <p data-testid="count">count: {items.length}</p>
      <ul data-testid="names">
        {items.map((item) => (
          <li key={item.id}>{item.file.name}</li>
        ))}
      </ul>
      <button data-testid="outside">outside</button>
    </>
  );
}
