import AttendanceReportClient from "./AttendanceReportClient";

export const metadata = {
    title: "Fair Attendance & Defaulters Dashboard | Admin Console",
    description: "View automated attendance percentages excluding Sundays, Holidays, and Zero-Attendance Days",
};

export default function AttendanceReportPage() {
    return <AttendanceReportClient />;
}
