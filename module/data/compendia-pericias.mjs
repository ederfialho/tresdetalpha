/**
 * Perícias completas do Manual Core 3D&T Alpha (pp. 62-66).
 *
 * Cada perícia custa 2 pontos e inclui todas as especializações do grupo.
 * Alternativa: comprar 3 especializações quaisquer por 1 ponto.
 */

export const PERICIAS = [
  {
    name: "Animais", custo: 2, categoria: "Perícia",
    efeito: "<p>Sabe cuidar de animais, tratar ferimentos, evitar animais perigosos, e até domar animais selvagens. Permite falar a língua dos animais em mundos de fantasia. <br><strong>Especializações:</strong> Doma, Montaria, Tratamento, Treinamento, Veterinária.</p>"
  },
  {
    name: "Arte", custo: 2, categoria: "Perícia",
    efeito: "<p>Sensibilidade e talento para artes. Cantar, dançar, desenhar, pintar, esculpir, tocar instrumentos. <br><strong>Especializações:</strong> Atuação, Falsificação, Fotografia, Instrumentos Musicais, Prestidigitação, Redação, Canto, Culinária, Dança, Desenho, Escultura, Pintura, Joalheria.</p>"
  },
  {
    name: "Ciência", custo: 2, categoria: "Perícia",
    efeito: "<p>Conhecimentos sobre ciências em geral, incluindo as obscuras. <br><strong>Especializações:</strong> Astronomia, Biologia, Ciências Proibidas (ocultismo, ufologia...), Geografia, História, Meteorologia, Psicologia, Antropologia, Arqueologia, Criminalística, Ecologia, Genética, Literatura, Metalografia, Química.</p>"
  },
  {
    name: "Crime", custo: 2, categoria: "Perícia",
    efeito: "<p>Ladrão, espião, falsário, arrombador. Consulte o mestre se está disponível pra jogadores. <br><strong>Especializações:</strong> Armadilhas, Arrombamento, Criptografia, Disfarce, Falsificação, Furtividade, Intimidação, Punga, Rastreio.</p>"
  },
  {
    name: "Esporte", custo: 2, categoria: "Perícia",
    efeito: "<p>Pratica vários tipos de esportes. Não afeta combate, mesmo artes marciais. <br><strong>Especializações:</strong> Acrobacia, Alpinismo, Arqueria, Corrida, Jogos (cartas, tabuleiro, videogame), Mergulho, Natação, Pilotagem, Arremesso, Artes Marciais, Boxe, Caça, Parkour, Pesca, Paraquedismo, Salto.</p>"
  },
  {
    name: "Idiomas", custo: 2, categoria: "Perícia",
    efeito: "<p>Poliglota. Aprende outras línguas com facilidade. Sem esta perícia, só fala a língua comum do local da campanha e a sua nativa. Não precisa de testes pra aprender novas magias. <br><strong>Especializações:</strong> Código Morse, Criptografia, Leitura Labial, Linguagem de Sinais, Inglês, Francês, Italiano, Alemão, Espanhol.</p>"
  },
  {
    name: "Investigação", custo: 2, categoria: "Perícia",
    efeito: "<p>Policial, detetive ou agente secreto. Seguir pistas, procurar impressões digitais, decifrar códigos, destrancar fechaduras, desarmar armadilhas. <br><strong>Especializações:</strong> Armadilhas, Arrombamento, Criptografia, Disfarce, Falsificação, Furtividade, Interrogatório, Intimidação, Leitura Labial, Rastreio.</p>"
  },
  {
    name: "Máquinas", custo: 2, categoria: "Perícia",
    efeito: "<p>Bom com máquinas, veículos, computadores. Operar, pilotar, dirigir, construir, consertar. <br><strong>Especializações:</strong> Armadilhas, Computação, Condução, Eletrônica, Engenharia, Mecânica, Pilotagem.</p>"
  },
  {
    name: "Manipulação", custo: 2, categoria: "Perícia",
    efeito: "<p>Obtém favores por truques, engodos ou ameaças. <br><strong>Especializações:</strong> Hipnose, Interrogatório, Lábia, Intimidação, Sedução.</p>"
  },
  {
    name: "Medicina", custo: 2, categoria: "Perícia",
    efeito: "<p>Diagnósticos, curas, cirurgias. Restaurar 1 PV é tarefa Média, apenas um teste por dia por paciente. Primeiros Socorros pode auxiliar em Testes de Morte. <br><strong>Especializações:</strong> Cirurgia, Diagnose, Primeiros Socorros, Psiquiatria, Veterinária.</p>"
  },
  {
    name: "Sobrevivência", custo: 2, categoria: "Perícia",
    efeito: "<p>Sobrevive em lugares selvagens. Caçar, pescar, abrigar. Cada tipo de região é uma especialização. <br><strong>Especializações:</strong> Alpinismo, Armadilhas, Arqueria, Furtividade, Meteorologia, Navegação, Pesca, Rastreio.</p>"
  }
];
