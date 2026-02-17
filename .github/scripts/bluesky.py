import sys
import os
import re
from pathlib import Path
from atproto import Client

def extract_frontmatter_title(filepath):
    """マークダウンファイルのフロントマターからtitleを抽出"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return None

    frontmatter = match.group(1)

    title_match = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', frontmatter, re.MULTILINE)
    if title_match:
        return title_match.group(1)

    return None

def post_to_bluesky(message):
    client = Client()
    client.login(
        os.environ['BLUESKY_HANDLE'],
        os.environ['BLUESKY_APP_PASSWORD']
    )
    client.send_post(text=message)
    print(f"Posted to Bluesky: {message}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python bluesky.py <filepath>")
        sys.exit(1)

    filename = sys.argv[1]
    title = extract_frontmatter_title(filename)

    if not title:
        print(f"Could not extract title from {filename}")
        sys.exit(1)

    slug = Path(filename).stem
    url = f"https://tsusu0409.com/blog/{slug}"
    post_text = f"New Post!\n{title} | Tsusu\n{url}"

    post_to_bluesky(post_text)