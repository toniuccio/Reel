const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
(async () => {
  const [,, html, dati, outdir] = process.argv;
  const items = JSON.parse(fs.readFileSync(dati,'utf8'));
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1240,height:3508}});
  for (const it of items) {
    await p.goto('about:blank');
    await p.goto('file://' + html + '#' + encodeURIComponent(JSON.stringify(it)));
    await p.waitForSelector('body[data-ready]'); await p.waitForTimeout(150);
    const o = path.join(outdir, it.file);
    await p.screenshot({path: o + '.png'});
    await p.pdf({path: o + '.pdf', width:'105mm', height:'297mm', printBackground:true, pageRanges:'1', scale: 105/25.4*96/1240});
    console.log(it.file);
  }
  await b.close();
})();
