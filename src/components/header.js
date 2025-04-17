import React from 'react';

class Header extends React.Component {
    render(){
        return(
            <header>
                <div className="header-center">
                    <img src="img/profile.png" height="96px" />
                </div>
                <div className="header-right">
                    <a href="https://x.com/tsusu0409"><img src="img/x-logo.png" height="24px" /></a>
                    <a href="https://www.youtube.com/@tsusu0409"><img src="img/youtube-logo.png" height="24px" /></a>
                    <a href="mailto:tsusu0409@gmail.com"><img src="img/mail-logo.png" height="24px" /></a>
                </div>
            </header>
        );
    }
}

export default Header;