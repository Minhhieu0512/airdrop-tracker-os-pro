import express from 'express';
import { Client } from '@notionhq/client';

const app = express();
app.use(express.json());
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;
const notion = process.env.NOTION_TOKEN ? new Client({ auth: process.env.NOTION_TOKEN }) : null;
const SOURCES = {
  projects: process.env.NOTION_PROJECTS_DB || '425c2d1837e981aeac4cec502ca802d5',
  tasks: process.env.NOTION_TASKS_DB || '425c2d1837e9815ca2bfc84bbec3803a',
  wallets: process.env.NOTION_WALLETS_DB || '425c2d1837e981669c42cbcc2549c2cb',
  rewards: process.env.NOTION_REWARDS_DB || '425c2d1837e981b19847f754c56e1eee'
};

app.get('/api/health', (_req,res) => res.json({ok:true, notionConnected:!!notion}));
app.get('/api/market', async (_req,res) => {
  try {
    const ids = 'bitcoin,ethereum,solana,ripple,binancecoin,the-open-network,avalanche-2,chainlink';
    const r = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`);
    if (!r.ok) throw new Error(`CoinGecko ${r.status}`);
    res.json(await r.json());
  } catch(e) { res.status(502).json({error:'Market feed temporarily unavailable',detail:e.message}); }
});
app.get('/api/news', async (_req,res) => {
  try {
    const r = await fetch('https://www.coindesk.com/arc/outboundfeeds/rss/');
    if (!r.ok) throw new Error(`RSS ${r.status}`);
    const xml = await r.text();
    const blocks = xml.split('<item>').slice(1).map(part => part.split('</item>')[0]).slice(0,8);
    const items = blocks.map(item => {
      const tag = name => {
        const start = item.indexOf('<' + name + '>');
        if (start < 0) return '';
        const bodyStart = start + name.length + 2;
        const end = item.indexOf('</' + name + '>', bodyStart);
        if (end < 0) return '';
        return item.slice(bodyStart,end).replace('<![CDATA[','').replace(']]>','').replace(/&amp;/g,'&');
      };
      return {title:tag('title'),link:tag('link'),pubDate:tag('pubDate'),description:tag('description').replace(/<[^>]*>/g,'').slice(0,220)};
    });
    res.json(items);
  } catch(e) { res.status(502).json({error:'News feed temporarily unavailable',detail:e.message}); }
});
app.get('/api/notion/:kind', async (req,res) => {
  if (!notion) return res.status(503).json({connected:false,message:'Set NOTION_TOKEN to enable Notion sync.'});
  const db = SOURCES[req.params.kind];
  if (!db) return res.status(404).json({error:'Unknown database'});
  try {
    const result = await notion.databases.query({database_id:db,page_size:100, sorts:[{timestamp:'last_edited_time',direction:'descending'}]});
    res.json({connected:true,results:result.results});
  } catch(e) { res.status(502).json({error:'Notion query failed',detail:e.message}); }
});
app.listen(PORT, () => console.log(`Airdrop Tracker OS Pro listening on ${PORT}`));
