import React from 'react';
import { User, Scale, Ruler, Heart, Moon, Footprints } from 'lucide-react';
import './css/userinfo.css';

interface UserInfoProps {
    user: {
        first_name?: string;
        last_name?: string;
    } | null;
    healthData: {
        weight?: number;
        height?: number;
        heart_rate?: number;
        sleep_hours?: number;
        steps?: number;
    } | null;
}

const UserInfo: React.FC<UserInfoProps> = ({ user, healthData }) => {
    const photo = localStorage.getItem('profile_photo');

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
                <div className="avatar-icon">
                    {photo
                        ? <img src={photo} alt="profil" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                        : <User size={28} color="#10b981" />
                    }
                </div>
                <span className="user-name">{user?.first_name} {user?.last_name}</span>
                <span className="profile-tag">Profil Santé</span>
            </div>

            <div className="info-list">
                <div className="info-item">
                    <div className="info-label">
                        <Scale size={18} /> <span>Poids</span>
                    </div>
                    <span className="info-value">{healthData?.weight ? `${healthData.weight} kg` : '--'}</span>
                </div>

                <div className="info-item">
                    <div className="info-label">
                        <Ruler size={18} /> <span>Taille</span>
                    </div>
                    <span className="info-value">{healthData?.height ? `${healthData.height} cm` : '--'}</span>
                </div>

                <div className="info-item">
                    <div className="info-label">
                        <Heart size={18} /> <span>Fréquence</span>
                    </div>
                    <span className="info-value">{healthData?.heart_rate ? `${healthData.heart_rate} bpm` : '--'}</span>
                </div>

                <div className="info-item">
                    <div className="info-label">
                        <Moon size={18} /> <span>Sommeil</span>
                    </div>
                    <span className="info-value">{healthData?.sleep_hours ? `${healthData.sleep_hours} h` : '--'}</span>
                </div>

                <div className="info-item">
                    <div className="info-label">
                        <Footprints size={18} /> <span>Pas</span>
                    </div>
                    <span className="info-value">{healthData?.steps ? `${healthData.steps}` : '--'}</span>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;