import { useEffect, useState } from "react";
import { authService } from '../services/authServices';
import '../styles/Dashboard.css'

const PasswordModalOpen = ({ isOpen, onClose, onSave }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setCofirmPassword] = useState('');

    const [error, setError] = useState('');

    const handleSave = async () => {

        // Basic Validation
        if (currentPassword == newPassword) {
            setError('New Password equal to Current Password.');
            return;
        }
        if (newPassword != confirmPassword) {
            setError('Password do not match.');
            return;
        }

        try {
            await authService.changePassword(currentPassword, newPassword, confirmPassword);
            onSave();
            onClose();
        } catch (error) {
            setError('Unable to update password.')
        }
    }

    if (!isOpen) return null;

    return (
        <div className="model-overlay">
            <div className="model-content">
                <h2>Change Password</h2>
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setCofirmPassword(e.target.value)}
                    />
                </div>
                <div className="modal-action">
                    <button className="btn btn-seconday" onClick={onClose}>
                        CANCEL
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        SAVE
                    </button>
                </div>
            </div>
        </div>
    )
}

const UsersTable = () => {
    const [allusers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const response = await authService.getAllUsers();
                setAllUsers(response);
                setLoading(false);
            } catch (error) {
                setError('Failed to get users');
                setLoading(false);
            }
        };
        fetchAllUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        try {
            await authService.deleteUser(userId);
            setAllUsers(allusers.filter(user => user.userId !== userId));
        } catch (error) {
            console.error("Failed to delete the user");
            setError('Failed to delete the user.')
        }
    };

    if (loading) {
        return <div className="loading-spinner">loading...</div>
    }

    if (error) return <div className="error-message">{error}</div>

    return (
        <div className="users-table-container">
            <h2>ALL USERS </h2>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {allusers.map(user => (
                        <tr key={user.userId}>
                            <td>{user.userId}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                                <button className="btn btn-danger"
                                    onClick={() => handleDeleteUser(user.userId)}>DELETE USER</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Dashboard = () => {

    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('home');
    const [loading, setLoading] = useState(true);

    // to check Admin 
    const [isAdmin, setIsAdmin] = useState(false);

    //Profile Editing status
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({});

    // Password modal
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const currentUser = authService.getCurrentUser();
                if (!currentUser) {
                    setLoading(false);
                    return;
                }
                setUser(currentUser);
                setEditedUser(currentUser);

                // check if the user role is Admin or not
                const userRoles = currentUser.roles || [];
                setIsAdmin(userRoles.includes('ROLE_ADMIN'));

            } catch (error) {
                console.error("Error fetching user data", error);
            }
            finally {
                setLoading(false);
            }
        };

        fetchUserData();

    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = async () => {
        try {
            await authService.updateProfile(editedUser);
            setUser(editedUser);
            setIsEditing(false);
        } catch (error) {
            console.error("failed to update profile", error);
        }
    };

    const handleCancelEdit = () => {
        setEditedUser(user);
        setIsEditing(false);
    };

    if (loading) {
        return <div className="loading-spinner">loading...</div>
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-sidebar">
                <div className={`dashboard-menu-item ${activeSection === 'home' ? 'active' : ''}`}
                    onClick={() => setActiveSection('home')}>
                    HOME
                </div>

                <div className={`dashboard-menu-item ${activeSection === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveSection('profile')}>
                    PROFILE
                </div>

                <div className={`dashboard-menu-item ${activeSection === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveSection('settings')}>
                    SETTINGS
                </div>

                {isAdmin && (
                    <div className={`dashboard-menu-item ${activeSection === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveSection('users')}>
                        USERS
                    </div>
                )}
            </div>
            <div className="dashboard-content">
                {activeSection === 'home' && (
                    <div className="daashboard-home">
                        <h2>Welcome, {user.username}</h2>
                        <p>SOME CONTENT</p>
                    </div>
                )}

                {activeSection === 'profile' && (
                    <div className="dashboard-profile">
                        <h2>User Profile Information </h2>
                        <div className="profile-details">
                            <div className="profile-field">
                                <label htmlFor="username">Username: </label>
                                <input
                                    type="text"
                                    name="username"
                                    id="username"
                                    value={isEditing ? editedUser.username : user.username}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className="profile-field">
                                <label htmlFor="email">Email: </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={isEditing ? editedUser.email : user.email}
                                    onChange={handleInputChange}
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className="profile-actions">

                                {!isEditing ? (
                                    <>
                                        <button className="btn btn-primary"
                                            onClick={handleEditToggle}>
                                            EDIT
                                        </button>

                                        <button className="btn btn-seconday"
                                            onClick={() => setIsPasswordModalOpen(true)}>
                                            CHANGE PASSWORD
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn btn-primary" onClick={handleSaveProfile}>
                                            SAVE
                                        </button>
                                        <button className="btn btn-seconaday" onClick={handleCancelEdit}>
                                            CANCEL
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {activeSection === 'settings' && (
                    <div className="daashboard-settings">
                        <h2>Settings</h2>
                        <p>SOME SETTINGS CONTENT</p>
                    </div>
                )}
                {activeSection === 'users' && isAdmin && (
                    <UsersTable />
                )}
            </div>
            <PasswordModalOpen
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSave={() => {
                    console.log('Password Changed Successfully');
                }}
            />
        </div>
    );
};

export default Dashboard;