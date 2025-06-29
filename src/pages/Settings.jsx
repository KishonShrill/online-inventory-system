import '../styles/settings.scss'

const Settings = () => {
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
                            <input className="settings__info-input" readOnly defaultValue="Admin"/>
                        </div>
                        <div>
                            <label className="settings__info-label">Email</label>
                            <input className="settings__info-input" readOnly defaultValue="admin@inventory.com"/>
                        </div>
                        <button className="settings__info-updateBtn">Update Profile</button>
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
                                <input type="checkbox" />
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