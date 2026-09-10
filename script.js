const form = document.getElementById("form-simulacao");
const resultados = document.getElementById("resultados");
const mtmPanel = document.getElementById("mtm-panel");

const IR_FAIXAS = [
  { ateDias: 180, aliquota: 0.225 },
  { ateDias: 360, aliquota: 0.2 },
  { ateDias: 720, aliquota: 0.175 },
  { ateDias: Infinity, aliquota: 0.15 },
];

function aliquotaIR(dias) {
  return IR_FAIXAS.find((f) => dias <= f.ateDias).aliquota;
}

function taxaMensalEquivalente(taxaAnual) {
  return Math.pow(1 + taxaAnual, 1 / 12) - 1;
}

function parseNumero(id) {
  const bruto = document.getElementById(id).value.trim().replace(",", ".");
  const numero = parseFloat(bruto);
  return Number.isFinite(numero) ? numero : 0;
}

function taxaPoupancaMensal(selicAnual, trMensal) {
  if (selicAnual > 0.085) {
    return 0.005 + trMensal;
  }
  return taxaMensalEquivalente(selicAnual) * 0.7 + trMensal;
}

function formatBRL(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPct(valor, casas = 2) {
  return `${valor.toFixed(casas).replace(".", ",")}%`;
}

let ultimaSimulacao = null;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  simular();
});

document.getElementById("novaTaxa").addEventListener("input", atualizarMarcacaoMercado);
document.getElementById("momentoVenda").addEventListener("input", atualizarMarcacaoMercado);

function simular() {
  const valor = parseFloat(document.getElementById("valor").value);
  const prazoMeses = parseInt(document.getElementById("prazo").value, 10);
  const cdiAnual = parseNumero("cdi") / 100;
  const percentualCdi = parseNumero("percentualCdi") / 100;
  const prefixadoAnual = parseNumero("prefixado") / 100;
  const posIsento = document.getElementById("posTributacao").value === "isento";
  const preIsento = document.getElementById("preTributacao").value === "isento";
  const selicAnual = parseNumero("selic") / 100;
  const trMensal = parseNumero("tr") / 100;

  const taxaPosAnual = cdiAnual * percentualCdi;
  const taxaPreAnual = prefixadoAnual;
  const taxaPoupMensal = taxaPoupancaMensal(selicAnual, trMensal);

  const taxaPosMensal = taxaMensalEquivalente(taxaPosAnual);
  const taxaPreMensal = taxaMensalEquivalente(taxaPreAnual);

  const posSerie = [];
  const preSerie = [];
  const poupSerie = [];
  for (let m = 0; m <= prazoMeses; m++) {
    posSerie.push(valor * Math.pow(1 + taxaPosMensal, m));
    preSerie.push(valor * Math.pow(1 + taxaPreMensal, m));
    poupSerie.push(valor * Math.pow(1 + taxaPoupMensal, m));
  }

  const posBruto = posSerie[prazoMeses];
  const preBruto = preSerie[prazoMeses];
  const poupLiquido = poupSerie[prazoMeses];

  const dias = prazoMeses * 30;
  const aliquotaPos = posIsento ? 0 : aliquotaIR(dias);
  const aliquotaPre = preIsento ? 0 : aliquotaIR(dias);

  const posLiquido = valor + (posBruto - valor) * (1 - aliquotaPos);
  const preLiquido = valor + (preBruto - valor) * (1 - aliquotaPre);

  document.getElementById("posLabel").textContent = `Pós-fixado (CDI) — ${posIsento ? "isento de IR" : "tributável"}`;
  document.getElementById("preLabel").textContent = `Prefixado — ${preIsento ? "isento de IR" : "tributável"}`;
  document.getElementById("posBruto").textContent = `Bruto: ${formatBRL(posBruto)}`;
  document.getElementById("preBruto").textContent = `Bruto: ${formatBRL(preBruto)}`;
  document.getElementById("posLiquido").textContent = formatBRL(posLiquido);
  document.getElementById("preLiquido").textContent = formatBRL(preLiquido);
  document.getElementById("poupLiquido").textContent = formatBRL(poupLiquido);

  const diferenca = preLiquido - posLiquido;
  const veredito = document.getElementById("veredito");
  if (Math.abs(diferenca) < 0.01) {
    veredito.textContent = "Prefixado e pós-fixado resultam em rentabilidade líquida praticamente idêntica entre si.";
  } else if (diferenca > 0) {
    veredito.textContent = `Entre as duas alternativas, o prefixado rende ${formatBRL(diferenca)} a mais (líquido) que o pós-fixado ao final do prazo.`;
  } else {
    veredito.textContent = `Entre as duas alternativas, o pós-fixado rende ${formatBRL(-diferenca)} a mais (líquido) que o prefixado ao final do prazo.`;
  }

  const melhorAlternativa = Math.max(posLiquido, preLiquido);
  const nomeMelhorAlternativa = melhorAlternativa === preLiquido ? "prefixado" : "pós-fixado";
  const diferencaVsPoupanca = melhorAlternativa - poupLiquido;
  const percentualVsPoupanca = (diferencaVsPoupanca / valor) * 100;
  const destaquePoupanca = document.getElementById("destaquePoupanca");
  if (diferencaVsPoupanca > 0.01) {
    destaquePoupanca.innerHTML = `💡 Sair da poupança para o <strong>${nomeMelhorAlternativa}</strong> rende <strong>${formatBRL(diferencaVsPoupanca)} a mais</strong> (líquido) nesse prazo — ${formatPct(percentualVsPoupanca)} a mais sobre o valor investido, só pela escolha do investimento.`;
  } else {
    destaquePoupanca.innerHTML = `Nessas condições específicas, a poupança rende ${formatBRL(-diferencaVsPoupanca)} a mais que a melhor alternativa simulada — revise as taxas informadas.`;
  }

  desenharGrafico(posSerie, preSerie, poupSerie);

  ultimaSimulacao = { valor, prazoMeses, taxaPreAnual };

  resultados.hidden = false;
  mtmPanel.hidden = false;

  const momentoVenda = document.getElementById("momentoVenda");
  momentoVenda.max = Math.max(1, prazoMeses - 1);
  if (parseInt(momentoVenda.value, 10) > momentoVenda.max) {
    momentoVenda.value = momentoVenda.max;
  }
  atualizarMarcacaoMercado();
}

