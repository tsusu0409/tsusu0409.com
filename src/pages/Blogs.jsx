import './Blogs.css';
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



function Blogs() {
    
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

        loadedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(loadedPosts);
        }

        loadPosts();
    }, []);


    return (
        <div className="page-wrapper">
            <Header />
            <div className="container">
                <div className="content">
                    <h1 className="cat-title">ブログ一覧</h1>
                    <ul>
                        {posts.map((post) => (
                        <li key={post.slug} className="list-blog">
                            <h2>{post.title}</h2>
                            <p>{post.description}</p>
                            <p>{post.date}</p>
                            <a href={`/posts/${post.slug}`}>&raquo;続きを読む</a>
                        </li>
                        ))}
                    </ul>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Blogs;