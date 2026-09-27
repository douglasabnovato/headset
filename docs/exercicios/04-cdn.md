# Exercício 4 · Como uma CDN melhora a performance

1. **Proximidade**: o arquivo é entregue pelo *edge* mais perto do usuário (menos latência de rede — decisivo no Brasil, onde a distância até a origem pode passar de 100 ms).
2. **Menos carga na origem**: imagens, JS e CSS saem do cache da CDN; o servidor só atende o que é dinâmico.
3. **Cache inteligente**: arquivos com hash no nome (o `vite build` gera `index-DlQ45_Q9.js`) podem ter `Cache-Control: max-age=31536000, immutable`; o HTML fica com cache curto.
4. **Protocolos e compressão**: HTTP/2 e HTTP/3, Brotli/Gzip e TLS terminado no edge.
5. **Otimização de imagem sob demanda**: redimensionar e converter para WebP/AVIF no edge.
6. **Resiliência e segurança**: absorve picos (Black Friday), serve conteúdo mesmo com a origem lenta e oferece WAF e proteção DDoS.

No projeto: o `dist/` do front e a pasta `uploads/` podem ser publicados atrás de uma CDN (CloudFront, Cloudflare); a API continua na origem.
