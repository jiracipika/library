'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Stats() {
  const books = [
    { id:'b1',title:'Project Hail Mary',author:'Andy Weir',status:'reading',rating:5,pages:476,progress:67 },
    { id:'b2',title:'Atomic Habits',author:'James Clear',status:'read',rating:4,pages:320,progress:100 },
    { id:'b3',title:'Dune',author:'Frank Herbert',status:'read',rating:5,pages:688,progress:100 },
    { id:'b4',title:'Sapiens',author:'Harari',status:'read',rating:4,pages:443,progress:100 },
    { id:'b5',title:'Pragmatic Programmer',author:'Hunt & Thomas',status:'reading',rating:5,pages:352,progress:42 },
    { id:'b6',title:'Thinking Fast and Slow',author:'Kahneman',status:'read',rating:3,pages:499,progress:100 },
  ];
  const read = books.filter(b => b.status === 'read');
  const totalPages = read.reduce((s,b) => s + b.pages, 0);
  const avgRating = read.length ? (read.reduce((s,b) => s + b.rating, 0) / read.length).toFixed(1) : '0';
  const monthly = [{m:'Oct',b:2},{m:'Nov',b:3},{m:'Dec',b:1},{m:'Jan',b:2},{m:'Feb',b:3},{m:'Mar',b:1}];
  const genres: Record<string,number> = {};
  books.forEach(b => { const g = b.pages > 400 ? 'Long' : 'Standard'; genres[g] = (genres[g]||0)+1; });

  return (
    <div style={{ background:'var(--ios-bg)', minHeight:'100vh' }}>
      <div style={{ maxWidth:800, margin:'0 auto', padding:'60px 16px 40px' }}>
        <Link href="/" style={{ fontSize:14, color:'var(--ios-blue)', marginBottom:8, display:'inline-block' }}>← Back</Link>
        <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.5px', marginBottom:24 }}>Reading Stats</h1>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          {[
            {l:'Books Read',v:read.length,c:'var(--ios-blue)'},
            {l:'Pages Read',v:totalPages.toLocaleString(),c:'var(--ios-green)'},
            {l:'Avg Rating',v:`${avgRating} ★`,c:'#FFD700'},
            {l:'This Year',v:`${books.length} books`,c:'var(--ios-purple)'},
          ].map((s,i) => (
            <div key={i} style={{ padding:16, borderRadius:14, background:'var(--ios-bg2)', boxShadow:'var(--ios-shadow)' }}>
              <div style={{ fontSize:12, color:'var(--ios-label3)', marginBottom:4 }}>{s.l}</div>
              <div style={{ fontSize:22, fontWeight:700, color:s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:20, borderRadius:16, background:'var(--ios-bg2)', boxShadow:'var(--ios-shadow)', marginBottom:20 }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Books per Month</h3>
          <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:120 }}>
            {monthly.map(m => (
              <div key={m.m} style={{ flex:1, textAlign:'center' }}>
                <div style={{ height:`${m.b*35}px`, background:'var(--ios-blue)', borderRadius:8, marginBottom:6 }} />
                <div style={{ fontSize:13, fontWeight:600 }}>{m.b}</div>
                <div style={{ fontSize:11, color:'var(--ios-label3)' }}>{m.m}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:20, borderRadius:16, background:'var(--ios-bg2)', boxShadow:'var(--ios-shadow)' }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>Top Rated</h3>
          {read.sort((a,b) => b.rating - a.rating).slice(0,3).map(b => (
            <div key={b.id} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'0.5px solid var(--ios-bg)' }}>
              <div>
                <div style={{ fontSize:15, fontWeight:600, color:'var(--ios-label)' }}>{b.title}</div>
                <div style={{ fontSize:12, color:'var(--ios-label3)' }}>{b.author}</div>
              </div>
              <div style={{ color:'#FFD700', fontSize:14 }}>{'★'.repeat(b.rating)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
