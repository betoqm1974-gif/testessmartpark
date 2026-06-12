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

function obterDadosAluno(){
  return {
    nome:(document.getElementById('aluno_nome')?.value || '').trim(),
    idade:(document.getElementById('aluno_idade')?.value || '').trim(),
    ano:(document.getElementById('aluno_ano')?.value || '').trim(),
    turma:(document.getElementById('aluno_turma')?.value || '').trim()
  };
}
function gerarCSVResultados(){
  const aluno=obterDadosAluno();
  let total=0, certas=0;
  const rows=[];
  rows.push(['SmartPark - Pós-Teste']);
  rows.push(['Nome', aluno.nome]);
  rows.push(['Idade', aluno.idade]);
  rows.push(['Ano', aluno.ano]);
  rows.push(['Turma', aluno.turma]);
  rows.push([]);
  rows.push(['Pergunta','Resposta do aluno','Resposta correta','Resultado']);
  for(const [name,ans] of Object.entries(ALL_ANSWERS)){
    total++;
    const value=getAnswer(name);
    const ok=respostaCerta(value,ans);
    if(ok) certas++;
    rows.push([name, value || 'Sem resposta', formatarResposta(ans), ok?'Certa':'Errada']);
  }
  const nota=total?((certas/total)*10).toFixed(2).replace('.',','):'0,00';
  rows.push([]);
  rows.push(['Total de respostas certas', `${certas} / ${total}`]);
  rows.push(['Nota', `${nota} valores em 10`]);
  return rows.map(r=>r.map(v=>`"${String(v ?? '').replace(/"/g,'""')}"`).join(';')).join('\n');
}
function setEnviarStatus(msg, ok){
  const status=document.getElementById('envioStatus') || document.getElementById('resultado');
  if(status){
    status.textContent=msg;
    status.className='result '+(ok?'ok':'bad');
  }
}
async function enviarResultados(){
  limparMarcacoes();
  const aluno=obterDadosAluno();
  if(!aluno.nome || !aluno.idade || !aluno.ano || !aluno.turma){
    setEnviarStatus('Preenche a identificação do aluno antes de enviar.', false);
    return;
  }
  const emailDestino='betoqm1974@gmail.com';
  const csv=gerarCSVResultados();
  const assunto=`Resultados SmartPark - ${aluno.nome || 'Aluno'}`;
  const data={
    name: aluno.nome,
    email: emailDestino,
    subject: assunto,
    message: csv,
    teste: 'Pós-Teste SmartPark',
    idade: aluno.idade,
    ano: aluno.ano,
    turma: aluno.turma,
    _subject: assunto,
    _template: 'table'
  };
  setEnviarStatus('A enviar...', true);
  try{
    const res=await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(emailDestino)}`,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(data)
    });
    if(res.ok){
      setEnviarStatus('Resultado enviado com sucesso.', true);
    }else{
      setEnviarStatus('Não foi possível enviar. Tenta novamente mais tarde.', false);
    }
  }catch(err){
    setEnviarStatus('Falha de rede ao enviar. Verifica a ligação e tenta novamente.', false);
  }
}

