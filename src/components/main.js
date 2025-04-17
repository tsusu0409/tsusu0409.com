import React from "react";

class Main extends React.Component {
    render(){
        return(
            <div className="main">
                <div className="about">
                    <h1>About</h1>
                    <div className="content">
                        <div className="name">
                            <p className="name-jp">川岸翼</p>
                            <p className="name-en">Tsubasa KAWAGISHI</p>
                        </div>
                        <ul>
                            <li>筑波大学 理工学群 応用理工学類 電子・量子工学主専攻</li>
                            <li>アルティメット同好会 INVERHOUSE #24</li>
                            <li>学園祭実行委員会 jsys23 jsys24</li>
                        </ul>
                        <p>筑波大学に通う大学3年生です。AtCoderやOMCを時々やります。</p>
                        <p>東葛飾中学校2期卒業生/東葛飾高等学校95期卒業生(生徒会放送局長,合唱祭幹部など)</p>
                    </div>
                </div>

                <div className="works">
                    <h1>Works</h1>
                    <div className="content">
                        <p>まだないよ</p>
                    </div>
                </div>
            </div>
        );
    }
}
export default Main;