import { useEffect } from 'react';
import styles from '../styles/components/MatchFoundModal.module.css';
import { useNavigate } from 'react-router-dom';


const MatchFoundModal = ({ 
    isVisible, 
    setIsVisible,
}) => {
    const navigate = useNavigate();

    const containerStyle = isVisible ? "container-visible" : "container-not-visible";

    useEffect(() => {
        if (isVisible) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            setTimeout(() => navigate('/testroom'), 3000);

        } else {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        }
    }, [isVisible]);

    return (
        <div className={styles[containerStyle]}>
            <div className={styles["main-container"]}>
                <h1>Match Found</h1>
                <p>Redirecting to room...</p>
            </div>
        </div>
    )
};

export default MatchFoundModal;