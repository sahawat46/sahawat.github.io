const fs = require('fs');
let html = fs.readFileSync('app/body_structure.html', 'utf8');

// Replace class= with className=
html = html.replace(/class=/g, 'className=');

// Replace onclick= with onClick=
html = html.replace(/onclick=/g, 'onClick=');

// Fix unclosed tags
html = html.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
html = html.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
html = html.replace(/<br([^>]*[^\/])?>/g, '<br />');
html = html.replace(/<hr([^>]*[^\/])?>/g, '<hr />');

// Replace HTML comments
html = html.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

// Convert inline styles to JSX style objects
html = html.replace(/style="([^"]+)"/g, function(match, styles) {
  const obj = {};
  styles.split(';').forEach(style => {
    if(!style.trim()) return;
    const [key, ...values] = style.split(':');
    const value = values.join(':');
    if(!key || !value) return;
    const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    obj[camelKey] = value.trim();
  });
  return "style={" + JSON.stringify(obj) + "}";
});

const pageJsx = `
"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './globals.css';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    // Logic will be injected here
  }, []);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      ${html}
    </>
  );
}
`;

fs.writeFileSync('app/page.js', pageJsx);
console.log('Converted to JSX');
