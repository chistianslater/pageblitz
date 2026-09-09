import fs from "node:fs/promises";
const {getFixture}=await import("../../shared/siteContract/fixtures.ts");
const packs=["werkbank","patina","kanzlei","salon-noir","morgenlicht","marktplatz","gusto","landgut","atelier","klarwerk","verve","zunft","schimmer","fundament","karat","plakat","raster","strom","riviera","ernte"];
const words=s=>(s||"").trim().split(/\s+/).filter(Boolean).length;
const textFields=x=>{const a=[];const walk=(v,k="")=>{if(typeof v==="string"&&!/(url|href|phone|email|street|zip|city|price|hours)/i.test(k))a.push(v);else if(Array.isArray(v))v.forEach(z=>walk(z,k));else if(v&&typeof v==="object")Object.entries(v).forEach(([q,z])=>walk(z,q))};walk(x);return a};
const out={};
for(const p of packs){const d=getFixture(p,"full");out[p]={business:d.businessName,profile:d.designProfile,sectionCount:d.sections.length,sections:d.sections.map(s=>{const texts=textFields(s),all=texts.join(" ");const images=s.type==="gallery"?s.images.length+(s.albums||[]).reduce((n,a)=>n+a.images.length,0):("imageUrl" in s&&s.imageUrl?1:0);return {type:s.type,words:words(all),textFields:texts.length,shortFields:texts.filter(x=>words(x)<=8).length,images,items:"items" in s&&Array.isArray(s.items)?s.items.length:("members" in s?s.members.length:("categories" in s?s.categories.reduce((n,c)=>n+c.items.length,0):0))}})}};
await fs.writeFile(new URL("./fixture-metrics.json",import.meta.url),JSON.stringify(out,null,2));
