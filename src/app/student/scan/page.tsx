import StudentScannerClient from "./StudentScannerClient";

export const metadata = {
    title: "Student QR Scanner | Attendance Portal",
    description: "Scan dynamic live QR code for anti-malpractice attendance verification",
};

export default function StudentScannerPage() {
    return <StudentScannerClient />;
}
