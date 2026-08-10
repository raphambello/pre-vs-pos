# pre-vs-pos

Simulador de investimentos em renda fixa que compara **prefixado x pós-fixado (CDI)**.

## O que ele faz

- Calcula e compara o retorno bruto e líquido (com tabela regressiva de IR) de um investimento
  prefixado e de um pós-fixado atrelado a um percentual do CDI, dados valor, prazo e taxas.
- Mostra um gráfico de evolução do valor investido ao longo do tempo para as duas opções.
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