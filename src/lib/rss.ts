import { XMLParser, XMLBuilder } from "fast-xml-parser";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

const parser = new XMLParser();

export async function fetchFeed(feedUrl: string) {
  const response = await fetch(feedUrl, {
    method: "GET",
    headers: {
      "User-Agent": "Gator/1.0"
    }
  })
  const data = await response.text(); 

  const xmlData = parser.parse(data);
  if (!xmlData.rss.channel) {
    throw new Error("Invalid RSS feed"); 
  }

  const chanel = xmlData.rss.channel;
  const metadata = {
    title: chanel.title,
    link: chanel.link,
    description: chanel.description
  }
  
  const items = [];
  if (chanel.item && Array.isArray(chanel.item)) {
    for (let item of chanel.item) {
      if (item.title && item.link && item.description && item.pubDate) {
        // console.log({
        //   title: item.title,
        //   link: item.link,
        //   description: item.description,
        //   pubDate: item.pubDate
        // });
        items.push({
          title: item.title,
          link: item.link,
          description: item.description,
          pubDate: item.pubDate
        } as RSSItem)
      }
    }
  }

  return { channel: { ...metadata, item: items } } as RSSFeed;
};