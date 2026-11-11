import { useNavigate } from 'react-router-dom';
import '../styles/Mainpage.css'


const Mainpage = () => {
    const navigate = useNavigate();

    const handleGettingStarted = () => {
        // DO ANYTHING HERE
        navigate('/signup');
    };

    const handleLearnMore = () => {
        window.open('https://google.com','_blank');
    };
    
    return (
        <div className='home-container'>
            <div className="home-title">
                Welcome to User Management Application
            </div>
            <div className="home-buttons">
                <button
                    className='btn btn-primary'
                    onClick={handleGettingStarted} >
                    Getting Started
                </button>
                <button
                    className='btn btn-secondary'
                    onClick={handleLearnMore} >
                    Learn More
                </button>
            </div>
        </div>
    )
};

export default Mainpage;
