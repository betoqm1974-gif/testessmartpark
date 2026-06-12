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
  for(const [name,ans] of Object.entries(ALL_ANSWERS)){
    total++;
    const value=getAnswer(name);
    if(value) respondidas++;
    if(respostaCerta(value,ans)) certas++;
  }
  const nota=total?((certas/total)*10).toFixed(2).replace('.',','):'0,00';
  return {total, certas, respondidas, nota};
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

function linhasResultados(){
  const aluno=obterDadosAluno();
  const resumo=obterResumoResultados();
  const rows=[];
  rows.push(['SmartPark - Pós-Teste']);
  rows.push(['Nome', aluno.nome]);
  rows.push(['Idade', aluno.idade]);
  rows.push(['Ano', aluno.ano]);
  rows.push(['Turma', aluno.turma]);
  rows.push([]);
  rows.push(['Pergunta','Resposta do aluno','Resposta correta','Resultado']);
  for(const [name,ans] of Object.entries(ALL_ANSWERS)){
    const value=getAnswer(name);
    const ok=respostaCerta(value,ans);
    rows.push([etiquetaPergunta(name), value || 'Sem resposta', formatarResposta(ans), ok?'Certa':'Errada']);
  }
  rows.push([]);
  rows.push(['Respostas respondidas', `${resumo.respondidas} / ${resumo.total}`]);
  rows.push(['Respostas certas', `${resumo.certas} / ${resumo.total}`]);
  rows.push(['Nota', `${resumo.nota} valores em 10`]);
  return rows;
}
function xmlEscape(v){
  return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
function colName(n){
  let s='';
  while(n>0){
    const m=(n-1)%26;
    s=String.fromCharCode(65+m)+s;
    n=Math.floor((n-1)/26);
  }
  return s;
}
function sheetXmlFromRows(rows){
  const sheetData=rows.map((row,r)=>{
    const cells=row.map((v,c)=>{
      const ref=colName(c+1)+(r+1);
      return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(v)}</t></is></c>`;
    }).join('');
    return `<row r="${r+1}">${cells}</row>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/><sheetData>${sheetData}</sheetData></worksheet>`;
}
function crc32(str){
  const table=crc32.table || (crc32.table=(()=>{
    let c, t=[];
    for(let n=0;n<256;n++){
      c=n;
      for(let k=0;k<8;k++) c=((c&1)?(0xEDB88320^(c>>>1)):(c>>>1));
      t[n]=c>>>0;
    }
    return t;
  })());
  let crc=0^(-1);
  for(let i=0;i<str.length;i++) crc=(crc>>>8)^table[(crc^str.charCodeAt(i))&0xff];
  return (crc^(-1))>>>0;
}
function dosTimeDate(date=new Date()){
  const time=(date.getHours()<<11)|(date.getMinutes()<<5)|(Math.floor(date.getSeconds()/2));
  const year=Math.max(date.getFullYear(),1980);
  const dosdate=((year-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate();
  return {time, dosdate};
}
function u16(n){return String.fromCharCode(n&255,(n>>>8)&255)}
function u32(n){return String.fromCharCode(n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255)}
function criarZipSemCompressao(files){
  let local='', central='', offset=0;
  const dt=dosTimeDate();
  files.forEach(f=>{
    const name=f.name;
    const data=f.data;
    const crc=crc32(data);
    const size=data.length;
    const localHeader='PK\x03\x04'+u16(20)+u16(0)+u16(0)+u16(dt.time)+u16(dt.dosdate)+u32(crc)+u32(size)+u32(size)+u16(name.length)+u16(0)+name;
    local+=localHeader+data;
    const centralHeader='PK\x01\x02'+u16(20)+u16(20)+u16(0)+u16(0)+u16(dt.time)+u16(dt.dosdate)+u32(crc)+u32(size)+u32(size)+u16(name.length)+u16(0)+u16(0)+u16(0)+u16(0)+u32(0)+u32(offset)+name;
    central+=centralHeader;
    offset+=localHeader.length+size;
  });
  const end='PK\x05\x06'+u16(0)+u16(0)+u16(files.length)+u16(files.length)+u32(central.length)+u32(offset)+u16(0);
  const bin=local+central+end;
  const arr=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i)&255;
  return arr;
}
function criarXlsxResultados(){
  const rows=linhasResultados();
  const files=[
    {name:'[Content_Types].xml', data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`},
    {name:'_rels/.rels', data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`},
    {name:'xl/workbook.xml', data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Resultados" sheetId="1" r:id="rId1"/></sheets></workbook>`},
    {name:'xl/_rels/workbook.xml.rels', data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`},
    {name:'xl/styles.xml', data:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`},
    {name:'xl/worksheets/sheet1.xml', data:sheetXmlFromRows(rows)}
  ];
  const zip=criarZipSemCompressao(files);
  return new Blob([zip],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
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
  const assunto=`Resultados SmartPark - ${aluno.nome || 'Aluno'}`;
  const resumo=obterResumoResultados();
  const formData=new FormData();
  formData.append('_subject', assunto);
  formData.append('_template', 'table');
  formData.append('_captcha', 'false');
  formData.append('Teste','Pós-Teste SmartPark');
  formData.append('Nome', aluno.nome);
  formData.append('Idade', aluno.idade);
  formData.append('Ano', aluno.ano);
  formData.append('Turma', aluno.turma);
  formData.append('Respostas respondidas', `${resumo.respondidas} / ${resumo.total}`);
  formData.append('Respostas certas', `${resumo.certas} / ${resumo.total}`);
  formData.append('Nota', `${resumo.nota} valores em 10`);
  for(const [name,ans] of Object.entries(ALL_ANSWERS)){
    const value=getAnswer(name);
    formData.append(etiquetaPergunta(name), value || 'Sem resposta');
  }
  const xlsx=criarXlsxResultados();
  const nomeFicheiro=`resultados_smartpark_${aluno.nome.replace(/[^a-z0-9]+/gi,'_') || 'aluno'}.xlsx`;
  formData.append('attachment', xlsx, nomeFicheiro);
  setEnviarStatus('A enviar...', true);
  try{
    const res=await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(emailDestino)}`,{
      method:'POST',
      headers:{'Accept':'application/json'},
      body:formData
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
