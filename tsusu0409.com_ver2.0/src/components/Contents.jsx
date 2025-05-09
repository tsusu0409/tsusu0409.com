import './Contents.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Contents() {
    return (
        <div>
            <div className="container">
                <div className="content">
                    <h1 class="cat-title">About</h1>
                    <div className="about-contents">
                        <p>
                            筑波大学 理工学群 応用理工学類 電子・量子工学主専攻 3年<br />
                            アルティメット同好会INVERHOUSE #24<br />
                            学園祭実行委員会jsys23, jsys24
                        </p>
                        <p>
                            千葉県立東葛飾中学校2期卒業生<br />
                            千葉県立東葛飾高等学校95期卒業生(第26代生徒会放送局長, 2022年度合唱祭幹部)
                        </p>
                        <p>
                            パソコンを狭く浅く細々と勉強しています。<br />
                            AtCoder Beginner ContestやOnlineMathContestにときどきよく参加します。<br />
                            AtCoder茶 / OMC緑
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contents;
