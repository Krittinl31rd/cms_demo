import React, { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  isWithinInterval,
} from "date-fns";

const DateRangePicker = ({ onRangeSelect }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !isMobile &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  const handleDateClick = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (isBefore(date, startDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      setEndDate(date);
    }
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    onRangeSelect({ startDate: null, endDate: null });
    setShowCalendar(false);
  };

  const handleDone = () => {
    if (startDate && endDate) {
      onRangeSelect({ startDate, endDate });
      setShowCalendar(false);
    }
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-2">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
        &lt;
      </button>
      <span className="font-medium">{format(currentMonth, "MMMM yyyy")}</span>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
        &gt;
      </button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const date = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={i}
          className="text-center text-xs font-semibold text-gray-500"
        >
          {format(addDays(date, i), "EEE")}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-1">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDateOfGrid = startOfWeek(monthStart);
    const endDateOfGrid = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDateOfGrid;

    while (day <= endDateOfGrid) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;
        const isSelectedStart = startDate && isSameDay(day, startDate);
        const isSelectedEnd = endDate && isSameDay(day, endDate);
        const inRange =
          startDate &&
          endDate &&
          isWithinInterval(day, { start: startDate, end: endDate });

        const isCurrentMonth = isSameMonth(day, monthStart);
        const classNames = `
          text-center py-1 text-sm cursor-pointer transition-all rounded-xl
          ${isSelectedStart || isSelectedEnd ? "bg-blue-500 text-white" : ""}
          ${inRange && !isSelectedStart && !isSelectedEnd ? "bg-blue-100" : ""}
          ${
            !isCurrentMonth ? "text-gray-400" : "text-gray-800 hover:bg-blue-50"
          }
        `;

        days.push(
          <div
            key={day}
            onClick={() => handleDateClick(cloneDay)}
            className={classNames}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="relative w-full max-w-xs">
      <input
        readOnly
        onClick={() => setShowCalendar(true)}
        value={
          startDate && endDate
            ? `${format(startDate, "yyyy-MM-dd")} - ${format(
                endDate,
                "yyyy-MM-dd"
              )}`
            : "Select range date"
        }
        className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showCalendar && (
        <div
          className={`z-50 ${
            isMobile
              ? "fixed inset-0 bg-black/60 flex items-center justify-center"
              : "absolute top-10 p-0 w-72 shadow-md"
          }`}
        >
          <div
            ref={calendarRef}
            className={`bg-white p-4 rounded-md shadow-lg ${
              isMobile ? "w-11/12 max-w-md" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold">Select range date</span>
              {isMobile && (
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-red-500 text-sm"
                >
                  Close
                </button>
              )}
            </div>

            {renderHeader()}
            {renderDays()}
            {renderCells()}

            <div className="mt-4 flex justify-between items-center gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-1 text-sm rounded-xl border border-gray-300 hover:bg-gray-100"
              >
                Reset
              </button>
              <button
                onClick={handleDone}
                disabled={!startDate || !endDate}
                className={`flex-1 py-1 text-sm rounded-xl text-white ${
                  startDate && endDate
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
