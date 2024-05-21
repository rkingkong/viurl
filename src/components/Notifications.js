import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notifications = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`/api/notifications/${userId}`);
                setNotifications(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchNotifications();
    }, [userId]);

    const markAsRead = async notificationId => {
        try {
            const res = await axios.post(`/api/notifications/${notificationId}/read`);
            setNotifications(notifications.map(n => n._id === notificationId ? res.data : n));
        } catch (err) {
            console.error(err.response.data);
        }
    };

    return (
        <div>
            <h1>Notifications</h1>
            {notifications.map(notification => (
                <div key={notification._id}>
                    <p>{notification.content}</p>
                    <p>{notification.read ? 'Read' : 'Unread'}</p>
                    {!notification.read && (
                        <button onClick={() => markAsRead(notification._id)}>Mark as Read</button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Notifications;
