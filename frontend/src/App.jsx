import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import OtpPage from "./pages/OtpPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import { ROUTES } from "./routes";

export default function App() {
    const [page, setPage] = useState(ROUTES.LOGIN);
    const [phone, setPhone] = useState("");
    const [profile, setProfile] = useState(null);

    if (page === ROUTES.LOGIN) {
        return (
            <LoginPage
                onSendOtp={(p, mode) => {
                    setPhone(p);
                    setPage(mode === "register" ? ROUTES.PROFILE : ROUTES.OTP);
                }}
            />
        );
    }

    if (page === ROUTES.OTP) {
        return (
            <OtpPage
                phone={phone}
                onVerified={() => setPage(ROUTES.PROFILE)}
            />
        );
    }

    if (page === ROUTES.PROFILE) {
        return (
            <ProfilePage
                onComplete={(p) => {
                    setProfile(p);
                    setPage(ROUTES.DASHBOARD);
                }}
            />
        );
    }

    if (page === ROUTES.DASHBOARD && profile) {
        return <DashboardPage profile={profile} />;
    }

    return null;
}
