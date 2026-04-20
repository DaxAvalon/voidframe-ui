import { useState } from "react";
import { Pagination } from "voidframe";

export default function PaginationRoute() {
  const [page, setPage] = useState(3);
  return (
    <>
      <Pagination
        value={page}
        totalPages={10}
        onValueChange={setPage}
        showFirstLast
      />
      <p data-testid="page">page: {page}</p>
      <button data-testid="outside">outside</button>
    </>
  );
}
