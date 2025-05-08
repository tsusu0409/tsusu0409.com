import './Header.css';
import profIcon from '../assets/images/prof-icon.jpg';

function Header() {
    return (
        <div>
            <div className='container'>
                <div className="header-profs">
                    <div className="prof-icon">
                        <img src={profIcon} alt="プロフィールアイコン" />
                    </div>
                    <div className="prof-name">
                        <p className="handle">Tsusu</p>
                        <p className="real">Tsubasa KAWAGISHI</p>
                    </div>
                </div>
                    <div className="header-links">
                </div>
            </div>
        </div>
    );
}

export default Header;
