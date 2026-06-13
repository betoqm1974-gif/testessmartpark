const ALL_ANSWERS={
  t1_q1:'D',
  t2_q1:'B', t2_q2:'C', t2_q3:'C', t2_q4:'B',
  t3_q1:'B',
  t4_q1:'B',
  t5_q1:'C',
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

function etiquetaPergunta(name){
  const mapa={
    t1_q1:'Exercício 1 - Descargas no Porto',
    t2_q1:'Exercício 2.1 - Vizinho da Ana',
    t2_q2:'Exercício 2.2 - Gabinete com 3 corredores',
    t2_q3:'Exercício 2.3 - Gabinete do Bruno',
    t2_q4:'Exercício 2.4 - Gabinetes com 1 vizinho',
    t3_q1:'Exercício 3 - Mensagem do Arquivo Digital',
    t4_q1:'Exercício 4 - Cartões e Envelopes',
    t5_q1:'Exercício 5 - Percurso do Robô',
    t6_q1:'Exercício 6 - Entregas no Festival',
    t7_q1:'Exercício 7 - RoboLiga'
  };
  return mapa[name] || name;
}
function obterResumoResultados(){
  let total=0, certas=0, respondidas=0;
  const linhas=[];
  for(const [name,ans] of Object.entries(ALL_ANSWERS)){
    total++;
    const value=getAnswer(name);
    const ok=respostaCerta(value,ans);
    if(value) respondidas++;
    if(ok) certas++;
    linhas.push({
      pergunta: etiquetaPergunta(name),
      resposta: value || 'Sem resposta',
      estado: ok ? 'Certa' : 'Errada',
      correta: formatarResposta(ans)
    });
  }
  const nota=total?((certas/total)*10).toFixed(2).replace('.',','):'0,00';
  return {total, certas, respondidas, nota, linhas};
}
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

function setEnviarStatus(msg, ok){
  const status=document.getElementById('envioStatus') || document.getElementById('resultado');
  if(status){
    status.textContent=msg;
    status.className='result '+(ok?'ok':'bad');
  }
}
function csvEscape(valor){
  return '"'+String(valor ?? '').replace(/"/g,'""')+'"';
}

function gerarCsvResultados(aluno,resumo){
  const linhas=[];
  linhas.push(['Teste','Pós-Teste SmartPark']);
  linhas.push(['Nome',aluno.nome]);
  linhas.push(['Idade',aluno.idade]);
  linhas.push(['Ano',aluno.ano]);
  linhas.push(['Turma',aluno.turma]);
  linhas.push(['Respondidas',`${resumo.respondidas} / ${resumo.total}`]);
  linhas.push(['Certas',`${resumo.certas} / ${resumo.total}`]);
  linhas.push(['Nota',`${resumo.nota} valores em 10`]);
  linhas.push([]);
  linhas.push(['Pergunta','Resposta do aluno','Certa/Errada','Resposta correta']);
  resumo.linhas.forEach(l=>linhas.push([l.pergunta,l.resposta,l.estado,l.correta]));
  return linhas.map(l=>l.map(csvEscape).join(';')).join('\n');
}

function htmlEscape(valor){
  return String(valor ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function gerarTabelaHtmlResultados(aluno,resumo){
  const linhas=resumo.linhas.map((linha,idx)=>`
    <tr>
      <td>${idx+1}</td>
      <td>${htmlEscape(linha.pergunta)}</td>
      <td>${htmlEscape(linha.resposta)}</td>
      <td>${htmlEscape(linha.estado)}</td>
      <td>${htmlEscape(linha.correta)}</td>
    </tr>`).join('');
  return `
    <h2>Resultados - Pós-Teste SmartPark</h2>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr><th>Nome</th><td>${htmlEscape(aluno.nome)}</td></tr>
      <tr><th>Idade</th><td>${htmlEscape(aluno.idade)}</td></tr>
      <tr><th>Ano</th><td>${htmlEscape(aluno.ano)}</td></tr>
      <tr><th>Turma</th><td>${htmlEscape(aluno.turma)}</td></tr>
      <tr><th>Respostas respondidas</th><td>${htmlEscape(resumo.respondidas)} / ${htmlEscape(resumo.total)}</td></tr>
      <tr><th>Respostas certas</th><td>${htmlEscape(resumo.certas)} / ${htmlEscape(resumo.total)}</td></tr>
      <tr><th>Nota</th><td>${htmlEscape(resumo.nota)} valores em 10</td></tr>
    </table>
    <br>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead>
        <tr>
          <th>N.º</th>
          <th>Pergunta</th>
          <th>Resposta do aluno</th>
          <th>Certa/Errada</th>
          <th>Resposta correta</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>`;
}

async function enviarResultados(){
  limparMarcacoes();
  const aluno=obterDadosAluno();
  if(!aluno.nome || !aluno.idade || !aluno.ano || !aluno.turma){
    setEnviarStatus('Preenche a identificação do aluno antes de enviar.', false);
    return;
  }

  const emailDestino='betoqm1974@gmail.com';
  const resumo=obterResumoResultados();
  const assunto=`Resultados SmartPark - ${aluno.nome || 'Aluno'}`;
  const nomeSeguro=(aluno.nome || 'aluno').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/gi,'_').replace(/^_+|_+$/g,'') || 'aluno';
  const csv=gerarCsvResultados(aluno,resumo);
  const ficheiro=new File([csv], `resultados_smartpark_${nomeSeguro}.csv`, {type:'text/csv;charset=utf-8'});

  const form=document.createElement('form');
  form.action=`https://formsubmit.co/${emailDestino}`;
  form.method='POST';
  form.enctype='multipart/form-data';
  form.target='formsubmit_smartpark';
  form.style.display='none';

  const addHidden=(name,value)=>{
    const input=document.createElement('input');
    input.type='hidden';
    input.name=name;
    input.value=value;
    form.appendChild(input);
  };

  addHidden('_subject', assunto);
  addHidden('_captcha', 'false');
  addHidden('_template', 'table');
  addHidden('Teste','Pós-Teste SmartPark');
  addHidden('Nome', aluno.nome);
  addHidden('Idade', aluno.idade);
  addHidden('Ano', aluno.ano);
  addHidden('Turma', aluno.turma);
  addHidden('Respostas respondidas', `${resumo.respondidas} / ${resumo.total}`);
  addHidden('Respostas certas', `${resumo.certas} / ${resumo.total}`);
  addHidden('Nota', `${resumo.nota} valores em 10`);
  resumo.linhas.forEach((linha,idx)=>{
    addHidden(`${idx+1}. ${linha.pergunta}`, `Resposta: ${linha.resposta} | ${linha.estado} | Correta: ${linha.correta}`);
  });

  const fileInput=document.createElement('input');
  fileInput.type='file';
  fileInput.name='attachment';
  const dataTransfer=new DataTransfer();
  dataTransfer.items.add(ficheiro);
  fileInput.files=dataTransfer.files;
  form.appendChild(fileInput);

  let iframe=document.querySelector('iframe[name="formsubmit_smartpark"]');
  if(!iframe){
    iframe=document.createElement('iframe');
    iframe.name='formsubmit_smartpark';
    iframe.style.display='none';
    document.body.appendChild(iframe);
  }

  document.body.appendChild(form);
  setEnviarStatus('A enviar...', true);
  form.submit();
  setTimeout(()=>{
    setEnviarStatus('Resultado enviado.', true);
    form.remove();
  }, 1500);
}
