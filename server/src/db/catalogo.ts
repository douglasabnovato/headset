/*
 * catalogo.ts · Catálogo inicial de headphones (marca própria, fictícia).
 * Nomes e especificações são curados à mão; imagens são ilustrações SVG
 * locais (leves e sem depender de sites de terceiros).
 */
export type ItemCatalogo = {
  name: string;
  type: "over-ear" | "on-ear" | "in-ear" | "gamer";
  connection: "bluetooth" | "cabo" | "2.4ghz";
  color: string;
  hex: string;
  price: number;
  compareAt?: number;
  description: string;
  image?: string;
};

export const CATALOGO: ItemCatalogo[] = [
  { name: "Headset Kitty Quartz", type: "gamer", connection: "cabo", color: "Rosa quartzo", hex: "#f2a7c9", price: 799, compareAt: 1599, description: "Headset gamer com orelhas de gatinho iluminadas, drivers de 50 mm e microfone retrátil com cancelamento de ruído.", image: "/produtos/kitty-quartz.png" },
  { name: "Pulse Pro ANC", type: "over-ear", connection: "bluetooth", color: "Preto fosco", hex: "#2b2b30", price: 1299, compareAt: 1599, description: "Cancelamento de ruído ativo adaptativo, 40 horas de bateria e almofadas de espuma com memória para longas viagens." },
  { name: "Pulse Pro ANC", type: "over-ear", connection: "bluetooth", color: "Areia", hex: "#d8c7a8", price: 1299, description: "A mesma cancelamento de ruído do Pulse Pro com acabamento em tom areia e estojo rígido incluso." },
  { name: "Aura Studio", type: "over-ear", connection: "cabo", color: "Grafite", hex: "#4a4f57", price: 899, description: "Fone de referência para estúdio, resposta plana de 5 Hz a 40 kHz e cabo destacável de 3 m." },
  { name: "Aura Studio Open", type: "over-ear", connection: "cabo", color: "Prata", hex: "#b9bec6", price: 1099, description: "Conchas abertas para palco sonoro amplo, ideal para mixagem e audição crítica em casa." },
  { name: "Vortex X7", type: "gamer", connection: "2.4ghz", color: "Preto e verde", hex: "#1f2a1f", price: 949, compareAt: 1199, description: "Sem fio de baixa latência (2.4 GHz), som surround 7.1 virtual e microfone destacável com LED de mudo." },
  { name: "Vortex X5", type: "gamer", connection: "cabo", color: "Preto e vermelho", hex: "#3a1414", price: 499, description: "Headset gamer leve com arco de aço, drivers de 50 mm e controle de volume no fio." },
  { name: "Vortex Lite", type: "gamer", connection: "cabo", color: "Branco", hex: "#eef0f3", price: 299, description: "Entrada perfeita para jogar em console e PC: conector P3, microfone flexível e 250 g." },
  { name: "Nimbus On", type: "on-ear", connection: "bluetooth", color: "Azul céu", hex: "#7fb6e8", price: 399, description: "Supra-auricular dobrável, 30 horas de bateria e carregamento rápido: 10 minutos = 3 horas." },
  { name: "Nimbus On", type: "on-ear", connection: "bluetooth", color: "Lilás", hex: "#b9a3e3", price: 399, description: "Leve e colorido para o dia a dia, com microfone para chamadas e conexão multiponto." },
  { name: "Nimbus Kids", type: "on-ear", connection: "cabo", color: "Amarelo", hex: "#f5c542", price: 199, description: "Limitador de volume em 85 dB, material atóxico e arco flexível que resiste a quedas." },
  { name: "Metro Wired", type: "on-ear", connection: "cabo", color: "Preto", hex: "#26262b", price: 149, description: "Clássico com fio, microfone com botão de atender e cabo reforçado de nylon." },
  { name: "Buds Air", type: "in-ear", connection: "bluetooth", color: "Branco", hex: "#f4f5f7", price: 349, compareAt: 449, description: "Fones intra-auriculares true wireless, estojo com 24 horas extras e resistência a suor IPX4." },
  { name: "Buds Air", type: "in-ear", connection: "bluetooth", color: "Preto", hex: "#23242a", price: 349, description: "Graves reforçados, controle por toque e modo ambiente para ouvir o trânsito com segurança." },
  { name: "Buds Pro ANC", type: "in-ear", connection: "bluetooth", color: "Verde musgo", hex: "#5b6b4a", price: 699, description: "Cancelamento de ruído ativo, três tamanhos de ponteira e áudio espacial com rastreamento de cabeça." },
  { name: "Buds Sport", type: "in-ear", connection: "bluetooth", color: "Laranja", hex: "#f08a3c", price: 279, description: "Ganchos de orelha para corrida, IPX7 e 9 horas de bateria por carga." },
  { name: "Buds Wired", type: "in-ear", connection: "cabo", color: "Branco", hex: "#fafafa", price: 79, description: "Com fio e conector USB-C, microfone embutido e cabo de 1,2 m." },
  { name: "Echo Monitor", type: "in-ear", connection: "cabo", color: "Transparente", hex: "#c8d4dc", price: 599, description: "Monitor de palco com dois drivers balanceados e cabo trançado destacável." },
  { name: "Pulse Travel", type: "over-ear", connection: "bluetooth", color: "Azul marinho", hex: "#1d2f4f", price: 749, description: "Dobrável e compacto para viagens, com adaptador de avião e 35 horas de bateria." },
  { name: "Pulse Travel", type: "over-ear", connection: "bluetooth", color: "Vinho", hex: "#6b2233", price: 749, description: "Versão vinho do Pulse Travel com almofadas de couro sintético e estojo macio." },
  { name: "Vortex Stream", type: "gamer", connection: "2.4ghz", color: "Branco e roxo", hex: "#e9e3f7", price: 1099, description: "Feito para streamers: microfone cardioide destacável, equalizador pelo app e bateria de 30 horas." },
  { name: "Aura Classic", type: "over-ear", connection: "cabo", color: "Madeira", hex: "#8a5a3b", price: 1499, description: "Conchas de madeira nogueira, drivers de berílio e cabo balanceado para quem busca timbre natural." },
  { name: "Nimbus Mini", type: "on-ear", connection: "bluetooth", color: "Rosa", hex: "#f3b2c8", price: 229, description: "Compacto e leve (140 g), ideal para o home office, com botão dedicado para o microfone." },
  { name: "Buds Office", type: "in-ear", connection: "2.4ghz", color: "Cinza", hex: "#8d939b", price: 459, description: "Dongle USB para chamadas no computador sem atraso e microfones com redução de ruído para reuniões." },
];
/* fim de catalogo.ts */
