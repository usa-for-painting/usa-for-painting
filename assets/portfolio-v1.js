(() => {
  const buttons = [...document.querySelectorAll('.portfolio-open')];
  if (!buttons.length) return;
  const dialog = document.createElement('dialog'); dialog.className = 'portfolio-dialog'; dialog.setAttribute('aria-labelledby','portfolio-dialog-title');
  dialog.innerHTML = '<button class="portfolio-close" type="button" aria-label="Close photo">&times;</button><img alt=""><div class="portfolio-dialog-copy"><h2 id="portfolio-dialog-title"></h2><p></p><div class="portfolio-dialog-actions"><button type="button" data-previous aria-label="Previous photo">&#8592;</button><button type="button" data-next aria-label="Next photo">&#8594;</button><a class="button button-dark" href="index.html#estimate">Plan a project like this &#8599;</a></div></div>';
  document.body.append(dialog);let current=0;
  function show(index){current=(index+buttons.length)%buttons.length;const button=buttons[current];dialog.querySelector('img').src=button.dataset.photo;dialog.querySelector('img').alt=button.querySelector('img').alt;dialog.querySelector('h2').textContent=button.dataset.title;dialog.querySelector('p').textContent=button.dataset.description;}
  buttons.forEach((button,index)=>button.addEventListener('click',()=>{show(index);dialog.showModal();dialog.querySelector('.portfolio-close').focus();}));
  dialog.querySelector('.portfolio-close').addEventListener('click',()=>dialog.close());dialog.querySelector('[data-previous]').addEventListener('click',()=>show(current-1));dialog.querySelector('[data-next]').addEventListener('click',()=>show(current+1));
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1));}});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
})();
