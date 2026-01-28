import React from 'react';
import './css/userinfo.css';

interface UserInfoProps {
    user: {
        first_name?: string;
        last_name?: string;
        age?: number;
        gender?: string;
    } | null;
    healthData: {
        weight?: number;
        height?: number;
        heart_rate?: number;
        sleep_hours?: number;
        calories_burned?: number;
        steps?: number;
    } | null;
}

const UserInfo: React.FC<UserInfoProps> = ({ user, healthData }) => {
    if (!user && !healthData) {
        return (
            <div className="user-info-container empty">
                <p>Chargement du profil...</p>
            </div>
        );
    }

    return (
        <div className="user-info-container">
            <div className="user-header">
                <h3>👤 Profil</h3>
                <span className="user-name">{user?.first_name} {user?.last_name}</span>
            </div>

            <div className="info-list">
                <div className="info-item">
                    <span className="info-label">Poids</span>
                    <span className="info-value">{healthData?.weight ? `${healthData.weight} kg` : '--'}</span>
                </div>

                <div className="info-item">
                    <span className="info-label">Taille</span>
                    <span className="info-value">{healthData?.height ? `${healthData.height} cm` : '--'}</span>
                </div>

                <div className="info-item">
                    <span className="info-label">Fréquence cardiaque</span>
                    <span className="info-value">{healthData?.heart_rate ? `${healthData.heart_rate} bpm` : '--'}</span>
                </div>

                <div className="info-item">
                    <span className="info-label">Sommeil (moy)</span>
                    <span className="info-value">{healthData?.sleep_hours ? `${healthData.sleep_hours} h` : '--'}</span>
                </div>

                <div className="info-item">
                    <span className="info-label">Pas (dernier relevé)</span>
                    <span className="info-value">{healthData?.steps ? `${healthData.steps}` : '--'}</span>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
