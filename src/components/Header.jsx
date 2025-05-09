import './Header.css';
import profIcon from '../assets/images/prof-icon.jpg';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

function Header() {
    return (
        <div>
            <div className="container">
                <a href="/">
                    <div className="header-profs">
                        <div className="prof-icon">
                            <img src={profIcon} alt="プロフィールアイコン" />
                        </div>
                        <div className="prof-name">
                            <p className="handle">Tsusu</p>
                            <p className="real">Tsubasa KAWAGISHI</p>
                        </div>
                    </div>
                </a>
                
                <div className="header-links">
                    <a href="https://x.com/tsusu0409" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faXTwitter} className="icon" />
                    </a>
                    <a href="https://youtube.com/@tsusu0409" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faYoutube} className="icon" />
                    </a>
                    <a href="https://github.com/tsusu0409" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faGithub} className="icon" />
                    </a>
                    <a href="mailto:tsusu0409@gmail.com" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faEnvelope} className="icon" />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Header;
