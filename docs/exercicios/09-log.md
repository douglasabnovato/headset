# Exercício 9 · Leitura do log

**O que aconteceu**: em produção (16/05/2018 01:07:31) a rota de detalhe de produto da API (`ProdutoController@info`, linha 181) quebrou com *"Call to a member function getImage() on null"* em `app/Models/Imagem.php:147`.

**Caminho (lendo a pilha de baixo para cima)**
1. Requisição passa pelos middlewares (CORS, manutenção, `Localize`, `AuthenticateApi`) e chega em `ProdutoController::info()` para o produto **667**.
2. O controller usa `Cache::rememberForever('products_667_in...')` e, dentro do closure, monta a resposta com Fractal (`ResponseFactory` → `ProdutoTransformer`).
3. O `ProdutoTransformer` tem o *include* **`capa`**, que chama o `ImagemTransformer` (linha 25) → `Imagem::getThumbs()`.
4. `getThumbs()` (linha 157) usa outro `rememberForever('products_667_im...')`; dentro dele, na linha 147, algo que deveria ser um objeto é `null` e recebe `->getImage()`.

**Causa provável**: o produto 667 tem uma imagem de capa cujo relacionamento/arquivo original não existe mais (registro apagado, imagem órfã ou thumbnail sem a imagem-pai). Não há checagem de `null`.

**Agravante**: `rememberForever` — se em algum momento um valor ruim for cacheado, ele fica para sempre; e cada requisição ao produto 667 repete o erro (o cache nunca é preenchido porque o closure falha).

**Correção**
- Imediata: tratar o nulo (`$this->original?->getImage()` ou `if (!$original) return [];`) e/ou o include `capa` devolver `null` quando não houver imagem.
- Dados: corrigir o produto 667 e buscar outros registros órfãos (FK com `ON DELETE` adequado).
- Estrutural: TTL em vez de `rememberForever` + invalidação quando a imagem muda; teste para produto sem capa; alerta (Sentry) com o ID do produto no contexto.

No projeto, o equivalente defensivo está no transformer de item (produto pode ser `null`) e no front (`product?.imageUrl`).
