/**
 * CONFIGURAÇÃO EDITÁVEL — demonstração de portfólio e adaptação para uma clínica.
 * Os identificadores Mxx remetem ao registro em docs/COMPARATIVO.md.
 * Valores vazios mantêm avisos de informação pendente e ocultam links sem destino.
 * Este arquivo é público: não coloque senhas, tokens nem dados de pacientes aqui.
 */
window.CLINIC_CONFIG = Object.freeze({
  // M12 — Portfólio: identifica a clínica como ilustrativa e bloqueia contatos externos.
  // Mantenha true no repositório de exemplo. Para uso real, configure os dados abaixo
  // e altere para false depois de revisar docs/COMPARATIVO.md.
  demoMode: true,

  // M09 — Contatos: código do país + DDD + número, sem ramal.
  // O formato brasileiro é validado antes de habilitar os links.
  whatsapp: '',
  phone: '',

  // M09 — Endereço completo gera o link do Google Maps, sem iframe externo.
  address: '',
  // Use \n para separar dias/horários. Não há horários presumidos no código.
  hours: '',
  // Descreva apenas recursos de acesso existentes e confirmados no local.
  accessibility: '',

  // M08 — Informações administrativas. Vazio preserva as respostas genéricas.
  insuranceInfo: '',
  cancellationInfo: '',

  // M06 — Cadastre somente profissionais reais com registro conferido.
  // Modelo de um item: { name: 'NOME REAL', role: 'ATUAÇÃO CONFIRMADA', cro: 'CRO-UF NÚMERO' }
  // Nome e CRO são necessários; sem eles o item não aparece.
  team: [],

  // M11 — Responsável pelo atendimento da clínica; independente da lista de equipe.
  responsibleProfessional: { name: '', cro: '' },

  // M11 — Troque para true somente após revisar as pendências do comparativo.
  // Não controla hospedagem/publicação; remove apenas o aviso no rodapé.
  publicationReady: false
});
