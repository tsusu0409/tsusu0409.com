import './Top.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

import { useEffect, useState } from 'react';
import yaml from 'js-yaml';

const postFiles = import.meta.glob('../posts/*.md', { as: 'raw' });

function parseFrontMatter(content) {
  const match = /^---\n([\s\S]+?)\n---/.exec(content);
  if (!match) return { data: {}, body: content };

  const yamlContent = match[1];
  const body = content.slice(match[0].length).trim();

  let data = {};
  try {
    data = yaml.load(yamlContent);
  } catch (e) {
    console.error('YAMLパースエラー:', e);
  }

  return { data, body };
}

function Top() {
    const [posts, setPosts] = useState([]);
    
        useEffect(() => {
            async function loadPosts() {
            const loadedPosts = [];
    
            for (const path in postFiles) {
                const content = await postFiles[path]();
                const { data } = parseFrontMatter(content);
    
                loadedPosts.push({
                ...data,
                slug: path.split('/').pop().replace('.md', ''),
                });
            }
    
            const sorted = loadedPosts
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3);

             setPosts(sorted);
            }

            loadPosts();
        }, []);
    

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
                    <h1 className="cat-title">Recent Posts</h1>
                    <ul>
                        {posts.map((post) => (
                        <li key={post.slug} className="post">
                            <h2 className="post-title">{post.title}</h2>
                            <p className="post-description">{post.description}</p>
                            <p className="post-date">{post.date}</p>
                            {post.tags && (
                                <ul className="tags">
                                {post.tags.map((tag) => (
                                    <li key={tag} className="post-tag">#{tag}</li>
                                ))}
                                </ul>
                            )}
                            <a href={`/posts/${post.slug}`} className="next-btn">&raquo; 続きを読む</a>
                        </li>
                        ))}
                    </ul>
                    <div className="link-blogs">
                        <a href="/blogs"><p>&raquo; ブログ一覧へ</p></a>
                    </div>
                </div>

                <div className="content">
                    <h1 className="cat-title">Works</h1>
                    <div className="work-contents">
                        <div className="work">
                            <a href="https://github.com/tsusu0409/Soramame" target="_blank" rel="noopener noreferrer">
                            <h2 className="work-title">Soramame</h2>
                            <p className="work-detail">
                                予備校などでの導入を想定した、試験会場用の受付システムを作りました。<br />
                                サーバーに個人情報等をアップロードすることなく利用できます。
                            </p>
                            <p className="work-tag">#html</p>
                            <p className="work-tag">#css</p>
                            <p className="work-tag">#javascript</p>
                            </a>
                        </div>
                        
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