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
} from "date-fns";

const DateTimePicker = ({ onDateTimeSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (calendarRef.current && !calendarRef.current.contains(event.target)) {
  //       setShowCalendar(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
  };

  const handleDone = (e) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(hours);
      combinedDateTime.setMinutes(minutes);
      onDateTimeSelect(combinedDateTime);
      setShowCalendar(false);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setSelectedDate(null);
    setSelectedTime("12:00");
    // onDateTimeSelect(null);
    // setShowCalendar(false);
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
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const classNames = `
          text-center py-1 text-sm cursor-pointer transition-all rounded-xl
          ${isSelected ? "bg-blue-500 text-white" : ""}
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
          selectedDate
            ? `${format(selectedDate, "yyyy-MM-dd")} ${selectedTime}`
            : "Select date & time"
        }
        className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showCalendar && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div
            ref={calendarRef}
            className="bg-white p-4 rounded-md shadow-lg w-11/12 max-w-md"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold">Select date & time</span>
              <button
                onClick={(e) => {
                  handleDone(e);
                  setShowCalendar(false);
                }}
                className="text-red-500 text-sm"
              >
                Close
              </button>
            </div>

            {renderHeader()}
            {renderDays()}
            {renderCells()}

            <div className="mt-3">
              <label className="block text-sm mb-1">Select time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              />
            </div>

            <div className="mt-4 flex justify-between items-center gap-2">
              <button
                onClick={(e) => handleReset(e)}
                className="flex-1 py-1 text-sm rounded-xl border border-gray-300 hover:bg-gray-100"
              >
                Reset
              </button>
              <button
                onClick={(e) => handleDone(e)}
                disabled={!selectedDate}
                className={`flex-1 py-1 text-sm rounded-xl text-white ${
                  selectedDate
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

export default DateTimePicker;
