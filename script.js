const ALL_ANSWERS={
  t1_q1:'D',
  t2_q1:'B', t2_q2:'C', t2_q3:'C', t2_q4:'B',
  t3_q1:'B',
  t4_q1:'B',
  t5_q1:'B',
  t6_q1:['7','sete'],
  t7_q1:'D'
};

function iniciarTeste(){
  const intro=document.getElementById('intro-pos');
  const teste=document.getElementById('teste-completo');
  if(intro) intro.hidden=true;
  if(teste){
    teste.hidden=false;
    teste.scrollIntoView({behavior:'smooth',block:'start'});
  }
}
function getAnswer(name){
  const checked=document.querySelector(`input[name="${name}"]:checked`);
  if(checked)return checked.value;
  const input=document.querySelector(`input[name="${name}"][type="text"], input[name="${name}"][type="number"]`);
  if(input)return input.value.trim();
  return '';
}
function normaliza(v){return String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function respostaCerta(valor,correta){
  if(Array.isArray(correta))return correta.map(normaliza).includes(normaliza(valor));
  return normaliza(valor)===normaliza(correta);
}
function formatarResposta(ans){return Array.isArray(ans)?ans.join(' / '):ans;}
function limparMarcacoes(){
  document.querySelectorAll('.correct-answer,.wrong-answer,.right,.wrong,.missing').forEach(e=>e.classList.remove('correct-answer','wrong-answer','right','wrong','missing'));
  document.querySelectorAll('.answer-feedback').forEach(e=>e.remove());
}
function marcarResposta(name,ans,estaCerta,valor){
  const box=document.querySelector(`[data-q="${name}"]`);
  if(!box)return;
  const selected=box.querySelector(`input[name="${name}"]:checked`);
  if(selected){
    const label=selected.closest('label') || selected.parentElement;
    label.classList.add(estaCerta?'correct-answer':'wrong-answer');
  }else{
    const input=box.querySelector(`input[name="${name}"][type="text"], input[name="${name}"][type="number"]`);
    if(input && valor) input.classList.add(estaCerta?'correct-answer':'wrong-answer');
  }
  const feedback=document.createElement('div');
  feedback.className='answer-feedback '+(estaCerta?'ok':'bad');
  feedback.innerHTML=estaCerta ? 'Resposta certa.' : `Resposta errada.<br>Resposta correta: <strong>${formatarResposta(ans)}</strong>`;
  box.appendChild(feedback);
}
function corrigirTodas(){
  limparMarcacoes();
  const teste=document.getElementById('teste-completo');
  if(teste) teste.hidden=false;
  const intro=document.getElementById('intro-pos');
  if(intro) intro.hidden=true;
  let total=0,certas=0,missing=0;
  for(const [name,ans] of Object.entries(ALL_ANSWERS)){
    total++;
    const value=getAnswer(name);
    const box=document.querySelector(`[data-q="${name}"]`);
    if(!value){
      missing++;
      if(box){
        box.classList.add('missing');
        const feedback=document.createElement('div');
        feedback.className='answer-feedback bad';
        feedback.innerHTML=`Falta responder.<br>Resposta correta: <strong>${formatarResposta(ans)}</strong>`;
        box.appendChild(feedback);
      }
      continue;
    }
    const estaCerta=respostaCerta(value,ans);
    if(estaCerta){certas++; if(box)box.classList.add('right');}
    else if(box)box.classList.add('wrong');
    marcarResposta(name,ans,estaCerta,value);
  }
  const nota=total?((certas/total)*10).toFixed(2):'0.00';
  const res=document.getElementById('resultado');
  if(res){
    res.innerHTML=`Resultado: ${certas} / ${total} respostas certas<br>Nota: ${nota} valores em 10`+(missing?`<br><span class="bad">Faltam ${missing} resposta(s).</span>`:'');
    res.className='result '+(certas===total?'ok':'bad');
    res.scrollIntoView({behavior:'smooth',block:'center'});
  }
}
function limparTudo(){
  if(confirm('Queres limpar todas as respostas?')){
    document.querySelectorAll('input').forEach(i=>{if(i.type==='radio')i.checked=false;else i.value=''});
    const res=document.getElementById('resultado'); if(res)res.innerHTML='';
    limparMarcacoes();
  }
}
function imprimir(){
  const teste=document.getElementById('teste-completo');
  if(teste) teste.hidden=false;
  const intro=document.getElementById('intro-pos');
  if(intro) intro.hidden=false;
  window.print();
}
function exportarCSV(){
  let rows=['Pergunta;Resposta do aluno;Resposta correta'];
  for(const [name,ans] of Object.entries(ALL_ANSWERS)){
    rows.push(`${name};${getAnswer(name)};${Array.isArray(ans)?ans.join(' / '):ans}`);
  }
  const blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='SmartPark_resultados.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
