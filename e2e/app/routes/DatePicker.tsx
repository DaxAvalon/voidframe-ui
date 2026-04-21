import { useState } from "react";
import { DatePicker } from "voidframe-ui";

export default function DatePickerRoute() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 3, 15));
  return (
    <>
      <DatePicker
        label="Start date"
        value={date}
        onValueChange={setDate}
        inline
      />
      <p data-testid="value">{date ? date.toISOString().slice(0, 10) : "—"}</p>
      <button data-testid="outside">outside</button>
    </>
  );
}
