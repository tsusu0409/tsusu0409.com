import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import yaml from 'js-yaml';
import rehypeRaw from 'rehype-raw';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './BlogPost.css';

const posts = import.meta.glob('../blog/*.md', { query: '?raw', import: 'default' });

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

    console.log('Front Matter:', data);
    return { data, body };
}

function BlogPost() {
    const { slug } = useParams();
    const [content, setContent] = useState('');
    const [metadata, setMetadata] = useState(null);

    useEffect(() => {
        const filePath = `../blog/${slug}.md`;
        const loadPost = async () => {
            console.log(filePath);

            if (posts[filePath]) {
                const md = await posts[filePath]();
                const { data, body } = parseFrontMatter(md);
                setMetadata(data);
                setContent(body);
            } else {
                setContent('# 404\n記事が見つかりませんでした。');
            }
        };
        loadPost();
    }, [slug]);

    
    if (!metadata) return <div>Loading...</div>;

    return (
        <div className="page-wrapper">
            <Header />
            <div className="container">
                <div className="post-head">
                    <h1 className="title">{metadata.title}</h1>
                    <p className="author-date">{metadata.author} | {metadata.date}</p>
                    {metadata.tags && (
                        <div className="tags">
                            {metadata.tags.map((tag, index) => (
                                <p key={index} className="tag">#{tag}</p>
                            ))}
                        </div>
                    )}
                </div>
                <div className="markdown-body">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default BlogPost;