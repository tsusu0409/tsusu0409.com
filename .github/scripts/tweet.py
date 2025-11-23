import sys
import os
import re
import tweepy
from pathlib import Path

def extract_frontmatter_title(filepath):
    """マークダウンファイルのフロントマターからtitleを抽出"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # フロントマター部分を抽出（---で囲まれた部分）
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return None
    
    frontmatter = match.group(1)
    
    # titleを抽出
    title_match = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', frontmatter, re.MULTILINE)
    if title_match:
        return title_match.group(1)
    
    return None

def tweet(message):
    client = tweepy.Client(
        consumer_key=os.environ['TWITTER_API_KEY'],
        consumer_secret=os.environ['TWITTER_API_SECRET'],
        access_token=os.environ['TWITTER_ACCESS_TOKEN'],
        access_token_secret=os.environ['TWITTER_ACCESS_SECRET']
    )
    client.create_tweet(text=message)
    print(f"Tweeted: {message}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python tweet.py <filepath>")
        sys.exit(1)
    
    filename = sys.argv[1]
    title = extract_frontmatter_title(filename)
    
    if not title:
        print(f"Could not extract title from {filename}")
        sys.exit(1)
    
    slug = Path(filename).stem
    url = f"https://tsusu0409.com/blog/{slug}"
    tweet_text = f"New Post!\n{title} | Tsusu\n{url}"
    
    tweet(tweet_text)