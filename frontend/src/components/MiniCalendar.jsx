import { useMemo, useState } from "react";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

function parseDateParts(dateString) {
  if (typeof dateString !== "string") return null;
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) return null;
  return { year, month: month - 1, day };
}

export default function MiniCalendar({ tasks = [] }) {
  const today = useMemo(() => new Date(), []);
  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const dueDays = useMemo(() => {
    const map = new Map();

    tasks.forEach((task) => {
      const parsedDate = parseDateParts(task?.due_date);
      if (!parsedDate) return;

      if (
        parsedDate.year === current.year &&
        parsedDate.month === current.month
      ) {
        const total = map.get(parsedDate.day) ?? 0;
        map.set(parsedDate.day, total + 1);
      }
    });

    return map;
  }, [tasks, current.month, current.year]);

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  function prev() {
    setCurrent((c) => {
      const month = c.month === 0 ? 11 : c.month - 1;
      const year = c.month === 0 ? c.year - 1 : c.year;
      return { month, year };
    });
  }

  function next() {
    setCurrent((c) => {
      const month = c.month === 11 ? 0 : c.month + 1;
      const year = c.month === 11 ? c.year + 1 : c.year;
      return { month, year };
    });
  }

  const cells = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  const isToday = (day) =>
    day === today.getDate() &&
    current.month === today.getMonth() &&
    current.year === today.getFullYear();

  return (
    <section className="mini-cal" aria-label="Mini calendario">
      <div className="mini-cal-header">
        <button
          type="button"
          onClick={prev}
          className="mini-cal-nav"
          aria-label="Mes anterior"
        >
          {"<"}
        </button>
        <span className="mini-cal-title">
          {MONTHS[current.month]} {current.year}
        </span>
        <button
          type="button"
          onClick={next}
          className="mini-cal-nav"
          aria-label="Proximo mes"
        >
          {">"}
        </button>
      </div>

      <div className="mini-cal-grid">
        {DAYS.map((dayName, index) => (
          <span key={`name-${index}`} className="mini-cal-day-name">
            {dayName}
          </span>
        ))}

        {cells.map((day, index) => (
          <span
            key={`day-${index}`}
            className={`mini-cal-day ${day ? "" : "empty"} ${isToday(day) ? "today" : ""}`}
          >
            {day || ""}
            {day && dueDays.has(day) && (
              <span
                className="mini-cal-day-dot"
                title={`${dueDays.get(day)} tarefa(s) com prazo neste dia`}
              />
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
