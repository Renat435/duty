import React, { useEffect, useState } from "react";
import "./Calendar.scss";
import ArrowIcon from '../../assets/icons/arrow-icon.svg?react';
import { type User } from "../../api/user.ts";
import { Duty, getAllDuties, addOrRemoveDuty } from "../../api/duty.ts";

// Функция для получения локальной строки даты в формате YYYY-MM-DD
const getLocalDateString = (date: Date): string => {
    const offset = date.getTimezoneOffset() * 60000; // смещение в миллисекундах
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().split('T')[0];
};

// Функция для сравнения дат (без учёта времени)
const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

interface DayData {
    date: Date;
    currentMonth: boolean;
}

interface MonthData {
    weeks: DayData[][];
    monthDate: Date;
}

// Генерация календарной сетки
const getMonthData = (year: number, month: number): MonthData => {
    const monthDate = new Date(year, month, 1);
    const firstDateOfMonth = new Date(year, month, 1);
    const lastDateOfMonth = new Date(year, month + 1, 0);

    const firstDayOfGrid = new Date(firstDateOfMonth);
    const firstDayOffset = (firstDateOfMonth.getDay() + 6) % 7;
    firstDayOfGrid.setDate(firstDateOfMonth.getDate() - firstDayOffset);

    const lastDayOfGrid = new Date(lastDateOfMonth);
    const lastDayOffset = (6 - (lastDateOfMonth.getDay() + 6) % 7) % 7;
    lastDayOfGrid.setDate(lastDateOfMonth.getDate() + lastDayOffset);

    const weeks: DayData[][] = [];
    const currentDate = new Date(firstDayOfGrid);

    while (currentDate <= lastDayOfGrid) {
        const week: DayData[] = [];
        for (let i = 0; i < 7; i++) {
            week.push({
                date: new Date(currentDate),
                currentMonth: currentDate.getMonth() === month,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(week);
    }

    return { weeks, monthDate };
};

// Проверка, прошла ли дата
function isDatePassed(date: Date): boolean {
    const dateWithoutTime = new Date(date);
    dateWithoutTime.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateWithoutTime < today;
}

const Calendar: React.FC<{ user: User }> = ({ user }) => {
    const today = new Date();
    const currentMonthRef = new Date(today.getFullYear(), today.getMonth(), 1);
    const prevLimit = new Date(currentMonthRef.getFullYear(), currentMonthRef.getMonth() - 1, 1);
    const nextLimit = new Date(currentMonthRef.getFullYear(), currentMonthRef.getMonth() + 1, 1);

    const [displayedDate, setDisplayedDate] = useState<Date>(currentMonthRef);
    const [duties, setDuties] = useState<Duty[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDuty, setSelectedDuty] = useState<Duty | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Форматирование данных пользователя
    const formattedUser = `[${user.id}] ${user.name}`;

    const handlePrevMonth = () => {
        const newDate = new Date(displayedDate.getFullYear(), displayedDate.getMonth() - 1, 1);
        if (newDate.getTime() >= prevLimit.getTime()) {
            setDisplayedDate(newDate);
        }
    };

    const handleNextMonth = () => {
        const newDate = new Date(displayedDate.getFullYear(), displayedDate.getMonth() + 1, 1);
        if (newDate.getTime() <= nextLimit.getTime()) {
            setDisplayedDate(newDate);
        }
    };

    // Открытие модального окна при клике на день
    const handleDayClick = (date: Date) => {
        if (isDatePassed(date)) {
            return; // Ничего не делаем для прошедших дат
        }
        // Используем функцию getLocalDateString для корректного получения строки даты
        const dateStr = getLocalDateString(date);
        const duty = duties.find(d => d.date === dateStr) || { date: dateStr, attendants: [], reserves: [] };
        setSelectedDate(date);
        setSelectedDuty(duty);
        setModalVisible(true);
    };

    // Обработка добавления или удаления дежурства/запаса
    const dutyHandler = async (
        operation: 'add' | 'remove',
        dateStr: string,
        type: 'attendants' | 'reserves'
    ) => {
        const changed = await addOrRemoveDuty(dateStr, operation, formattedUser, type);
        if (changed) {
            await fetchDuties();
            if (selectedDate) {
                const updated = (await getAllDuties()).find(d => d.date === dateStr);
                setSelectedDuty(updated || null);
            }
        }
    };

    async function fetchDuties() {
        try {
            const fetchedDuties = await getAllDuties();
            setDuties(fetchedDuties);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        }
    }

    useEffect(() => {
        fetchDuties();
    }, []);

    const { weeks, monthDate } = getMonthData(displayedDate.getFullYear(), displayedDate.getMonth());

    return (
        <div className="calendar-wrapper">
            <div className="calendar">
                <div className="calendar-header">
                    <button
                        className="arrow-button arrow-button--left"
                        onClick={handlePrevMonth}
                        disabled={displayedDate.getTime() === prevLimit.getTime()}
                    >
                        <ArrowIcon />
                    </button>
                    <h3 className="calendar-header__title">
                        {monthDate.toLocaleString("ru-RU", {
                            month: "long",
                            year: "numeric",
                        })}
                    </h3>
                    <button
                        className="arrow-button"
                        onClick={handleNextMonth}
                        disabled={displayedDate.getTime() === nextLimit.getTime()}
                    >
                        <ArrowIcon />
                    </button>
                </div>
                <table className="month-table">
                    <thead>
                    <tr>
                        <th>Пн</th>
                        <th>Вт</th>
                        <th>Ср</th>
                        <th>Чт</th>
                        <th>Пт</th>
                        <th>Сб</th>
                        <th>Вс</th>
                    </tr>
                    </thead>
                    <tbody>
                    {weeks.map((week, i) => (
                        <tr key={i}>
                            {week.map(({ date, currentMonth }) => {
                                const dateStr = getLocalDateString(date);
                                const duty = duties.find(d => d.date === dateStr);
                                const attendants = duty ? duty.attendants : [];
                                const reserves = duty ? duty.reserves || [] : [];
                                const isToday = isSameDay(date, today);
                                const haveDuties = attendants.length > 0 || reserves.length > 0;
                                const isUserDuty = duty && attendants.includes(formattedUser);
                                const isUserReserve = duty && reserves.includes(formattedUser);

                                return (
                                    <td
                                        key={dateStr}
                                        className={`day 
                        ${isToday ? "today" : ""} 
                        ${!currentMonth ? "not-current-month" : ""}
                        ${isDatePassed(date) ? "passed" : ""}
                        ${haveDuties ? "has-duty" : ""}
                        ${(isUserDuty || isUserReserve) ? "user-signed-up" : ""}
                      `}
                                        onClick={() => currentMonth && handleDayClick(date)}
                                    >
                                        <div className="date-number">{date.getDate()}</div>
                                        <div className="duty-info">
                                            {attendants.length > 0 && (
                                                <div className="duty-list">
                                                    <span className="list-label">Дежурство:</span>
                                                    {attendants.map((att, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`list-item ${att === formattedUser ? "current-user" : ""}`}
                                                        >
                                {att}
                              </span>
                                                    ))}
                                                </div>
                                            )}
                                            {reserves.length > 0 && (
                                                <div className="reserve-list">
                                                    <span className="list-label">Запас:</span>
                                                    {reserves.map((res, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`list-item ${res === formattedUser ? "current-user" : ""}`}
                                                        >
                                                            {res}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {modalVisible && selectedDuty && selectedDate && (
                <div className="modal-overlay" onClick={() => setModalVisible(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-date">{selectedDate.toLocaleDateString("ru-RU")}</h3>
                            <button className="modal-close" onClick={() => setModalVisible(false)}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-column">
                                <strong>Дежурство:</strong>
                                {selectedDuty.attendants.length > 0 ? (
                                    <ul>
                                        {selectedDuty.attendants.map((att, idx) => (
                                            <li key={idx} className={att === formattedUser ? "current-user" : ""}>
                                                {att} {att === formattedUser && <span className="you-label">(вы)</span>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Пусто</p>
                                )}
                            </div>
                            <div className="modal-column">
                                <strong>Запас:</strong>
                                {selectedDuty.reserves && selectedDuty.reserves.length > 0 ? (
                                    <ul>
                                        {selectedDuty.reserves.map((res, idx) => (
                                            <li key={idx} className={res === formattedUser ? "current-user" : ""}>
                                                {res} {res === formattedUser && <span className="you-label">(вы)</span>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Пусто</p>
                                )}
                            </div>
                        </div>

                        <div className="modal-buttons">
                            {selectedDuty.attendants.includes(formattedUser) ? (
                                <button
                                    onClick={() =>
                                        dutyHandler('remove', selectedDuty.date, 'attendants')
                                    }
                                >
                                    Сняться с дежурства
                                </button>
                            ) : (
                                <button onClick={() =>
                                    dutyHandler('add', selectedDuty.date, 'attendants')
                                }>
                                    Дежурить
                                </button>
                            )}
                            {selectedDuty.reserves && selectedDuty.reserves.includes(formattedUser) ? (
                                <button
                                    onClick={() =>
                                        dutyHandler('remove', selectedDuty.date, 'reserves')
                                    }
                                >
                                    Сняться с запаса
                                </button>
                            ) : (
                                <button onClick={() =>
                                    dutyHandler('add', selectedDuty.date, 'reserves')
                                }>
                                    Быть в запасе
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
