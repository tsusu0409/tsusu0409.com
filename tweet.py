import tweepy
import os
import sys
from pathlib import Path

def tweet_blog_update(filename):
    # Twitter API の認証情報
    api_key = os.getenv("TWITTER_API_KEY")
    api_secret = os.getenv("TWITTER_API_SECRET")
    access_token = os.getenv("TWITTER_ACCESS_TOKEN")
    access_secret = os.getenv("TWITTER_ACCESS_SECRET")

    # 認証
    client = tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_secret
    )

    # 拡張子を除いたファイル名
    slug = Path(filename).stem
    url = f"https://tsusu0409.com/blog/{slug}"
    tweet_text = f"blogが更新されました\n{url}"

    try:
        client.create_tweet(text=tweet_text)
        print("✅ ツイート成功:", tweet_text)
        sys.exit(1)
    except Exception as e:
        print("⚠️ ツイート失敗:", e)

if __name__ == "__main__":
    filepath = sys.argv[1]
    tweet_blog_update(filepath)
