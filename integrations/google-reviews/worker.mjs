// Deploy separately as a Cloudflare Worker. Never publish OAuth credentials in website files.
const listing = 'https://www.google.com/maps?cid=9132234197117223065';
const stars = { ONE:1, TWO:2, THREE:3, FOUR:4, FIVE:5 };
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = env.ALLOWED_ORIGIN || 'https://usa-for-painting.github.io';
    const headers = { 'Content-Type':'application/json', 'Cache-Control':'no-store', 'Access-Control-Allow-Origin':allowed, 'Vary':'Origin' };
    const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
    if (origin && origin !== allowed) return json({error:'Origin not allowed'},403);
    if (request.method==='OPTIONS') return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, OPTIONS'}});
    if (request.method!=='GET') return json({error:'Method not allowed'},405);
    if (new URL(request.url).pathname !== '/reviews') return json({error:'Not found'},404);
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN || !/^accounts\/[^/]+\/locations\/[^/]+$/.test(env.GOOGLE_LOCATION || '')) return json({error:'Review connection is not configured'},503);
    try {
      const tokenResponse=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:env.GOOGLE_REFRESH_TOKEN,grant_type:'refresh_token'}),signal:AbortSignal.timeout(8000)});
      if(!tokenResponse.ok) throw Error('Authorization unavailable');
      const token=await tokenResponse.json();
      const response=await fetch(`https://mybusiness.googleapis.com/v4/${env.GOOGLE_LOCATION}/reviews?pageSize=12&orderBy=updateTime%20desc`,{headers:{Authorization:`Bearer ${token.access_token}`},signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw Error('Review service unavailable');
      const data=await response.json();
      return json({source:listing,live:true,fetchedAt:new Date().toISOString(),rating:data.averageRating,total:data.totalReviewCount,reviews:(data.reviews||[]).map(review=>({name:review.reviewer?.displayName||'Google reviewer',quote:review.comment||'',rating:stars[review.starRating]||0,updated:review.updateTime,source:'Google review',topic:'CUSTOMER FEEDBACK'}))});
    } catch { return json({error:'Reviews temporarily unavailable'},502); }
  }
};
