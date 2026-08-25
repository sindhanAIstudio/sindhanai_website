import CalendarClient from "./CalendarClient";

export const metadata = {
    title: "Smart Attendance & Worklog Calendar | Admin Console",
    description: "Manage institutional holidays, special events, faculty worklogs, and SOI lab attendance calculations",
};

export default function CalendarPage() {
    return <CalendarClient />;
}
