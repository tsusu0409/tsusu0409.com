import './Top.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Top() {
    return (
        <div className="page-wrapper">
            <Header />
            <div className="container">
                <div className="content">
                    <h1 className="cat-title">About</h1>
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
                            <a href="https://atcoder.jp/users/tsusu0409">&raquo;AtCoder<span class="brown">茶</span></a> / <a href="https://onlinemathcontest.com/users/tsusu0409">&raquo;OMC<span class="green">緑</span></a>
                        </p>
                    </div>
                </div>

                <div className="content">
                    <h1 className="cat-title">Blogs</h1>
                    <div className="blog-contents">

                        <div className="article">
                            <h2 className="article-title">Blog1 Title</h2>
                            <p className="article-detail">
                                ここにはBlog1の詳細が記載されます。<br />
                                2行くらいにまとまるといいねと思っています。
                            </p>
                            <p className="article-date">2025-04-09</p>
                            <p className="article-tag">#tag1</p>
                            <p className="article-tag">#tag2</p>
                            <p className="article-tag">#tag3</p>
                        </div>

                        <div className="article">
                            <h2 className="article-title">Blog2 Title</h2>
                            <p className="article-detail">
                                ここにはBlog2の詳細が記載されます。<br />
                                2行くらいにまとまるといいねと思っています。
                            </p>
                            <p className="article-date">2025-04-09</p>
                            <p className="article-tag">#tag1</p>
                            <p className="article-tag">#tag2</p>
                            <p className="article-tag">#tag3</p>
                        </div>

                        <div className="article">
                            <h2 className="article-title">Blog3 Title</h2>
                            <p className="article-detail">
                                ここにはBlog3の詳細が記載されます。<br />
                                2行くらいにまとまるといいねと思っています。
                            </p>
                            <p className="article-date">2025-04-09</p>
                            <p className="article-tag">#tag1</p>
                            <p className="article-tag">#tag2</p>
                            <p className="article-tag">#tag3</p>
                        </div>

                        <div className="link-blogs">
                            <a href="/blogs"><p>&raquo; Blogs</p></a>
                        </div>

                    </div>
                </div>

                <div className="content">
                    <h1 className="cat-title">Works</h1>
                    <div className="work-contents">
                        <a href="https://github.com/tsusu0409/Soramame" target="_blank" rel="noopener noreferrer">
                            <div className="work">
                            <h2 className="work-title">Soramame</h2>
                            <p className="work-detail">
                                予備校などでの導入を想定した、試験会場用の受付システムを作りました。<br />
                                サーバーに個人情報等をアップロードすることなく利用できます。
                            </p>
                            <p className="work-tag">#tag1</p>
                            <p className="work-tag">#tag2</p>
                            <p className="work-tag">#tag3</p>
                            </div>  
                        </a>
                        
                    </div>
                    <div className="link-works">
                        <a href="/works"><p>&raquo; Works</p></a>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}

export default Top;