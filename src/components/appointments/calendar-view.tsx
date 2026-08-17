"use client";

import { useState } from "react";
import { AppointmentWithDetails, AppointmentStatus } from "@/types/appointment";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { StatusQuickActions } from "./status-quick-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  ArrowUpRight,
} from "lucide-react";

type ViewMode = "month" | "week" | "day" | "list";

export function CalendarView({
  appointments,
}: {
  appointments: AppointmentWithDetails[];
}) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filtering
  const filteredAppointments = appointments.filter((apt) => {
    if (statusFilter !== "all" && apt.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Date Navigation handlers
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() - 1);
    else if (viewMode === "week") d.setDate(d.getDate() - 7);
    else if (viewMode === "day") d.setDate(d.getDate() - 1);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + 1);
    else if (viewMode === "week") d.setDate(d.getDate() + 7);
    else if (viewMode === "day") d.setDate(d.getDate() + 1);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formattedHeader = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    if (viewMode === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${endOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Week calculations
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter((apt) => {
      const aptDate = new Date(apt.start_time);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Calendar Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 transition"
            >
              <ChevronLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            </button>
            <button
              onClick={handleNext}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 transition -ml-px"
            >
              <ChevronRight className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            </button>
          </div>
          <h2 className="ml-2 text-base font-bold text-zinc-900 dark:text-zinc-100">
            {formattedHeader()}
          </h2>
        </div>

        {/* View Switcher & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 outline-none transition focus:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>

          {/* View Mode Pills */}
          <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950">
            {(["month", "week", "day", "list"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition ${
                  viewMode === mode
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Link href="/appointments/new">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              Book
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. MONTH VIEW */}
      {viewMode === "month" && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/70 text-center text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2.5">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-zinc-200 dark:divide-zinc-800">
            {blanksArray.map((_, i) => (
              <div
                key={`blank-${i}`}
                className="min-h-[110px] bg-zinc-50/30 p-2 dark:bg-zinc-950/20"
              />
            ))}

            {daysArray.map((dayNum) => {
              const cellDate = new Date(year, month, dayNum);
              const dayApts = getAppointmentsForDate(cellDate);
              const todayFlag = isToday(cellDate);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[110px] p-2 transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 ${
                    todayFlag ? "bg-blue-50/20 dark:bg-blue-950/10" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        todayFlag
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayApts.length > 0 && (
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {dayApts.length} {dayApts.length === 1 ? "apt" : "apts"}
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 space-y-1">
                    {dayApts.slice(0, 3).map((apt) => (
                      <Link
                        key={apt.id}
                        href={`/appointments/${apt.id}`}
                        className="group block truncate rounded-md border border-zinc-200/70 bg-white px-1.5 py-1 text-[11px] font-medium shadow-xs transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-800/80"
                      >
                        <div className="flex items-center gap-1">
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              apt.status === "confirmed"
                                ? "bg-purple-500"
                                : apt.status === "completed"
                                ? "bg-emerald-500"
                                : apt.status === "cancelled"
                                ? "bg-rose-500"
                                : "bg-blue-500"
                            }`}
                          />
                          <span className="text-zinc-500 shrink-0">
                            {formatTime(apt.start_time)}
                          </span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {apt.patients?.first_name} {apt.patients?.last_name}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {dayApts.length > 3 && (
                      <div className="text-center text-[10px] font-medium text-zinc-400">
                        +{dayApts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {viewMode === "week" && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-7 divide-x divide-zinc-200 border-b border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {weekDays.map((d, i) => {
              const todayFlag = isToday(d);
              return (
                <div
                  key={i}
                  className={`py-3 text-center ${
                    todayFlag ? "bg-blue-50/30 dark:bg-blue-950/20" : "bg-zinc-50/50 dark:bg-zinc-950"
                  }`}
                >
                  <span className="text-[11px] font-medium text-zinc-400">
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <div
                    className={`mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      todayFlag
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 divide-x divide-zinc-200 min-h-[400px] dark:divide-zinc-800">
            {weekDays.map((d, i) => {
              const dayApts = getAppointmentsForDate(d);
              return (
                <div key={i} className="p-2 space-y-2">
                  {dayApts.map((apt) => (
                    <Link
                      key={apt.id}
                      href={`/appointments/${apt.id}`}
                      className="block rounded-xl border border-zinc-200 bg-white p-2.5 text-xs shadow-xs transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-800"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {apt.patients?.first_name} {apt.patients?.last_name}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {apt.duration_minutes}m
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500 truncate">
                        {apt.title}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                          {formatTime(apt.start_time)}
                        </span>
                        <AppointmentStatusBadge status={apt.status} />
                      </div>
                    </Link>
                  ))}
                  {dayApts.length === 0 && (
                    <div className="py-8 text-center text-[11px] text-zinc-400">
                      No bookings
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DAY VIEW */}
      {viewMode === "day" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Schedule for {formattedHeader()}
            </h3>
            <span className="text-xs text-zinc-400">
              {getAppointmentsForDate(currentDate).length} Appointments
            </span>
          </div>

          {getAppointmentsForDate(currentDate).length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              No appointments scheduled for this date.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {getAppointmentsForDate(currentDate).map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                      <Clock className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/appointments/${apt.id}`}
                          className="font-bold text-zinc-900 hover:underline dark:text-zinc-100"
                        >
                          {apt.title}
                        </Link>
                        <AppointmentStatusBadge status={apt.status} />
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                        <span>
                          {formatTime(apt.start_time)} – {formatTime(apt.end_time)} ({apt.duration_minutes}m)
                        </span>
                        {apt.patients && (
                          <Link
                            href={`/patients/${apt.patients.id}`}
                            className="flex items-center gap-1 text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white"
                          >
                            <User className="h-3 w-3" />
                            {apt.patients.first_name} {apt.patients.last_name}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusQuickActions
                      appointmentId={apt.id}
                      currentStatus={apt.status}
                    />
                    <Link href={`/appointments/${apt.id}`}>
                      <Button size="xs" variant="ghost">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. AGENDA / LIST VIEW */}
      {viewMode === "list" && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-400">
              No appointments matching the selected filter.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Treatment / Title</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="transition-colors hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-6 py-4 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      <div>
                        {new Date(apt.start_time).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-zinc-400">{formatTime(apt.start_time)}</div>
                    </td>

                    <td className="px-6 py-4">
                      {apt.patients ? (
                        <Link
                          href={`/patients/${apt.patients.id}`}
                          className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
                        >
                          {apt.patients.first_name} {apt.patients.last_name}
                        </Link>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-zinc-700 dark:text-zinc-300">
                      <Link
                        href={`/appointments/${apt.id}`}
                        className="font-medium hover:underline text-zinc-900 dark:text-zinc-100"
                      >
                        {apt.title}
                      </Link>
                      {apt.service_name && (
                        <div className="text-zinc-400">{apt.service_name}</div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {apt.duration_minutes} mins
                    </td>

                    <td className="px-6 py-4">
                      <AppointmentStatusBadge status={apt.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <StatusQuickActions
                          appointmentId={apt.id}
                          currentStatus={apt.status}
                        />
                        <Link href={`/appointments/${apt.id}`}>
                          <Button size="xs" variant="ghost">
                            View
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
