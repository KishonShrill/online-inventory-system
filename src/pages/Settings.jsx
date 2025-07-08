
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'universal-cookie';
import '../styles/settings.scss'
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../redux/actions/darkModeActions';



const Settings = () => {
    const cookies = new Cookies()
    const token = cookies.get("CDIIS-OIS")
    const decoded = jwtDecode(token)
    const navigate = useNavigate()
    const darkMode = useSelector(state => state.darkMode.enabled);
    const dispatch = useDispatch();

    const logout = () => {
        cookies.remove("CDIIS-OIS", { path: "/" });
        window.location.pathname = '/';
    }

    return (
        <>
            <title>CDIIS OIS - Settings</title>
            <div>
                <h1 className="settings__title">Settings</h1>
                <div className="settings__info-container">
                    <h3 className="settings__info-title">Account Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="settings__info-label">Username</label>
                            <input className="settings__info-input" readOnly defaultValue={decoded.userName} />
                        </div>
                        <div>
                            <label className="settings__info-label">Email</label>
                            <input className="settings__info-input" readOnly defaultValue={decoded.userEmail} />
                        </div>
                        <div style={{display: "flex", justifyContent: "flex-end"}}>
                            {/* <button className="settings__info-btn update">Update Profile</button> */}
                            <button className="settings__info-btn danger" onClick={() => logout()}>Sign Out</button>
                        </div>
                    </div>

                    <hr className="my-8"/>

                    <h3 className="settings__info-title">System Settings</h3>
                    <div className="space-y-4">
                        <div className="settings__actions-container">
                            <span>Enable Email Notifications</span>
                            <label className="switch">
                                <input type="checkbox" defaultChecked/>
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="settings__actions-container">
                            <span>Dark Mode</span>
                            <label className="switch">
                                <input type="checkbox" checked={darkMode} onChange={()=>dispatch(toggleDarkMode())} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings
