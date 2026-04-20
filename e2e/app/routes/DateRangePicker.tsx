import { useState } from "react";
import { DateRangePicker } from "voidframe";

export default function DateRangePickerRoute() {
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: new Date(2026, 3, 10),
    end: new Date(2026, 3, 20),
  });
  return (
    <>
      <DateRangePicker
        label="Trip dates"
        value={range}
        onValueChange={setRange}
        min={new Date(2026, 3, 1)}
        max={new Date(2026, 3, 30)}
        numberOfMonths={2}
      />
      <p data-testid="value">
        {range.start?.toISOString().slice(0, 10) ?? "—"} →{" "}
        {range.end?.toISOString().slice(0, 10) ?? "—"}
      </p>
      <button data-testid="outside">outside</button>
    </>
  );
}
