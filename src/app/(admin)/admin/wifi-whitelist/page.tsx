import WifiWhitelistClient from "./WifiWhitelistClient";

export const metadata = {
    title: "Wi-Fi Whitelist | Admin Console",
    description: "Manage anti-malpractice authorized Wi-Fi networks and IP subnets",
};

export default function WifiWhitelistPage() {
    return <WifiWhitelistClient />;
}
