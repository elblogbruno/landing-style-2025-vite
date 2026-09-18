
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
const es=JSON.parse(fs.readFileSync('src/locales/es/translation.json','utf8'));
const en=JSON.parse(fs.readFileSync('src/locales/en/translation.json','utf8'));
const imageKeys=['image','imageUrl','imgSrc','logo','profileImage','coverImage'];
test('portfolio images exist locally and match between languages',()=>{
  function compare(a,b,path=''){
    if(!a || typeof a!=='object')return;
    if(Array.isArray(a)){
      assert.ok(Array.isArray(b),path);
      a.forEach((item,i)=>compare(item,item?.id!==undefined?b.find(x=>x.id===item.id):b[i],path+'['+(item?.id??i)+']'));
      return;
    }
    for(const [key,value] of Object.entries(a)){
      if(imageKeys.includes(key)){
        assert.deepEqual(b?.[key],value,path+'.'+key);
        for(const src of [value].flat()){
          assert.ok(src.startsWith('/'),path+' uses a non-local image');
          assert.ok(fs.statSync('public'+src).size>0,src);
        }
      }else if(value&&typeof value==='object')compare(value,b?.[key],path+'.'+key);
    }
  }
  compare(es,en);
  for(const section of ['talks','news','awards','education']){
    for(const item of es[section].items)assert.ok(item.image,section+': '+(item.title||item.degree));
  }
});
