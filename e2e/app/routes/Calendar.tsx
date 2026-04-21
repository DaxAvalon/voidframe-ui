import { useState } from "react";
import { Calendar } from "voidframe";

export default function CalendarRoute() {
  // Display-only variant: no selection/value, just day-click feedback.
  // Fixed defaultDisplayMonth so Prev/Next assertions can check the
  // month heading changes deterministically.
  const [picked, setPicked] = useState<Date | null>(null);
  return (
    <>
      <Calendar
        view="month"
        defaultDisplayMonth={new Date(2026, 3, 1)}
        onDayClick={(d) => setPicked(d)}
      />
      <span data-testid="picked">
        {picked ? picked.toISOString().slice(0, 10) : "none"}
      </span>
      <button data-testid="outside">outside</button>
    </>
  );
}
