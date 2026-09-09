import { chromium } from "@playwright/test";
import fs from "node:fs/promises";

const packs = ["werkbank","patina","kanzlei","salon-noir","morgenlicht","marktplatz","gusto","landgut","atelier","klarwerk","verve","zunft","schimmer","fundament","karat","plakat","raster","strom","riviera","ernte"];
const tokens = ["HTZLyCxq59IJhxcvyoq8dzhDoB31ffzy","c7lXkJpxJBMl6MBQyEhZWHV6bf-Ejo0y","rsAAkT_wZZEZpxC40X5VYFvUUyJ1lYy_","DQcA_O6sHzErMuLxsN9kPutWDegjFs2Y","1tSJIE5gnC3q-7bChWSYxsUh17YJZHn0","KnGt3nkNGnj1QKQ-Rup5BoVBnCxE_i0P","EDOZ8ghEvPCf5HxBMKldHm2gLTVH46j-","w9HVHgYbNYLR7VczTzM_Cl-eLEh9m5d0","KYSbZzc9cqEvFzRxJrzgJf7JedMSqVfS","OUJvn4qc6wuBhxy1qnsPSYZ4uiFdIwj-"];
const viewports = [{name:"desktop",width:1440,height:900},{name:"mobile",width:390,height:844}];

async function inspect(page, url, viewport) {
  await page.setViewportSize(viewport);
  const response = await page.goto(url, {waitUntil:"networkidle", timeout:60000});
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0,0); });
  await page.waitForTimeout(500);
  const data = await page.evaluate(() => {
    const px = v => Number.parseFloat(v) || 0;
    const visible = el => { const s=getComputedStyle(el),r=el.getBoundingClientRect(); return s.display!=="none"&&s.visibility!=="hidden"&&r.width>1&&r.height>1; };
    const root = document.querySelector(".pb-site") || document.body;
    let sections = [...root.querySelectorAll("section")].filter(visible);
    if (!sections.length) sections = [...root.children].filter(el => visible(el) && !["STYLE","SCRIPT","HEADER","FOOTER","NAV"].includes(el.tagName));
    const sectionRows = sections.map((el, index) => {
      const r=el.getBoundingClientRect(), cs=getComputedStyle(el);
      const text=(el.innerText||"").replace(/\s+/g," ").trim();
      const words=text ? text.split(/\s+/).length : 0;
      const leaves=[...el.querySelectorAll("h1,h2,h3,p,li,a,button,img,svg,figure")].filter(visible);
      let top=Infinity,bottom=-Infinity;
      for(const n of leaves){const q=n.getBoundingClientRect();top=Math.min(top,q.top);bottom=Math.max(bottom,q.bottom)}
      const imgs=[...el.querySelectorAll("img")].filter(visible).map(img=>{const q=img.getBoundingClientRect();return {src:img.currentSrc||img.src,w:+q.width.toFixed(1),h:+q.height.toFixed(1),ratio:+(q.width/q.height).toFixed(2),alt:img.alt||""}});
      const bg=[el,...el.querySelectorAll("*")].filter(visible).map(n=>getComputedStyle(n).backgroundImage).filter(x=>x&&x!=="none");
      const headings=[...el.querySelectorAll("h1,h2,h3")].filter(visible).map(h=>({tag:h.tagName,text:(h.innerText||"").trim(),size:px(getComputedStyle(h).fontSize),line:px(getComputedStyle(h).lineHeight)}));
      const body=[...el.querySelectorAll("p,li")].filter(visible).map(p=>px(getComputedStyle(p).fontSize)).filter(Boolean);
      const bordered=[...el.querySelectorAll("hr,*")].filter(visible).filter(n=>{const c=getComputedStyle(n);return n.tagName==="HR"||px(c.borderTopWidth)>0||px(c.borderBottomWidth)>0}).length;
      const interactive=[...el.querySelectorAll("a,button")].filter(visible).length;
      const figureCaps=[...el.querySelectorAll("figcaption")].filter(visible).length;
      const id=el.id || el.getAttribute("data-section") || el.className?.toString().split(/\s+/).slice(0,2).join(" ") || `section-${index}`;
      return {index,id,tag:el.tagName,top:+r.top.toFixed(1),height:+r.height.toFixed(1),padTop:px(cs.paddingTop),padBottom:px(cs.paddingBottom),words,chars:text.length,text:text.slice(0,500),headings,bodyMedian:body.length ? body.sort((a,b)=>a-b)[Math.floor(body.length/2)] : null,imgs,bgCount:bg.length,bordered,interactive,figureCaps,contentSpan:Number.isFinite(top)?+(bottom-top).toFixed(1):0,emptyShare:Number.isFinite(top)?+Math.max(0,1-(bottom-top)/r.height).toFixed(3):1};
    });
    const gaps=sectionRows.slice(1).map((s,i)=>+(s.top-(sectionRows[i].top+sectionRows[i].height)).toFixed(1));
    const allText=(root.innerText||"").replace(/\s+/g," ").trim();
    const allImgs=[...root.querySelectorAll("img")].filter(visible);
    const broken=allImgs.filter(i=>!i.complete||i.naturalWidth===0).length;
    const headings=[...root.querySelectorAll("h1,h2,h3")].filter(visible).map(h=>({tag:h.tagName,size:px(getComputedStyle(h).fontSize),text:(h.innerText||"").trim()}));
    const bodySizes=[...root.querySelectorAll("p,li")].filter(visible).map(p=>px(getComputedStyle(p).fontSize)).filter(Boolean);
    return {title:document.title,packClass:root.className,lang:document.documentElement.lang,url:location.href,docHeight:document.documentElement.scrollHeight,totalWords:allText?allText.split(/\s+/).length:0,totalChars:allText.length,sections:sectionRows,gaps,headings,bodySizes,imgCount:allImgs.length,brokenImgs:broken,anchors:[...root.querySelectorAll("a")].filter(visible).length,buttons:[...root.querySelectorAll("button")].filter(visible).length};
  });
  return {status:response?.status(), ...data};
}

const browser = await chromium.launch({
  headless:true,
  executablePath:"/Users/christianniessing/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
});
const context = await browser.newContext({ignoreHTTPSErrors:true});
const page = await context.newPage();
const out={generatedAt:new Date().toISOString(),demos:{},customers:{},errors:[]};
for(const pack of packs){
  out.demos[pack]={};
  for(const vp of viewports){
    try { out.demos[pack][vp.name]=await inspect(page,`https://pageblitz.de/demo/${pack}`,vp); console.log("demo",pack,vp.name,"ok"); }
    catch(error){out.errors.push({kind:"demo",pack,viewport:vp.name,error:String(error)});console.error("demo",pack,vp.name,String(error));}
  }
}
for(const token of tokens){
  out.customers[token]={};
  for(const vp of viewports){
    try { out.customers[token][vp.name]=await inspect(page,`https://pageblitz.de/preview-ssr/${token}`,vp); console.log("customer",token.slice(0,6),vp.name,"ok"); }
    catch(error){out.errors.push({kind:"customer",token,viewport:vp.name,error:String(error)});console.error("customer",token.slice(0,6),vp.name,String(error));}
  }
}
await browser.close();
await fs.writeFile(new URL("./measurements.json",import.meta.url),JSON.stringify(out,null,2));
console.log("written",Object.keys(out.demos).length,Object.keys(out.customers).length,"errors",out.errors.length);