function desenharGrafico(posSerie, preSerie, poupSerie) {
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const padding = { top: 20, right: 20, bottom: 30, left: 70 };

  ctx.clearRect(0, 0, w, h);

  const todos = posSerie.concat(preSerie, poupSerie);
  const min = Math.min(...todos);
  const max = Math.max(...todos);
  const range = max - min || 1;

  const plotW = w - padding.left - padding.right;
  const plotH = h - padding.top - padding.bottom;

  const x = (i) => padding.left + (i / (posSerie.length - 1)) * plotW;
  const y = (v) => padding.top + plotH - ((v - min) / range) * plotH;

  ctx.strokeStyle = "#2a3646";
  ctx.lineWidth = 1;
  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#94a3b5";
  const gridLines = 4;
  for (let g = 0; g <= gridLines; g++) {
    const val = min + (range / gridLines) * g;
    const yy = y(val);
    ctx.beginPath();
    ctx.moveTo(padding.left, yy);
    ctx.lineTo(w - padding.right, yy);
    ctx.stroke();
    ctx.fillText(formatBRL(val), 4, yy + 4);
  }

  function desenharLinha(serie, cor) {
    ctx.beginPath();
    serie.forEach((v, i) => {
      const px = x(i);
      const py = y(v);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  desenharLinha(posSerie, "#35c3a1");
  desenharLinha(preSerie, "#f0a84e");
  desenharLinha(poupSerie, "#e2685f");
}

function atualizarMarcacaoMercado() {
  if (!ultimaSimulacao) return;

  const novaTaxaInput = document.getElementById("novaTaxa");
  const novaTaxaAnual = parseFloat(novaTaxaInput.value) / 100;
  document.getElementById("novaTaxaValor").textContent = `${formatPct(novaTaxaAnual * 100)} a.a.`;

  const momentoVenda = parseInt(document.getElementById("momentoVenda").value, 10);
  const { valor, prazoMeses, taxaPreAnual } = ultimaSimulacao;

  const tEmAnos = momentoVenda / 12;
  const prazoTotalAnos = prazoMeses / 12;
  const prazoRestanteAnos = Math.max(prazoTotalAnos - tEmAnos, 1 / 365);

  const valorFace = valor * Math.pow(1 + taxaPreAnual, prazoTotalAnos);
  const precoPelaCurva = valor * Math.pow(1 + taxaPreAnual, tEmAnos);
  const precoMarcado = valorFace / Math.pow(1 + novaTaxaAnual, prazoRestanteAnos);

  const diferenca = precoMarcado - precoPelaCurva;
  const diferencaPct = (diferenca / precoPelaCurva) * 100;

  const resultDiv = document.getElementById("mtm-result");
  const efeito = diferenca >= 0 ? "up" : "down";
  const efeitoTexto = diferenca >= 0 ? "ágio" : "deságio";

  resultDiv.innerHTML = `
    <div class="mtm-box">
      <span class="label">Prefixado — valor pela curva (contratado)</span>
      <span class="value">${formatBRL(precoPelaCurva)}</span>
    </div>
    <div class="mtm-box">
      <span class="label">Prefixado — marcado a mercado</span>
      <span class="value ${efeito}">${formatBRL(precoMarcado)}</span>
    </div>
    <div class="mtm-box">
      <span class="label">Efeito da marcação a mercado</span>
      <span class="value ${efeito}">${efeitoTexto} de ${formatBRL(Math.abs(diferenca))} (${formatPct(Math.abs(diferencaPct))})</span>
    </div>
    <div class="mtm-box">
      <span class="label">Pós-fixado — valor estimado no mesmo período</span>
      <span class="value">Acompanha o CDI diariamente, com preço de mercado estável (sem ágio/deságio relevante)</span>
    </div>
  `;
}
