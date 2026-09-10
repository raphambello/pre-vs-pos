# pre-vs-pos

Simulador de investimentos em renda fixa que compara **prefixado x pós-fixado (CDI) x poupança**.

## O que ele faz

- Calcula e compara o retorno bruto e líquido de um investimento prefixado e de um pós-fixado
  atrelado a um percentual do CDI, dados valor, prazo e taxas.
- Cada lado (pré e pós) tem sua própria tributação configurável — **tributável** (tabela
  regressiva de IR, ex: CDB, Tesouro) ou **isento de IR** (ex: LCI, LCA, CRI, CRA) — permitindo
  comparar produtos diferentes entre si, como um CDB pós-fixado com uma LCI prefixada.
- Inclui a **poupança** como terceira opção, aplicando a regra vigente (0,5% a.m. + TR quando a
  Selic é maior que 8,5% a.a., senão 70% da Selic + TR), sempre isenta de IR. Um destaque calcula
  quanto a melhor alternativa simulada rende a mais do que a poupança — útil para argumentar a
  favor de tirar dinheiro da poupança.
- Mostra um gráfico de evolução do valor investido ao longo do tempo para as três opções.
- Cada produto é opcional: deixando a taxa de rentabilidade (Taxa CDI, Taxa prefixado ou Taxa
  Selic) em branco, o card, a linha no gráfico e a legenda daquele produto somem da comparação —
  útil para simular só um subconjunto (ex: apenas prefixado x poupança).
- Traz uma seção de **risco de marcação a mercado**: simula o que acontece com o preço do
  título prefixado (zero cupom) caso você precise vendê-lo antes do vencimento e a taxa de
  juros de mercado tenha mudado, comparando com o valor "pela curva" contratado.

## Como usar

É uma aplicação estática, sem dependências ou build. Basta abrir `index.html` no navegador,
ou servir a pasta com qualquer servidor estático:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

## Estrutura

- `index.html` — estrutura da página e formulário de entrada
- `style.css` — estilos
- `script.js` — lógica de cálculo financeiro e renderização do gráfico (canvas, sem libs externas)

## Aviso

Simulação com fins educativos. Não considera taxas de custódia/administração, IOF em resgates
com menos de 30 dias, nem garante rentabilidade futura.