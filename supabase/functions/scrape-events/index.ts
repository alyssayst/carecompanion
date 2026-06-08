import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const response = await fetch('https://triangleonthecheap.com/events/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HarpersHome/1.0)' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const events: { title: string; date_time: string; location: string; link: string; image_url: string }[] = [];

    // The events page has date headers like <h2 class="lotc-event">Today: Sunday, March 30, 2026</h2>
    // followed by event rows like <div class="lotc-v2 row event">...<h3><a href="...">Title</a></h3><p class="meta">time | price | location</p>...</div>

    let currentDate = '';

    // Split by h2 date headers
    const sections = html.split(/<h2[^>]*class="lotc-event"[^>]*>/i);

    for (const section of sections) {
      // Extract date from the header text (e.g., "Today: Sunday, March 30, 2026</h2>")
      const dateMatch = section.match(/^([^<]*)<\/h2>/i);
      if (dateMatch) {
        currentDate = dateMatch[1].trim()
          .replace(/^Today:\s*/i, '')
          .replace(/^Tomorrow:\s*/i, '')
          .replace(/&amp;/g, '&');
      }

      // Match event rows
      const eventRegex = /<div[^>]*class="[^"]*lotc-v2[^"]*row[^"]*event[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*lotc-v2[^"]*row[^"]*event|<h2[^>]*class="lotc-event"|$)/gi;
      let eventMatch;

      while ((eventMatch = eventRegex.exec(section)) !== null) {
        const block = eventMatch[1];

        // Extract title and link from <h3><a href="...">Title</a></h3>
        const titleMatch = block.match(/<h3[^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/i);
        if (!titleMatch) continue;

        const link = titleMatch[1];
        let title = titleMatch[2].trim()
          .replace(/&#8211;/g, '–')
          .replace(/&#8217;/g, "'")
          .replace(/&#8212;/g, '—')
          .replace(/&#8230;/g, '…')
          .replace(/&amp;/g, '&');

        // Extract meta info: time | price | location
        const metaMatch = block.match(/<p[^>]*class="meta"[^>]*>([\s\S]*?)<\/p>/i);
        let location = 'Triangle Area, NC';
        let timeStr = '';

        if (metaMatch) {
          const metaHtml = metaMatch[1].replace(/<[^>]*>/g, '').trim();
          const parts = metaHtml.split('|').map((p: string) => p.trim());

          // First part is typically the time
          if (parts.length >= 1) {
            timeStr = parts[0];
          }
          // Last part is typically the location
          if (parts.length >= 3) {
            location = parts[parts.length - 1];
          } else if (parts.length === 2) {
            location = parts[1];
          }
        }

        const dateTime = currentDate ? `${currentDate}, ${timeStr}` : timeStr;

        if (title) {
          events.push({
            title,
            date_time: dateTime,
            location,
            link,
            image_url: '',
          });
        }

        if (events.length >= 20) break;
      }

      if (events.length >= 20) break;
    }

    // Clear old events and insert new ones
    await supabase.from('cached_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (events.length > 0) {
      const { error } = await supabase.from('cached_events').insert(events);
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ success: true, count: events.length, events }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scrape error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
