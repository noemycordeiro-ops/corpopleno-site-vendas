/* =========================================================================
   CorpoPleno — módulo de idiomas (i18n)
   Estrutura local, sem tradução automática externa e sem dependência de
   internet. PT-BR é a fonte completa e autoritativa nesta primeira versão.
   EN-US, KO-KR e ES-CL já traduzem toda a navegação, rodapé e a Home.
   Nas páginas internas mais longas (Produtos, Cursos, Sobre, Atendimento,
   Termos, Privacidade), cabeçalhos e rótulos de interface já são
   traduzidos; o conteúdo detalhado em prosa permanece em PT-BR até que a
   tradução humana local seja concluída — um aviso claro é exibido nesse
   caso (ver CP_I18N.showPartialNotice).
   ========================================================================= */

(function (global) {
  "use strict";

  var SUPPORTED = ["pt-BR", "pt-PT", "en-US", "ko-KR", "es-CL"];
  var DEFAULT_LANG = "pt-BR";
  var STORAGE_KEY = "cp_lang";

  var dict = {
    "pt-BR": {
      "catalog.empty_state": "Novidades estão sendo preparadas para você.",
      skip_link: "Pular para o conteúdo principal",
      lang_label: "Selecionar idioma",

      "nav.home": "Início",
      "nav.products": "Produtos",
      "nav.courses": "Cursos",
      "nav.about": "Sobre",
      "nav.support": "Atendimento",
      "nav.account": "Minha área",
      "nav.login": "Entrar",
      "login.hero.eyebrow": "Acesso à conta",
      "login.hero.title": "Entrar",
      "login.hero.lead": "Acesse sua conta CorpoPleno para ver seus produtos e cursos.",
      "login.form.email_label": "E-mail",
      "login.form.password_label": "Senha",
      "login.form.submit": "Entrar",
      "login.form.forgot": "Esqueci minha senha",
      "login.form.no_account": "Ainda não tenho conta —",
      "login.form.create_account_link": "Criar conta",
      "auth.form.pending": "O acesso à sua conta está sendo preparado com segurança. Em breve você poderá entrar de verdade.",
      "signup.hero.eyebrow": "Nova conta",
      "signup.hero.title": "Criar sua conta",
      "signup.hero.lead": "Preencha seus dados para criar sua conta CorpoPleno.",
      "signup.form.name_label": "Nome",
      "signup.form.email_label": "E-mail",
      "signup.form.phone_label": "Telefone",
      "signup.form.password_label": "Senha",
      "signup.form.confirm_password_label": "Confirmar senha",
      "signup.form.terms_prefix": "Li e aceito os",
      "signup.form.terms_middle": "e a",
      "signup.form.submit": "Criar conta",
      "signup.form.have_account": "Já tenho conta —",
      "signup.form.login_link": "Entrar",
      "account.hero.title": "Minha área",
      "account.redirect.message": "Para acessar sua área, você precisa entrar na sua conta.",
      "account.redirect.cta": "Entrar",
      "nav.terms": "Termos",
      "nav.privacy": "Privacidade",
      "nav.aria_label": "Navegação principal",
      "nav_toggle.open_label": "Abrir menu",

      "brand.slogan": "Inteligente, resultado real",

      "common.in_preparation": "Em preparação",
      "common.available": "Disponível",
      "common.bonus_tag": "Bônus",
      "common.checkout_button": "Ver oferta",
      "common.checkout_pending": "Checkout em configuração",
      "common.learn_more": "Saiba mais",
      "common.price_unavailable": "Preço indisponível neste mercado.",
      "common.partial_notice":
        "Esta página ainda está totalmente disponível apenas em Português (Brasil). A tradução completa deste conteúdo está em preparação.",
      "whatsapp.float_label": "Falar pelo WhatsApp com a CorpoPleno",
      "whatsapp.initial_message":
        "Olá! Vim pelo site da CorpoPleno e gostaria de atendimento.",
      "account.pending_toast":
        "Área do cliente em preparação. O login real será conectado futuramente a um backend seguro — nenhuma autenticação existe nesta versão.",

      "footer.about.title": "CorpoPleno",
      "footer.about.body":
        "Educação, tecnologia e cuidado reunidos para uma experiência CorpoPleno simples, acessível e responsável.",
      "footer.about.cnpj": "CNPJ: 68.987.084/0001-32",
      "footer.about.location": "São Paulo, Brasil",
      "footer.links.title": "Navegação",
      "footer.legal.title": "Legal",
      "footer.contact.title": "Contato",
      "footer.contact.email_label": "E-mail",
      "footer.contact.whatsapp_label": "WhatsApp",
      "footer.contact.whatsapp_link_label": "Falar pelo WhatsApp",
      "footer.contact.pending": "Canal em configuração",

      "legal.company_id.title": "Identificação da empresa",
      "legal.company_id.brand_label": "Marca",
      "legal.company_id.cnpj_label": "CNPJ",
      "legal.company_id.location_label": "Localização pública",
      "legal.company_id.site_label": "Site",
      "legal.company_id.review_note":
        "Informações jurídicas adicionais (como razão social e endereço cadastral completo) ainda serão confirmadas em revisão jurídica/empresarial antes da operação definitiva.",
      "footer.language.title": "Idioma",
      "footer.copyright":
        "© 2026 CorpoPleno. Todos os direitos reservados.",

      "home.hero.eyebrow": "CorpoPleno",
      "home.hero.title": "Uma base clara para uma vida mais plena",
      "home.hero.slogan": "Inteligente, resultado real",
      "home.hero.lead":
        "Reunimos produtos, cursos e materiais organizados com metodologia, tecnologia e revisão de conteúdo — para você avançar com clareza, no seu ritmo.",
      "home.hero.cta_primary": "Explorar produtos",
      "home.hero.cta_secondary": "Conhecer a CorpoPleno",
      "home.hero.chip3": "Tecnologia",
      "home.hero.chip4": "Confiança",

      "characters.eyebrow": "Nossa turma",
      "characters.title": "Personagens CorpoPleno",
      "characters.ester.name": "Ester",
      "characters.ester.desc": "Guia a jornada CorpoPleno com atenção e bom humor.",
      "characters.ester.hero_alt": "Ester sorrindo diante do notebook, com Mimi (gata), Ping (cachorro) e Pipo (papagaio) por perto, em um ambiente claro e alegre",
      "characters.mimi.name": "Mimi",
      "characters.mimi.desc": "Curiosa e observadora, sempre atenta aos detalhes.",
      "characters.ping.name": "Ping",
      "characters.ping.desc": "Companheiro leal, com energia para o dia a dia.",
      "characters.pipo.name": "Pipo",
      "characters.pipo.desc": "Alegre e comunicativo, traz leveza para a conversa.",

      "home.intro.eyebrow": "Conheça a CorpoPleno",
      "home.intro.title": "O que é a CorpoPleno",
      "home.intro.body":
        "A CorpoPleno organiza conhecimento e ferramentas com propósito, metodologia própria e compromisso contínuo com qualidade — unindo educação, tecnologia e cuidado.",
      "home.intro.point1.title": "Propósito claro",
      "home.intro.point1.desc":
        "Ajudar pessoas a organizarem saúde, estudo e rotina com informação confiável.",
      "home.intro.point2.title": "Metodologia própria",
      "home.intro.point2.desc":
        "Conteúdos estruturados em etapas, com revisão antes da publicação.",
      "home.intro.point3.title": "Tecnologia a serviço das pessoas",
      "home.intro.point3.desc":
        "Ferramentas simples e diretas, sem complicar o que pode ser fácil.",
      "home.intro.point4.title": "Organização e revisão contínua",
      "home.intro.point4.desc":
        "Cada material passa por revisão de conteúdo antes de chegar até você.",
      "home.intro.cta": "Ler mais sobre a CorpoPleno",

      "home.explore.eyebrow": "Explore",
      "home.explore.title": "Explore a CorpoPleno",
      "home.explore.lead": "Escolha por onde começar.",
      "home.explore.produtos.title": "Produtos",
      "home.explore.produtos.desc": "Materiais, autocuidado e soluções organizadas por categoria.",
      "home.explore.produtos.cta": "Conheça os produtos CorpoPleno →",
      "home.explore.cursos.title": "Cursos",
      "home.explore.cursos.desc": "Formação estruturada, do idioma ao curso técnico.",
      "home.explore.cursos.cta": "Conheça os cursos CorpoPleno →",
      "home.explore.miniapps.title": "Mini Apps",
      "home.explore.miniapps.desc": "Ferramentas interativas para o seu dia a dia.",
      "home.explore.miniapps.cta": "Explorar Mini Apps →",
      "home.explore.atendimento.title": "Atendimento",
      "home.explore.atendimento.desc": "Precisa de ajuda? Encontre o canal ideal para sua solicitação.",
      "home.explore.atendimento.cta": "Falar com o atendimento →",


      "home.support.eyebrow": "Aqui para ajudar",
      "home.support.title": "Atendimento CorpoPleno",
      "home.support.desc": "Precisa de ajuda? Encontre o canal ideal para sua solicitação.",
      "home.support.cta": "Falar com o atendimento",

      "home.faq.eyebrow": "Dúvidas",
      "home.faq.title": "Perguntas frequentes",
      "home.faq.q1": "Como recebo meus produtos após a compra?",
      "home.faq.a1":
        "Assim que a compra for confirmada, você recebe as instruções de acesso por e-mail. Hoje nenhum produto está publicado — isso será ativado assim que o catálogo for liberado.",
      "home.faq.q2": "Como funciona o atendimento?",
      "home.faq.a2":
        "Conte sua dúvida na página de Atendimento — a CorpoPleno responde a partir daí.",
      "home.faq.q3": "Como funciona cancelamento ou reembolso?",
      "home.faq.a3":
        "Abra a solicitação na página de Atendimento; verificações adicionais podem ser necessárias antes da confirmação.",
      "home.faq.q4": "Como acesso minha área?",
      "home.faq.a4":
        "Use o botão \"Minha área\" no topo do site. O login real será conectado em breve.",

      "home.cta.title": "Conheça o universo CorpoPleno",
      "home.cta.body": "Explore produtos, cursos e experiências desenvolvidas para acompanhar diferentes momentos da sua jornada.",
      "home.cta.button": "Explorar CorpoPleno",


      "products.hero.eyebrow": "Catálogo CorpoPleno",
      "products.hero.title": "Produtos",
      "products.hero.lead":
        "Categorias organizadas para receber os produtos CorpoPleno. Itens ainda não lançados aparecem como \"Em preparação\" — nada aqui está disponível para compra até que o checkout oficial seja conectado.",
      "products.notice":
        "Nenhum link de checkout foi configurado ainda. Os botões de compra abaixo estão desativados de propósito.",
      "products.category_empty":
        "Nenhum produto aprovado para exibição pública nesta categoria ainda.",
      "products.filter.all": "Todas as categorias",
      "products.filter.ebooks": "eBooks",
      "products.filter.livros": "Livros",
      "products.filter.miniapps": "Mini apps",
      "products.filter.autocuidado": "Autocuidado",
      "products.filter.natural": "CorpoPleno Natural",
      "products.filter.capilares": "Materiais capilares",
      "products.filter.nutricao": "Nutrição",

      "courses.hero.eyebrow": "Formação CorpoPleno",
      "courses.hero.title": "Cursos",
      "courses.hero.lead":
        "Área preparada para os cursos CorpoPleno. Informações sobre carga horária, conteúdo e certificação de cada curso serão apresentadas na página específica antes da matrícula.",
      "courses.notice":
        "Ainda não há cursos publicados.",
      "courses.filter.all": "Todas as categorias",
      "courses.filter.idiomas": "Idiomas",
      "courses.filter.empresarial": "Empresarial",
      "courses.filter.tecnicos": "Técnicos",
      "courses.filter.curtos": "Cursos curtos",
      "courses.filter.libras": "Libras (bônus)",
      "courses.category_empty": "Nenhum curso aprovado para exibição pública nesta categoria ainda.",
      "courses.category.idiomas.body":
        "Cursos de idiomas estão em planejamento, incluindo turmas principais com carga horária estimada em 12 meses. Nenhum curso de idioma foi aprovado para lançamento público ainda — nomes, datas e valores serão anunciados após aprovação final.",
      "courses.libras.title": "Libras — conteúdo bônus",
      "courses.libras.body":
        "Libras não é vendida como curso independente. É um conteúdo bônus, liberado para quem comprar um curso CorpoPleno elegível — a liberação dependerá do registro real da compra assim que os cursos estiverem publicados.",

      "about.hero.eyebrow": "Institucional",
      "about.hero.title": "O que é a CorpoPleno",
      "about.hero.lead": "A CorpoPleno reúne conhecimento, educação, tecnologia e cuidado em soluções criadas para tornar o aprendizado e o dia a dia mais claros, organizados e acessíveis.",
      "about.hero.photo_alt": "Ester sorrindo diante do notebook, com Mimi (gata), Ping (cachorro) e Pipo (papagaio) por perto",
      "about.essence.eyebrow": "Quem somos",
      "about.essence.title": "Nossa essência",
      "about.essence.body": "A CorpoPleno nasceu para transformar conhecimento em experiências mais simples de compreender, aplicar e acompanhar. Organizamos conteúdos, ferramentas e soluções com clareza, responsabilidade e atenção à experiência de cada pessoa.",
      "about.pillars.eyebrow": "O que nos guia",
      "about.pillars.title": "Pilares CorpoPleno",
      "about.pillars.item1.title": "Conhecimento com propósito",
      "about.pillars.item1.body": "Conteúdos pensados para ajudar pessoas a aprender, se organizar e tomar decisões com mais clareza.",
      "about.pillars.item2.title": "Qualidade e responsabilidade",
      "about.pillars.item2.body": "Buscamos apresentar informações claras, consistentes e sustentadas por referências adequadas ao tema.",
      "about.pillars.item3.title": "Tecnologia que simplifica",
      "about.pillars.item3.body": "Usamos tecnologia para tornar conteúdos e ferramentas mais acessíveis, intuitivos e fáceis de utilizar.",
      "about.pillars.item4.title": "Evolução contínua",
      "about.pillars.item4.body": "Produtos, materiais e experiências CorpoPleno são desenvolvidos e aprimorados continuamente, respeitando cada etapa antes de sua disponibilização.",
      "about.content.eyebrow": "Como produzimos",
      "about.content.title": "Conteúdo desenvolvido com responsabilidade",
      "about.content.body": "Os conteúdos CorpoPleno são estruturados a partir de pesquisa, fontes confiáveis, documentos oficiais e referências bibliográficas quando aplicáveis ao tema. O compromisso é transformar informação em materiais organizados, originais e úteis, respeitando autoria, propriedade intelectual e boas práticas de produção de conteúdo.",
      "about.education.title": "Educação e aprendizado",
      "about.education.body": "Cursos e materiais são desenvolvidos para apoiar o aprendizado de forma prática, organizada e acessível.",
      "about.technology.eyebrow": "Tecnologia",
      "about.technology.title": "Tecnologia a favor das pessoas",
      "about.technology.body": "A tecnologia faz parte da CorpoPleno como meio para facilitar experiências, organizar conhecimento e aproximar pessoas de ferramentas úteis para aprender, cuidar e evoluir no próprio ritmo.",
      "about.transparency.eyebrow": "Compromisso",
      "about.transparency.title": "Transparência em cada etapa",
      "about.transparency.body": "Apresentamos produtos e conteúdos de acordo com seu estágio real de disponibilidade. Informações, resultados e recursos somente são divulgados quando podem ser apresentados de forma responsável e verificável.",

      "support.hero.eyebrow": "Atendimento",
      "support.hero.title": "Atendimento CorpoPleno",
      "support.hero.lead": "Estamos aqui para ajudar.",
      "support.form.title": "Dúvida sobre o produto",
      "support.form.subtitle": "Como podemos ajudar?",
      "support.form.description":
        "Se você já é nosso cliente, pedimos que se identifique primeiro em sua mensagem informando o e-mail e o telefone utilizados na compra e, logo após, descreva sua dúvida ou solicitação. Se você ainda não é nosso cliente e gostaria de conhecer nossos produtos, podemos tirar suas dúvidas pelo ícone do WhatsApp no canto inferior direito da página.",
      "support.form.placeholder": "Escreva aqui...",
      "support.form.send": "ENVIAR",
      "support.form.pending":
        "Este canal de envio direto está sendo preparado com segurança. Assim que estiver pronto, sua mensagem seguirá diretamente para o atendimento CorpoPleno.",
      "support.form.pending_whatsapp": "Enquanto isso, você também pode falar com a gente pelo WhatsApp.",

      "terms.hero.eyebrow": "Documento legal",
      "terms.hero.title": "Termos de Uso",
      "terms.updated": "Última atualização: 25 de setembro de 2026.",
      "terms.section1.title": "1. Aceitação dos termos",
      "terms.section1.body": "Ao acessar e utilizar o site CorpoPleno, você concorda com estes Termos de Uso. Caso não concorde com algum ponto, recomendamos não utilizar o site até que suas dúvidas sejam esclarecidas pelos canais de atendimento.",
      "terms.section2.title": "2. Sobre os produtos e cursos",
      "terms.section2.body": "Este site apresenta produtos, cursos e materiais organizados por categoria. Itens ainda não disponíveis para aquisição são claramente identificados como tal.",
      "terms.section3.title": "3. Uso permitido",
      "terms.section3.body": "O conteúdo deste site é disponibilizado para uso pessoal e não comercial, salvo autorização expressa da CorpoPleno. É proibido copiar, redistribuir ou modificar o conteúdo sem permissão.",
      "terms.section4.title": "4. Certificados",
      "terms.section4.body": "Quando aplicável, informações sobre certificado, carga horária, requisitos e condições de cada curso serão apresentadas na página específica do curso.",
      "terms.section5.title": "5. Pagamentos",
      "terms.section5.body": "Os pagamentos poderão ser processados por provedores de pagamento contratados pela CorpoPleno, conforme informado no momento da compra. Dados de pagamento poderão ser processados diretamente pelos provedores utilizados na transação, conforme suas próprias políticas de privacidade e segurança.",
      "terms.refund.title": "6. Direito de arrependimento, cancelamento e reembolso",
      "terms.refund.body1": "Nas contratações realizadas por meio eletrônico e nas hipóteses abrangidas pela legislação aplicável — em especial o artigo 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990) e o Decreto nº 7.962/2013 — o consumidor poderá exercer o direito legal de arrependimento dentro do prazo de 7 (sete) dias, contado na forma estabelecida pela legislação aplicável à contratação. Quando esse direito for exercido regularmente dentro do prazo legal, os valores pagos serão restituídos na forma prevista em lei.",
      "terms.refund.body2": "Após o término do prazo legal de arrependimento, não haverá reembolso por simples mudança de vontade ou arrependimento imotivado, ressalvadas as hipóteses em que a legislação assegure ao consumidor outros direitos — como vício, defeito, falha na prestação do serviço, produto ou conteúdo diferente do que foi ofertado, descumprimento da oferta, cobrança indevida, não entrega ou impossibilidade de acesso causada pela CorpoPleno, entre outras hipóteses previstas na legislação aplicável.",
      "terms.refund.body3": "Esta seção aplica-se, no que for cabível, aos produtos e serviços digitais da CorpoPleno, incluindo eBooks, livros digitais, apostilas, materiais educacionais, cursos, mini-apps, ferramentas digitais, assinaturas e demais produtos e serviços digitais que venham a ser oferecidos. Condições específicas de cada produto poderão ser apresentadas na respectiva página de venda, no checkout ou em contrato/licença aplicável, e os direitos previstos em lei prevalecerão sobre qualquer regra comercial interna que com eles seja incompatível.",
      "terms.refund.body4": "O exercício do direito legal de arrependimento dentro do prazo aplicável, o cancelamento de uma assinatura ou serviço recorrente e o pedido de reembolso após o término do prazo de arrependimento são situações distintas, sujeitas a condições próprias. Para assinaturas CorpoPleno, quando disponibilizadas, a possibilidade de cancelamento seguirá as condições específicas apresentadas ao consumidor antes da contratação.",
      "terms.refund.body5": "Regras adicionais sobre cancelamento, arrependimento e reembolso poderão ser detalhadas em política específica, quando publicada, sem prejuízo do disposto nesta seção e na legislação aplicável.",
      "terms.section6.title": "7. Contas e acesso",
      "terms.section6.body": "O acesso a determinadas áreas do site, como a área do cliente, pode exigir a criação de uma conta. Você é responsável por manter a confidencialidade dos seus dados de acesso e por todas as atividades realizadas em sua conta.",
      "terms.section7.title": "8. Limitação de responsabilidade",
      "terms.section7.body": "Fazemos o possível para manter as informações deste site precisas e atualizadas, mas não garantimos ausência total de erros. Em caso de divergência, os canais de atendimento podem ser utilizados para esclarecimentos.",
      "terms.section8.title": "9. Alterações destes termos",
      "terms.section8.body": "Estes Termos de Uso poderão ser atualizados conforme os serviços da CorpoPleno evoluírem. Recomendamos consultá-los periodicamente.",
      "terms.section9.title": "10. Contato",
      "terms.section9.body_pre": "Dúvidas sobre estes termos podem ser enviadas pelos canais listados na página de",
      "terms.section9.body_post": ".",

      "privacy.hero.eyebrow": "Documento legal",
      "privacy.hero.title": "Política de Privacidade",
      "privacy.updated": "Última atualização: 25 de setembro de 2026.",
      "privacy.s1.title": "1. Sobre esta Política",
      "privacy.s1.body": "Esta Política de Privacidade descreve como as informações relacionadas às pessoas que utilizam os serviços da CorpoPleno podem ser tratadas, e quais são os direitos e canais disponíveis para esclarecer dúvidas sobre esse tratamento. O tratamento de dados pessoais relacionado aos serviços CorpoPleno observará a legislação aplicável, incluindo a Lei Geral de Proteção de Dados Pessoais — LGPD (Lei nº 13.709/2018), quando aplicável.",
      "privacy.s2.title": "2. Quais informações podem ser fornecidas",
      "privacy.s2.body": "Você pode nos fornecer informações como nome, e-mail, telefone e outras informações enviadas voluntariamente em nossos canais de atendimento. Quando os recursos de cadastro e conta estiverem efetivamente disponíveis, também poderão ser solicitadas as informações necessárias à criação e à administração da sua conta. Da mesma forma, quando a aquisição de produtos e cursos estiver disponível, poderão ser tratadas as informações necessárias para identificar a compra e liberar o acesso correspondente.",
      "privacy.s3.title": "3. Finalidades do tratamento",
      "privacy.s3.body": "As informações fornecidas podem ser utilizadas, conforme aplicável a cada recurso efetivamente disponível, para: prestar atendimento e responder solicitações; criar e administrar contas de usuário; permitir o acesso a produtos e cursos adquiridos; processar solicitações relacionadas aos serviços da CorpoPleno; comunicar informações relevantes sobre os serviços utilizados; cumprir obrigações legais e regulatórias aplicáveis; proteger a segurança da plataforma; e registrar preferências necessárias à experiência de navegação, como o idioma selecionado.",
      "privacy.s4.title": "4. Cadastro e conta",
      "privacy.s4.body": "Quando o recurso de criação de conta estiver disponível, as informações fornecidas nesse processo serão utilizadas para identificar você, viabilizar o acesso à sua área de cliente e manter o histórico de produtos e cursos associados à sua conta. A CorpoPleno adota práticas técnicas e organizacionais voltadas à proteção dessas informações.",
      "privacy.s5.title": "5. Compras e acesso aos produtos",
      "privacy.s5.body": "Quando a aquisição de produtos e cursos estiver disponível, determinadas informações poderão ser tratadas para identificar a compra, processá-la, liberar o acesso ao conteúdo adquirido e prestar suporte relacionado a essa aquisição. Informações de pagamento, quando aplicável, poderão ser tratadas diretamente pelos prestadores de serviços de pagamento utilizados na transação, conforme as próprias políticas de privacidade e segurança desses prestadores.",
      "privacy.s5.body2_pre": "Pedidos de cancelamento, exercício do direito de arrependimento, reembolso, contestação ou outras solicitações relacionadas a compras poderão exigir o tratamento dos dados pessoais necessários para identificar o titular, localizar a compra, confirmar a contratação, processar a solicitação, registrar o atendimento e cumprir obrigações legais ou regulatórias aplicáveis. As regras comerciais sobre cancelamento, arrependimento e reembolso constam dos",
      "privacy.s5.body2_post": ", e, quando publicada, de política específica sobre o tema.",
      "privacy.s6.title": "6. Atendimento",
      "privacy.s6.body": "As informações enviadas pelos canais oficiais de atendimento da CorpoPleno — como e-mail e WhatsApp — são utilizadas exclusivamente para compreender, registrar e responder à solicitação apresentada.",
      "privacy.s7.title": "7. Cookies, armazenamento e preferências",
      "privacy.s7.body": "A CorpoPleno poderá utilizar tecnologias de armazenamento e preferências do navegador para lembrar configurações como o idioma selecionado, com o objetivo de melhorar a experiência de navegação. Essas informações podem ser removidas a qualquer momento diretamente nas configurações do navegador utilizado.",
      "privacy.s8.title": "8. Compartilhamento com terceiros",
      "privacy.s8.body": "A CorpoPleno não compartilha informações pessoais de forma indiscriminada. Quando necessário para viabilizar os serviços oferecidos, determinadas informações poderão ser tratadas por operadores e prestadores de serviço contratados para finalidades específicas, como processamento de pagamentos, hospedagem, infraestrutura, comunicação ou suporte tecnológico — sempre limitadas ao necessário para a prestação do serviço correspondente e sujeitas às respectivas obrigações de proteção de dados.",
      "privacy.s9.title": "9. Segurança",
      "privacy.s9.body": "A CorpoPleno adota medidas técnicas e organizacionais adequadas ao contexto e à natureza das informações tratadas, buscando proteger os dados contra acessos não autorizados, perda, alteração, divulgação ou uso indevido. Nenhum sistema, no entanto, está livre de riscos, e a CorpoPleno trabalha continuamente para aprimorar essas medidas de proteção.",
      "privacy.s10.title": "10. Retenção e eliminação de dados",
      "privacy.s10.body": "As informações pessoais são mantidas pelo período necessário para cumprir as finalidades descritas nesta Política, observadas eventuais obrigações legais e regulatórias aplicáveis, o exercício regular de direitos e outras hipóteses legítimas previstas em lei. Encerradas essas finalidades, as informações são eliminadas ou anonimizadas, conforme apropriado.",
      "privacy.s11.title": "11. Direitos do titular",
      "privacy.s11.body_pre": "Nos termos da legislação aplicável, você pode solicitar a confirmação da existência de tratamento, o acesso, a correção, a atualização, a eliminação ou a portabilidade dos seus dados pessoais, bem como obter informações sobre o compartilhamento realizado e, quando aplicável, revogar consentimentos previamente fornecidos. Essas solicitações podem ser feitas pelos canais oficiais de",
      "privacy.s11.body_post": ", e serão respondidas dentro de um prazo razoável, conforme a natureza de cada solicitação.",
      "privacy.s12.title": "12. Consentimento e preferências",
      "privacy.s12.body": "Quando determinada atividade de tratamento depender do seu consentimento, este poderá ser revogado a qualquer momento, nos termos da legislação aplicável, sem prejuízo da licitude do tratamento realizado antes da revogação. Nem todas as atividades descritas nesta Política dependem de consentimento, podendo se fundamentar em outras hipóteses legais aplicáveis.",
      "privacy.s13.title": "13. Dados de crianças e adolescentes",
      "privacy.s13.body": "Quando um serviço ou conteúdo envolver crianças ou adolescentes, o tratamento de dados pessoais observará as exigências legais aplicáveis e, quando necessário, as medidas de consentimento ou participação do responsável legal. Esta Política será atualizada previamente à disponibilização de qualquer recurso direcionado a esse público.",
      "privacy.s14.title": "14. Transferências e serviços internacionais",
      "privacy.s14.body": "Caso determinados serviços envolvam prestadores ou infraestrutura localizados fora do país, a CorpoPleno buscará adotar salvaguardas compatíveis com a legislação de proteção de dados aplicável a esse tipo de tratamento.",
      "privacy.s15.title": "15. Atualizações desta Política",
      "privacy.s15.body": "Esta Política de Privacidade poderá ser atualizada para refletir mudanças nos serviços oferecidos, na legislação aplicável ou nas práticas adotadas pela CorpoPleno. Recomendamos a consulta periódica desta página.",
      "privacy.s16.title": "16. Canais para exercer direitos e tirar dúvidas",
      "privacy.s16.body": "Dúvidas sobre esta Política ou solicitações relacionadas aos seus dados pessoais podem ser enviadas para o e-mail corpoplenoresultadoreal@gmail.com ou pelo WhatsApp oficial da CorpoPleno.",
      "privacy.section1.title": "1. Quais dados podem ser fornecidos",
      "privacy.section1.body": "Você pode nos fornecer dados como nome, e-mail, telefone e outras informações necessárias ao usar formulários de cadastro, atendimento ou compra disponíveis no site.",
      "privacy.section2.title": "2. Finalidade da utilização dos dados",
      "privacy.section2.body": "Os dados fornecidos são usados exclusivamente para viabilizar os serviços solicitados, como criar e gerenciar sua conta, responder ao atendimento e liberar o acesso aos produtos e cursos adquiridos.",
      "privacy.section3.title": "3. Cadastro e conta",
      "privacy.section3.body": "Ao criar uma conta CorpoPleno, os dados informados são usados para identificar você, dar acesso à sua área de cliente e manter o histórico dos produtos e cursos vinculados à sua conta.",
      "privacy.section4.title": "4. Atendimento",
      "privacy.section4.body": "As informações enviadas pelos canais de atendimento são usadas somente para compreender e responder à sua solicitação.",
      "privacy.section5.title": "5. Compras e acesso aos produtos",
      "privacy.section5.body": "Os dados necessários para processar uma compra e liberar o acesso ao produto ou curso adquirido serão tratados apenas para essa finalidade.",
      "privacy.section6.title": "6. Segurança",
      "privacy.section6.body": "A CorpoPleno adota medidas técnicas e organizacionais razoáveis para proteger os dados pessoais tratados, buscando prevenir acessos não autorizados, perda ou uso indevido das informações.",
      "privacy.section7.title": "7. Cookies e preferências",
      "privacy.section7.body": "A CorpoPleno poderá armazenar determinadas preferências do usuário, como o idioma selecionado, para melhorar a experiência de navegação. Você pode limpar essas preferências a qualquer momento nas configurações do seu navegador.",
      "privacy.section8.title": "8. Compartilhamento de dados",
      "privacy.section8.body": "Os dados pessoais poderão ser compartilhados com terceiros somente quando necessário para viabilizar os serviços oferecidos, como provedores de pagamento e de hospedagem, sempre sujeitos às respectivas políticas de privacidade e segurança.",
      "privacy.section9.title": "9. Direitos do titular",
      "privacy.section9.body_pre": "Você pode solicitar a confirmação, o acesso, a correção ou a exclusão dos seus dados pessoais, bem como retirar consentimentos anteriormente fornecidos, entrando em contato pelos canais da página de",
      "privacy.section9.body_post": ".",
      "privacy.section10.title": "10. Atualização desta política",
      "privacy.section10.body": "Esta Política de Privacidade poderá ser atualizada conforme os serviços da CorpoPleno evoluírem. Recomendamos consultá-la periodicamente.",

      "legal.pending_review":
        "Documento sujeito à revisão jurídica e atualização antes da operação definitiva.",
    },

    "pt-PT": {
      "catalog.empty_state": "Estamos a preparar novidades para si.",
      skip_link: "Saltar para o conteúdo principal",
      lang_label: "Selecionar idioma",

      "nav.home": "Início",
      "nav.products": "Produtos",
      "nav.courses": "Cursos",
      "nav.about": "Sobre",
      "nav.support": "Apoio",
      "nav.account": "A Minha Área",
      "nav.login": "Entrar",
      "login.hero.eyebrow": "Acesso à conta",
      "login.hero.title": "Entrar",
      "login.hero.lead": "Aceda à sua conta CorpoPleno para ver os seus produtos e cursos.",
      "login.form.email_label": "E-mail",
      "login.form.password_label": "Palavra-passe",
      "login.form.submit": "Entrar",
      "login.form.forgot": "Esqueci-me da palavra-passe",
      "login.form.no_account": "Ainda não tenho conta —",
      "login.form.create_account_link": "Criar conta",
      "auth.form.pending": "O acesso à sua conta está a ser preparado com segurança. Em breve poderá entrar de verdade.",
      "signup.hero.eyebrow": "Nova conta",
      "signup.hero.title": "Criar a sua conta",
      "signup.hero.lead": "Preencha os seus dados para criar a sua conta CorpoPleno.",
      "signup.form.name_label": "Nome",
      "signup.form.email_label": "E-mail",
      "signup.form.phone_label": "Telemóvel",
      "signup.form.password_label": "Palavra-passe",
      "signup.form.confirm_password_label": "Confirmar palavra-passe",
      "signup.form.terms_prefix": "Li e aceito os",
      "signup.form.terms_middle": "e a",
      "signup.form.submit": "Criar conta",
      "signup.form.have_account": "Já tenho conta —",
      "signup.form.login_link": "Entrar",
      "account.hero.title": "A Minha Área",
      "account.redirect.message": "Para aceder à sua área, precisa de entrar na sua conta.",
      "account.redirect.cta": "Entrar",
      "nav.terms": "Termos",
      "nav.privacy": "Privacidade",
      "nav.aria_label": "Navegação principal",
      "nav_toggle.open_label": "Abrir menu",

      "brand.slogan": "Inteligente, resultado real",

      "common.in_preparation": "Em preparação",
      "common.available": "Disponível",
      "common.bonus_tag": "Bónus",
      "common.checkout_button": "Ver oferta",
      "common.checkout_pending": "Checkout em configuração",
      "common.learn_more": "Saber mais",
      "common.price_unavailable": "Preço indisponível neste mercado.",
      "common.partial_notice":
        "Esta página ainda está totalmente disponível apenas em português do Brasil. A tradução completa deste conteúdo está em preparação.",
      "whatsapp.float_label": "Falar através do WhatsApp com a CorpoPleno",
      "whatsapp.initial_message":
        "Olá! Vim através do site da CorpoPleno e gostaria de apoio.",
      "account.pending_toast":
        "A área de cliente está em preparação. O início de sessão real será ligado futuramente a um backend seguro — não existe qualquer autenticação nesta versão.",

      "footer.about.title": "CorpoPleno",
      "footer.about.body":
        "Educação, tecnologia e cuidado reunidos numa experiência CorpoPleno simples, acessível e responsável.",
      "footer.about.cnpj": "Empresa brasileira · CNPJ: 68.987.084/0001-32",
      "footer.about.location": "São Paulo, Brasil",
      "footer.links.title": "Navegação",
      "footer.legal.title": "Legal",
      "footer.contact.title": "Contacto",
      "footer.contact.email_label": "E-mail",
      "footer.contact.whatsapp_label": "WhatsApp",
      "footer.contact.whatsapp_link_label": "Falar através do WhatsApp",
      "footer.contact.pending": "Canal em configuração",

      "legal.company_id.title": "Identificação da empresa",
      "legal.company_id.brand_label": "Marca",
      "legal.company_id.cnpj_label": "CNPJ (registo empresarial brasileiro)",
      "legal.company_id.location_label": "Localização pública",
      "legal.company_id.site_label": "Site",
      "legal.company_id.review_note":
        "Informações jurídicas adicionais (como a denominação social e a morada fiscal completa) ainda serão confirmadas em revisão jurídica/empresarial antes da operação definitiva.",
      "footer.language.title": "Idioma",
      "footer.copyright":
        "© 2026 CorpoPleno. Todos os direitos reservados.",

      "home.hero.eyebrow": "CorpoPleno",
      "home.hero.title": "Uma base clara para uma vida mais plena",
      "home.hero.slogan": "Inteligente, resultado real",
      "home.hero.lead":
        "Reunimos produtos, cursos e materiais organizados com metodologia, tecnologia e revisão de conteúdo — para avançar com clareza, ao seu ritmo.",
      "home.hero.cta_primary": "Explorar produtos",
      "home.hero.cta_secondary": "Conhecer a CorpoPleno",
      "home.hero.chip3": "Tecnologia",
      "home.hero.chip4": "Confiança",

      "characters.eyebrow": "A nossa equipa",
      "characters.title": "Personagens CorpoPleno",
      "characters.ester.name": "Ester",
      "characters.ester.desc": "Guia a jornada CorpoPleno com atenção e bom humor.",
      "characters.ester.hero_alt": "Ester a sorrir diante do portátil, com a Mimi (gata), o Ping (cão) e o Pipo (papagaio) por perto, num ambiente claro e alegre",
      "characters.mimi.name": "Mimi",
      "characters.mimi.desc": "Curiosa e observadora, sempre atenta aos detalhes.",
      "characters.ping.name": "Ping",
      "characters.ping.desc": "Companheiro leal, com energia para o dia a dia.",
      "characters.pipo.name": "Pipo",
      "characters.pipo.desc": "Alegre e comunicativo, traz leveza à conversa.",

      "home.intro.eyebrow": "Conheça a CorpoPleno",
      "home.intro.title": "O que é a CorpoPleno",
      "home.intro.body":
        "A CorpoPleno organiza conhecimento e ferramentas com propósito, metodologia própria e compromisso contínuo com a qualidade — unindo educação, tecnologia e cuidado.",
      "home.intro.point1.title": "Propósito claro",
      "home.intro.point1.desc":
        "Ajudar as pessoas a organizarem a saúde, os estudos e a rotina com informação fiável.",
      "home.intro.point2.title": "Metodologia própria",
      "home.intro.point2.desc":
        "Conteúdos estruturados em etapas, com revisão antes da publicação.",
      "home.intro.point3.title": "Tecnologia ao serviço das pessoas",
      "home.intro.point3.desc":
        "Ferramentas simples e diretas, sem complicar o que pode ser fácil.",
      "home.intro.point4.title": "Organização e revisão contínua",
      "home.intro.point4.desc":
        "Cada material passa por revisão de conteúdo antes de lhe chegar.",
      "home.intro.cta": "Ler mais sobre a CorpoPleno",

      "home.explore.eyebrow": "Explorar",
      "home.explore.title": "Explore a CorpoPleno",
      "home.explore.lead": "Escolha por onde começar.",
      "home.explore.produtos.title": "Produtos",
      "home.explore.produtos.desc": "Materiais, autocuidado e soluções organizadas por categoria.",
      "home.explore.produtos.cta": "Conheça os produtos CorpoPleno →",
      "home.explore.cursos.title": "Cursos",
      "home.explore.cursos.desc": "Formação estruturada, do idioma ao curso técnico.",
      "home.explore.cursos.cta": "Conheça os cursos CorpoPleno →",
      "home.explore.miniapps.title": "Mini Apps",
      "home.explore.miniapps.desc": "Ferramentas interativas para o seu dia a dia.",
      "home.explore.miniapps.cta": "Explorar Mini Apps →",
      "home.explore.atendimento.title": "Apoio ao Cliente",
      "home.explore.atendimento.desc": "Precisa de ajuda? Encontre o canal ideal para o seu pedido.",
      "home.explore.atendimento.cta": "Contactar o apoio ao cliente →",


      "home.support.eyebrow": "Aqui para ajudar",
      "home.support.title": "Apoio ao Cliente CorpoPleno",
      "home.support.desc": "Precisa de ajuda? Encontre o canal ideal para o seu pedido.",
      "home.support.cta": "Contactar o apoio ao cliente",

      "home.faq.eyebrow": "Dúvidas",
      "home.faq.title": "Perguntas frequentes",
      "home.faq.q1": "Como recebo os meus produtos depois da compra?",
      "home.faq.a1":
        "Assim que a compra for confirmada, receberá as instruções de acesso por e-mail. Atualmente nenhum produto está publicado — isso será ativado assim que o catálogo for disponibilizado.",
      "home.faq.q2": "Como funciona o apoio ao cliente?",
      "home.faq.a2":
        "Conte a sua dúvida na página de Apoio — a CorpoPleno responde a partir daí.",
      "home.faq.q3": "Como funciona o cancelamento ou reembolso?",
      "home.faq.a3":
        "Abra o pedido na página de Apoio; poderá ser necessária uma verificação adicional antes da confirmação.",
      "home.faq.q4": "Como acedo à minha área?",
      "home.faq.a4":
        "Utilize o botão \"A Minha Área\" no topo do site. O início de sessão real será ligado brevemente.",

      "home.cta.title": "Conheça o universo CorpoPleno",
      "home.cta.body": "Explore produtos, cursos e experiências desenvolvidas para acompanhar diferentes momentos da sua jornada.",
      "home.cta.button": "Explorar a CorpoPleno",


      "products.hero.eyebrow": "Catálogo CorpoPleno",
      "products.hero.title": "Produtos",
      "products.hero.lead":
        "Categorias organizadas para receber os produtos CorpoPleno. Os itens ainda não lançados aparecem como \"Em preparação\" — nada aqui está disponível para compra até o checkout oficial estar ligado.",
      "products.notice":
        "Ainda não foi configurado nenhum link de checkout. Os botões de compra abaixo estão desativados de propósito.",
      "products.category_empty":
        "Ainda não há nenhum produto aprovado para exibição pública nesta categoria.",
      "products.filter.all": "Todas as categorias",
      "products.filter.ebooks": "eBooks",
      "products.filter.livros": "Livros",
      "products.filter.miniapps": "Mini apps",
      "products.filter.autocuidado": "Autocuidado",
      "products.filter.natural": "CorpoPleno Natural",
      "products.filter.capilares": "Materiais capilares",
      "products.filter.nutricao": "Nutrição",

      "courses.hero.eyebrow": "Formação CorpoPleno",
      "courses.hero.title": "Cursos",
      "courses.hero.lead":
        "Área preparada para os cursos CorpoPleno. Informações sobre carga horária, conteúdo e certificação de cada curso serão apresentadas na página específica antes da inscrição.",
      "courses.notice":
        "Ainda não há cursos publicados.",
      "courses.filter.all": "Todas as categorias",
      "courses.filter.idiomas": "Idiomas",
      "courses.filter.empresarial": "Empresarial",
      "courses.filter.tecnicos": "Técnicos",
      "courses.filter.curtos": "Cursos curtos",
      "courses.filter.libras": "Língua Gestual (bónus)",
      "courses.category_empty": "Ainda não há nenhum curso aprovado para exibição pública nesta categoria.",
      "courses.category.idiomas.body":
        "Os cursos de idiomas estão em planeamento, incluindo turmas principais com uma carga horária estimada de 12 meses. Ainda não foi aprovado nenhum curso de idioma para lançamento público — nomes, datas e valores serão anunciados após aprovação final.",
      "courses.libras.title": "Língua Gestual — conteúdo bónus",
      "courses.libras.body":
        "A Língua Gestual não é vendida como curso independente. É um conteúdo bónus, disponibilizado a quem comprar um curso CorpoPleno elegível — a disponibilização dependerá do registo real da compra assim que os cursos estiverem publicados.",

      "about.hero.eyebrow": "Institucional",
      "about.hero.title": "O que é a CorpoPleno",
      "about.hero.lead": "A CorpoPleno reúne conhecimento, educação, tecnologia e cuidado em soluções criadas para tornar a aprendizagem e o dia a dia mais claros, organizados e acessíveis.",
      "about.hero.photo_alt": "Ester a sorrir diante do portátil, com a Mimi (gata), o Ping (cão) e o Pipo (papagaio) por perto",
      "about.essence.eyebrow": "Quem somos",
      "about.essence.title": "A nossa essência",
      "about.essence.body": "A CorpoPleno nasceu para transformar conhecimento em experiências mais simples de compreender, aplicar e acompanhar. Organizamos conteúdos, ferramentas e soluções com clareza, responsabilidade e atenção à experiência de cada pessoa.",
      "about.pillars.eyebrow": "O que nos guia",
      "about.pillars.title": "Pilares CorpoPleno",
      "about.pillars.item1.title": "Conhecimento com propósito",
      "about.pillars.item1.body": "Conteúdos pensados para ajudar as pessoas a aprender, a organizar-se e a tomar decisões com mais clareza.",
      "about.pillars.item2.title": "Qualidade e responsabilidade",
      "about.pillars.item2.body": "Procuramos apresentar informações claras, consistentes e sustentadas por referências adequadas ao tema.",
      "about.pillars.item3.title": "Tecnologia que simplifica",
      "about.pillars.item3.body": "Utilizamos tecnologia para tornar conteúdos e ferramentas mais acessíveis, intuitivos e fáceis de utilizar.",
      "about.pillars.item4.title": "Evolução contínua",
      "about.pillars.item4.body": "Produtos, materiais e experiências CorpoPleno são desenvolvidos e aperfeiçoados continuamente, respeitando cada etapa antes da sua disponibilização.",
      "about.content.eyebrow": "Como produzimos",
      "about.content.title": "Conteúdo desenvolvido com responsabilidade",
      "about.content.body": "Os conteúdos CorpoPleno são estruturados a partir de pesquisa, fontes fiáveis, documentos oficiais e referências bibliográficas quando aplicável ao tema. O compromisso é transformar informação em materiais organizados, originais e úteis, respeitando a autoria, a propriedade intelectual e as boas práticas de produção de conteúdo.",
      "about.education.title": "Educação e aprendizagem",
      "about.education.body": "Cursos e materiais são desenvolvidos para apoiar a aprendizagem de forma prática, organizada e acessível.",
      "about.technology.eyebrow": "Tecnologia",
      "about.technology.title": "Tecnologia a favor das pessoas",
      "about.technology.body": "A tecnologia faz parte da CorpoPleno como meio para facilitar experiências, organizar conhecimento e aproximar as pessoas de ferramentas úteis para aprender, cuidar e evoluir ao seu próprio ritmo.",
      "about.transparency.eyebrow": "Compromisso",
      "about.transparency.title": "Transparência em cada etapa",
      "about.transparency.body": "Apresentamos produtos e conteúdos de acordo com o seu estágio real de disponibilidade. Informações, resultados e recursos só são divulgados quando podem ser apresentados de forma responsável e verificável.",

      "support.hero.eyebrow": "Apoio",
      "support.hero.title": "Apoio ao Cliente CorpoPleno",
      "support.hero.lead": "Estamos aqui para ajudar.",
      "support.form.title": "Dúvida sobre o produto",
      "support.form.subtitle": "Como podemos ajudar?",
      "support.form.description":
        "Se já é nosso cliente, pedimos que se identifique primeiro na mensagem, indicando o e-mail e o telefone utilizados na compra e, de seguida, descreva a sua dúvida ou pedido. Se ainda não é nosso cliente e gostaria de conhecer os nossos produtos, pode esclarecer as suas dúvidas através do ícone do WhatsApp no canto inferior direito da página.",
      "support.form.placeholder": "Escreva aqui...",
      "support.form.send": "ENVIAR",
      "support.form.pending":
        "Este canal de envio direto está a ser preparado com segurança. Assim que estiver pronto, a sua mensagem seguirá diretamente para o apoio ao cliente CorpoPleno.",
      "support.form.pending_whatsapp": "Entretanto, também pode falar connosco pelo WhatsApp.",

      "terms.hero.eyebrow": "Documento legal",
      "terms.hero.title": "Termos de Utilização",
      "terms.updated": "Última atualização: 25 de setembro de 2026.",
      "terms.section1.title": "1. Aceitação dos termos",
      "terms.section1.body": "Ao aceder e utilizar o site CorpoPleno, aceita estes Termos de Uso. Caso não concorde com algum ponto, recomendamos que não utilize o site até que as suas dúvidas sejam esclarecidas pelos canais de apoio ao cliente.",
      "terms.section2.title": "2. Sobre os produtos e cursos",
      "terms.section2.body": "Este site apresenta produtos, cursos e materiais organizados por categoria. Os itens ainda não disponíveis para aquisição são claramente identificados como tal.",
      "terms.section3.title": "3. Utilização permitida",
      "terms.section3.body": "O conteúdo deste site é disponibilizado para uso pessoal e não comercial, salvo autorização expressa da CorpoPleno. É proibido copiar, redistribuir ou modificar o conteúdo sem permissão.",
      "terms.section4.title": "4. Certificados",
      "terms.section4.body": "Quando aplicável, as informações sobre certificado, carga horária, requisitos e condições de cada curso serão apresentadas na página específica do curso.",
      "terms.section5.title": "5. Pagamentos",
      "terms.section5.body": "Os pagamentos poderão ser processados por fornecedores de pagamento contratados pela CorpoPleno, conforme indicado no momento da compra. Os dados de pagamento poderão ser processados diretamente pelos fornecedores utilizados na transação, de acordo com as suas próprias políticas de privacidade e segurança.",
      "terms.refund.title": "6. Direito de arrependimento, cancelamento e reembolso",
      "terms.refund.body1": "Nas contratações realizadas por meio eletrónico, e nas operações realizadas no Brasil, aplica-se a legislação brasileira quando cabível — nomeadamente o artigo 49.º do Código de Defesa do Consumidor (Lei n.º 8.078/1990) e o Decreto n.º 7.962/2013 —, segundo a qual o consumidor pode exercer o direito legal de arrependimento no prazo de 7 (sete) dias, contado nos termos da legislação aplicável à contratação. Quando esse direito for exercido regularmente dentro do prazo legal, os valores pagos serão devolvidos nos termos previstos na legislação aplicável.",
      "terms.refund.body2": "Terminado o prazo legal de arrependimento, não haverá reembolso por simples mudança de vontade ou arrependimento sem justificação, ressalvadas as situações em que a legislação aplicável assegure ao consumidor outros direitos — como vício, defeito, falha na prestação do serviço, produto ou conteúdo diferente do que foi oferecido, incumprimento da oferta, cobrança indevida, não entrega ou impossibilidade de acesso causada pela CorpoPleno, entre outras hipóteses previstas na legislação aplicável.",
      "terms.refund.body3": "Esta secção aplica-se, no que for cabível, aos produtos e serviços digitais da CorpoPleno, incluindo eBooks, livros digitais, apostilas, materiais educativos, cursos, mini-apps, ferramentas digitais, subscrições e demais produtos e serviços digitais que venham a ser oferecidos. As condições específicas de cada produto poderão ser apresentadas na respetiva página de venda, no checkout ou em contrato/licença aplicável, prevalecendo sempre os direitos previstos na lei sobre qualquer regra comercial interna incompatível.",
      "terms.refund.body4": "O exercício do direito legal de arrependimento dentro do prazo aplicável, o cancelamento de uma subscrição ou serviço recorrente e o pedido de reembolso após o término do prazo de arrependimento são situações distintas, sujeitas a condições próprias. Para subscrições CorpoPleno, quando disponibilizadas, a possibilidade de cancelamento seguirá as condições específicas apresentadas ao consumidor antes da contratação.",
      "terms.refund.body5": "Regras adicionais sobre cancelamento, arrependimento e reembolso poderão ser detalhadas em política específica, quando publicada, sem prejuízo do disposto nesta secção e na legislação aplicável.",
      "terms.section6.title": "7. Contas e acesso",
      "terms.section6.body": "O acesso a determinadas áreas do site, como a área de cliente, pode exigir a criação de uma conta. É responsável por manter a confidencialidade dos seus dados de acesso e por todas as atividades realizadas na sua conta.",
      "terms.section7.title": "8. Limitação de responsabilidade",
      "terms.section7.body": "Fazemos o possível para manter as informações deste site precisas e atualizadas, mas não garantimos a ausência total de erros. Em caso de divergência, os canais de apoio ao cliente podem ser utilizados para esclarecimentos.",
      "terms.section8.title": "9. Alterações a estes termos",
      "terms.section8.body": "Estes Termos de Uso poderão ser atualizados conforme os serviços da CorpoPleno evoluírem. Recomendamos a sua consulta periódica.",
      "terms.section9.title": "10. Contacto",
      "terms.section9.body_pre": "Dúvidas sobre estes termos podem ser enviadas pelos canais indicados na página de",
      "terms.section9.body_post": ".",

      "privacy.hero.eyebrow": "Documento legal",
      "privacy.hero.title": "Política de Privacidade",
      "privacy.updated": "Última atualização: 25 de setembro de 2026.",
      "privacy.s1.title": "1. Sobre esta Política",
      "privacy.s1.body": "Esta Política de Privacidade descreve como as informações relacionadas às pessoas que utilizam os serviços da CorpoPleno podem ser tratadas, e quais são os direitos e canais disponíveis para esclarecer dúvidas sobre esse tratamento. O tratamento de dados pessoais relacionado aos serviços CorpoPleno respeitará a legislação aplicável, incluindo, na operação brasileira, a Lei Geral de Proteção de Dados Pessoais — LGPD (Lei n.º 13.709/2018), quando aplicável.",
      "privacy.s2.title": "2. Que informações podem ser fornecidas",
      "privacy.s2.body": "Pode fornecer-nos informações como nome, e-mail, telemóvel e outras informações enviadas voluntariamente nos nossos canais de apoio ao cliente. Quando as funcionalidades de registo e conta estiverem efetivamente disponíveis, também poderão ser solicitadas as informações necessárias à criação e à gestão da sua conta. Do mesmo modo, quando a aquisição de produtos e cursos estiver disponível, poderão ser tratadas as informações necessárias para identificar a compra e libertar o acesso correspondente.",
      "privacy.s3.title": "3. Finalidades do tratamento",
      "privacy.s3.body": "As informações fornecidas podem ser utilizadas, conforme aplicável a cada funcionalidade efetivamente disponível, para: prestar apoio ao cliente e responder a pedidos; criar e gerir contas de utilizador; permitir o acesso a produtos e cursos adquiridos; processar pedidos relacionados com os serviços da CorpoPleno; comunicar informações relevantes sobre os serviços utilizados; cumprir obrigações legais e regulamentares aplicáveis; proteger a segurança da plataforma; e guardar preferências necessárias à experiência de navegação, como o idioma selecionado.",
      "privacy.s4.title": "4. Registo e conta",
      "privacy.s4.body": "Quando a funcionalidade de criação de conta estiver disponível, as informações fornecidas nesse processo serão utilizadas para o identificar, viabilizar o acesso à sua área de cliente e manter o histórico de produtos e cursos associados à sua conta. A CorpoPleno adota práticas técnicas e organizacionais orientadas para a proteção dessas informações.",
      "privacy.s5.title": "5. Compras e acesso aos produtos",
      "privacy.s5.body": "Quando a aquisição de produtos e cursos estiver disponível, determinadas informações poderão ser tratadas para identificar a compra, processá-la, libertar o acesso ao conteúdo adquirido e prestar apoio relacionado com essa aquisição. As informações de pagamento, quando aplicável, poderão ser tratadas diretamente pelos prestadores de serviços de pagamento utilizados na transação, de acordo com as próprias políticas de privacidade e segurança desses prestadores.",
      "privacy.s5.body2_pre": "Os pedidos de cancelamento, exercício do direito de arrependimento, reembolso, reclamação ou outros pedidos relacionados com compras poderão exigir o tratamento dos dados pessoais necessários para identificar o titular, localizar a compra, confirmar a contratação, processar o pedido, registar o atendimento e cumprir obrigações legais ou regulamentares aplicáveis. As regras comerciais sobre cancelamento, arrependimento e reembolso constam dos",
      "privacy.s5.body2_post": ", e, quando publicada, de política específica sobre o tema.",
      "privacy.s6.title": "6. Apoio ao cliente",
      "privacy.s6.body": "As informações enviadas pelos canais oficiais de apoio ao cliente da CorpoPleno — como e-mail e WhatsApp — são utilizadas exclusivamente para compreender, registar e responder ao pedido apresentado.",
      "privacy.s7.title": "7. Cookies, armazenamento e preferências",
      "privacy.s7.body": "A CorpoPleno poderá utilizar tecnologias de armazenamento e preferências do navegador para guardar configurações como o idioma selecionado, com o objetivo de melhorar a experiência de navegação. Essas informações podem ser removidas a qualquer momento diretamente nas definições do navegador utilizado.",
      "privacy.s8.title": "8. Partilha com terceiros",
      "privacy.s8.body": "A CorpoPleno não partilha informações pessoais de forma indiscriminada. Quando necessário para viabilizar os serviços oferecidos, determinadas informações poderão ser tratadas por operadores e prestadores de serviço contratados para finalidades específicas, como processamento de pagamentos, alojamento, infraestrutura, comunicação ou suporte tecnológico — sempre limitadas ao necessário para a prestação do serviço correspondente e sujeitas às respetivas obrigações de proteção de dados.",
      "privacy.s9.title": "9. Segurança",
      "privacy.s9.body": "A CorpoPleno adota medidas técnicas e organizacionais adequadas ao contexto e à natureza das informações tratadas, procurando proteger os dados contra acessos não autorizados, perda, alteração, divulgação ou utilização indevida. Nenhum sistema, no entanto, está isento de riscos, e a CorpoPleno trabalha continuamente para aperfeiçoar estas medidas de proteção.",
      "privacy.s10.title": "10. Conservação e eliminação de dados",
      "privacy.s10.body": "As informações pessoais são conservadas pelo período necessário para cumprir as finalidades descritas nesta Política, observadas eventuais obrigações legais e regulamentares aplicáveis, o exercício regular de direitos e outras hipóteses legítimas previstas na lei. Terminadas essas finalidades, as informações são eliminadas ou anonimizadas, conforme apropriado.",
      "privacy.s11.title": "11. Direitos do titular",
      "privacy.s11.body_pre": "Nos termos da legislação aplicável, pode solicitar a confirmação da existência de tratamento, o acesso, a correção, a atualização, a eliminação ou a portabilidade dos seus dados pessoais, bem como obter informações sobre a partilha realizada e, quando aplicável, retirar consentimentos anteriormente dados. Estes pedidos podem ser feitos pelos canais oficiais de",
      "privacy.s11.body_post": ", e serão respondidos num prazo razoável, consoante a natureza de cada pedido.",
      "privacy.s12.title": "12. Consentimento e preferências",
      "privacy.s12.body": "Quando determinada atividade de tratamento depender do seu consentimento, este poderá ser retirado a qualquer momento, nos termos da legislação aplicável, sem prejuízo da licitude do tratamento realizado antes da retirada. Nem todas as atividades descritas nesta Política dependem de consentimento, podendo basear-se noutras hipóteses legais aplicáveis.",
      "privacy.s13.title": "13. Dados de crianças e adolescentes",
      "privacy.s13.body": "Quando um serviço ou conteúdo envolver crianças ou adolescentes, o tratamento de dados pessoais respeitará as exigências legais aplicáveis e, quando necessário, as medidas de consentimento ou participação do responsável legal. Esta Política será atualizada antes da disponibilização de qualquer funcionalidade direcionada a esse público.",
      "privacy.s14.title": "14. Transferências e serviços internacionais",
      "privacy.s14.body": "Caso determinados serviços envolvam prestadores ou infraestrutura localizados fora do país, a CorpoPleno procurará adotar salvaguardas compatíveis com a legislação de proteção de dados aplicável a esse tipo de tratamento.",
      "privacy.s15.title": "15. Atualizações a esta Política",
      "privacy.s15.body": "Esta Política de Privacidade poderá ser atualizada para refletir alterações nos serviços oferecidos, na legislação aplicável ou nas práticas adotadas pela CorpoPleno. Recomendamos a consulta periódica desta página.",
      "privacy.s16.title": "16. Canais para exercer direitos e esclarecer dúvidas",
      "privacy.s16.body": "Dúvidas sobre esta Política ou pedidos relacionados com os seus dados pessoais podem ser enviados para o e-mail corpoplenoresultadoreal@gmail.com ou pelo WhatsApp oficial da CorpoPleno.",
      "privacy.section1.title": "1. Que dados podem ser fornecidos",
      "privacy.section1.body": "Pode fornecer-nos dados como nome, e-mail, telemóvel e outras informações necessárias ao utilizar formulários de registo, apoio ao cliente ou compra disponíveis no site.",
      "privacy.section2.title": "2. Finalidade da utilização dos dados",
      "privacy.section2.body": "Os dados fornecidos são utilizados exclusivamente para viabilizar os serviços solicitados, como criar e gerir a sua conta, responder ao apoio ao cliente e libertar o acesso aos produtos e cursos adquiridos.",
      "privacy.section3.title": "3. Registo e conta",
      "privacy.section3.body": "Ao criar uma conta CorpoPleno, os dados indicados são utilizados para o identificar, dar acesso à sua área de cliente e manter o histórico dos produtos e cursos associados à sua conta.",
      "privacy.section4.title": "4. Apoio ao cliente",
      "privacy.section4.body": "As informações enviadas pelos canais de apoio ao cliente são utilizadas apenas para compreender e responder ao seu pedido.",
      "privacy.section5.title": "5. Compras e acesso aos produtos",
      "privacy.section5.body": "Os dados necessários para processar uma compra e libertar o acesso ao produto ou curso adquirido serão tratados apenas para essa finalidade.",
      "privacy.section6.title": "6. Segurança",
      "privacy.section6.body": "A CorpoPleno adota medidas técnicas e organizacionais razoáveis para proteger os dados pessoais tratados, procurando prevenir acessos não autorizados, perda ou utilização indevida das informações.",
      "privacy.section7.title": "7. Cookies e preferências",
      "privacy.section7.body": "A CorpoPleno poderá guardar determinadas preferências do utilizador, como o idioma selecionado, para melhorar a experiência de navegação. Pode limpar essas preferências a qualquer momento nas definições do seu navegador.",
      "privacy.section8.title": "8. Partilha de dados",
      "privacy.section8.body": "Os dados pessoais poderão ser partilhados com terceiros apenas quando necessário para viabilizar os serviços oferecidos, como fornecedores de pagamento e de alojamento, sempre sujeitos às respetivas políticas de privacidade e segurança.",
      "privacy.section9.title": "9. Direitos do titular",
      "privacy.section9.body_pre": "Pode solicitar a confirmação, o acesso, a correção ou a eliminação dos seus dados pessoais, bem como retirar consentimentos anteriormente dados, contactando-nos pelos canais da página de",
      "privacy.section9.body_post": ".",
      "privacy.section10.title": "10. Atualização desta política",
      "privacy.section10.body": "Esta Política de Privacidade poderá ser atualizada conforme os serviços da CorpoPleno evoluírem. Recomendamos a sua consulta periódica.",

      "legal.pending_review":
        "Documento sujeito a revisão jurídica e atualização antes da operação definitiva.",
    },

    "en-US": {
      "catalog.empty_state": "New arrivals are being prepared for you.",
      skip_link: "Skip to main content",
      lang_label: "Select language",

      "nav.home": "Home",
      "nav.products": "Products",
      "nav.courses": "Courses",
      "nav.about": "About",
      "nav.support": "Support",
      "nav.account": "My account",
      "nav.login": "Sign in",
      "login.hero.eyebrow": "Account access",
      "login.hero.title": "Sign in",
      "login.hero.lead": "Sign in to your CorpoPleno account to see your products and courses.",
      "login.form.email_label": "Email",
      "login.form.password_label": "Password",
      "login.form.submit": "Sign in",
      "login.form.forgot": "Forgot my password",
      "login.form.no_account": "Don't have an account yet —",
      "login.form.create_account_link": "Create account",
      "auth.form.pending": "Secure account access is being prepared. You'll be able to sign in for real soon.",
      "signup.hero.eyebrow": "New account",
      "signup.hero.title": "Create your account",
      "signup.hero.lead": "Fill in your details to create your CorpoPleno account.",
      "signup.form.name_label": "Name",
      "signup.form.email_label": "Email",
      "signup.form.phone_label": "Phone",
      "signup.form.password_label": "Password",
      "signup.form.confirm_password_label": "Confirm password",
      "signup.form.terms_prefix": "I have read and accept the",
      "signup.form.terms_middle": "and the",
      "signup.form.submit": "Create account",
      "signup.form.have_account": "Already have an account —",
      "signup.form.login_link": "Sign in",
      "account.hero.title": "My account",
      "account.redirect.message": "To access your account, you need to sign in.",
      "account.redirect.cta": "Sign in",
      "nav.terms": "Terms",
      "nav.privacy": "Privacy",
      "nav.aria_label": "Main navigation",
      "nav_toggle.open_label": "Open menu",

      "brand.slogan": "Smart, real results",

      "common.in_preparation": "Coming soon",
      "common.available": "Available",
      "common.bonus_tag": "Bonus",
      "common.checkout_button": "View offer",
      "common.checkout_pending": "Checkout being set up",
      "common.learn_more": "Learn more",
      "common.price_unavailable": "Price unavailable in this market.",
      "common.partial_notice":
        "This page is currently fully available in Brazilian Portuguese only. A complete translation is in progress.",
      "whatsapp.float_label": "Chat with CorpoPleno on WhatsApp",
      "whatsapp.initial_message":
        "Hello! I came from the CorpoPleno website and would like assistance.",
      "account.pending_toast":
        "Customer area in preparation. Real login will be connected to a secure backend in the future — no authentication exists in this version.",

      "footer.about.title": "CorpoPleno",
      "footer.about.body":
        "Education, technology and care brought together for a CorpoPleno experience that is simple, accessible and responsible.",
      "footer.about.cnpj": "Brazilian company registration (CNPJ): 68.987.084/0001-32",
      "footer.about.location": "São Paulo, Brazil",
      "footer.links.title": "Navigation",
      "footer.legal.title": "Legal",
      "footer.contact.title": "Contact",
      "footer.contact.email_label": "Email",
      "footer.contact.whatsapp_label": "WhatsApp",
      "footer.contact.whatsapp_link_label": "Chat on WhatsApp",
      "footer.contact.pending": "Channel being set up",

      "legal.company_id.title": "Company identification",
      "legal.company_id.brand_label": "Brand",
      "legal.company_id.cnpj_label": "CNPJ (Brazilian company registration number)",
      "legal.company_id.location_label": "Public location",
      "legal.company_id.site_label": "Website",
      "legal.company_id.review_note":
        "Additional legal information (such as the registered legal name and full registered address) is still pending confirmation through legal/business review before full operation.",
      "footer.language.title": "Language",
      "footer.copyright": "© 2026 CorpoPleno. All rights reserved.",

      "home.hero.eyebrow": "CorpoPleno",
      "home.hero.title": "A clear foundation for a fuller life",
      "home.hero.slogan": "Smart, real results",
      "home.hero.lead":
        "We bring together products, courses and materials organized with methodology, technology and content review — so you can move forward with clarity, at your own pace.",
      "home.hero.cta_primary": "Explore products",
      "home.hero.cta_secondary": "Get to know CorpoPleno",
      "home.hero.chip3": "Technology",
      "home.hero.chip4": "Trust",

      "characters.eyebrow": "Meet the team",
      "characters.title": "CorpoPleno Characters",
      "characters.ester.name": "Ester",
      "characters.ester.desc": "Guides the CorpoPleno journey with care and good humor.",
      "characters.ester.hero_alt": "Ester smiling at her laptop, with Mimi (cat), Ping (dog) and Pipo (parrot) nearby, in a bright and cheerful setting",
      "characters.mimi.name": "Mimi",
      "characters.mimi.desc": "Curious and observant, always noticing the details.",
      "characters.ping.name": "Ping",
      "characters.ping.desc": "Loyal companion, full of everyday energy.",
      "characters.pipo.name": "Pipo",
      "characters.pipo.desc": "Cheerful and talkative, bringing lightness to every chat.",

      "home.intro.eyebrow": "Get to know CorpoPleno",
      "home.intro.title": "What is CorpoPleno",
      "home.intro.body":
        "CorpoPleno organizes knowledge and tools with purpose, its own methodology and an ongoing commitment to quality — bringing together education, technology and care.",
      "home.intro.point1.title": "Clear purpose",
      "home.intro.point1.desc":
        "Helping people organize health, learning and routine with reliable information.",
      "home.intro.point2.title": "Own methodology",
      "home.intro.point2.desc":
        "Content structured in steps, reviewed before publication.",
      "home.intro.point3.title": "Technology that serves people",
      "home.intro.point3.desc":
        "Simple, direct tools, without complicating what can be easy.",
      "home.intro.point4.title": "Organization and continuous review",
      "home.intro.point4.desc":
        "Every piece of content goes through review before reaching you.",
      "home.intro.cta": "Read more about CorpoPleno",

      "home.explore.eyebrow": "Explore",
      "home.explore.title": "Explore CorpoPleno",
      "home.explore.lead": "Choose where to start.",
      "home.explore.produtos.title": "Products",
      "home.explore.produtos.desc": "Materials, self-care and solutions organized by category.",
      "home.explore.produtos.cta": "See CorpoPleno products →",
      "home.explore.cursos.title": "Courses",
      "home.explore.cursos.desc": "Structured learning, from language courses to technical courses.",
      "home.explore.cursos.cta": "See CorpoPleno courses →",
      "home.explore.miniapps.title": "Mini Apps",
      "home.explore.miniapps.desc": "Interactive tools for your everyday life.",
      "home.explore.miniapps.cta": "Explore Mini Apps →",
      "home.explore.atendimento.title": "Support",
      "home.explore.atendimento.desc": "Need help? Find the right channel for your request.",
      "home.explore.atendimento.cta": "Contact support →",


      "home.support.eyebrow": "Here to help",
      "home.support.title": "CorpoPleno Support",
      "home.support.desc": "Need help? Find the right channel for your request.",
      "home.support.cta": "Contact support",

      "home.faq.eyebrow": "Questions",
      "home.faq.title": "Frequently asked questions",
      "home.faq.q1": "How do I receive my products after purchase?",
      "home.faq.a1":
        "Once your purchase is confirmed, you receive access instructions by email. Today no product is published yet — this will be activated once the catalog is released.",
      "home.faq.q2": "How does support work?",
      "home.faq.a2":
        "Tell us your question on the Support page — CorpoPleno takes it from there.",
      "home.faq.q3": "How do cancellations or refunds work?",
      "home.faq.a3":
        "Open your request on the Support page; additional verification may be required before confirmation.",
      "home.faq.q4": "How do I access my account?",
      "home.faq.a4":
        "Use the \"My account\" button at the top of the site. Real login will be connected soon.",

      "home.cta.title": "Discover the CorpoPleno universe",
      "home.cta.body": "Explore products, courses, and experiences developed to accompany different moments of your journey.",
      "home.cta.button": "Explore CorpoPleno",


      "products.hero.eyebrow": "CorpoPleno catalog",
      "products.hero.title": "Products",
      "products.hero.lead":
        "Categories organized to receive CorpoPleno products. Items not yet launched are shown as \"Coming soon\" — nothing here is available for purchase until the official checkout is connected.",
      "products.notice":
        "No checkout link has been configured yet. The purchase buttons below are intentionally disabled.",
      "products.category_empty":
        "No product approved for public display in this category yet.",
      "products.filter.all": "All categories",
      "products.filter.ebooks": "eBooks",
      "products.filter.livros": "Books",
      "products.filter.miniapps": "Mini apps",
      "products.filter.autocuidado": "Self-care",
      "products.filter.natural": "CorpoPleno Natural",
      "products.filter.capilares": "Hair care materials",
      "products.filter.nutricao": "Nutrition",

      "courses.hero.eyebrow": "CorpoPleno education",
      "courses.hero.title": "Courses",
      "courses.hero.lead":
        "Area prepared for CorpoPleno courses. Information about course load, content and certification for each course will be presented on its specific page before enrollment.",
      "courses.notice":
        "No courses have been published yet.",
      "courses.filter.all": "All categories",
      "courses.filter.idiomas": "Languages",
      "courses.filter.empresarial": "Business",
      "courses.filter.tecnicos": "Technical",
      "courses.filter.curtos": "Short courses",
      "courses.filter.libras": "Brazilian Sign Language (bonus)",
      "courses.category_empty": "No course approved for public display in this category yet.",
      "courses.category.idiomas.body":
        "Language courses are in planning, including main courses with an estimated 12-month course load. No language course has been approved for public launch yet — names, dates and prices will be announced after final approval.",
      "courses.libras.title": "Brazilian Sign Language (Libras) — bonus content",
      "courses.libras.body":
        "Libras is not sold as a stand-alone course. It is bonus content, unlocked for those who purchase an eligible CorpoPleno course — unlocking will depend on real purchase records once courses are published.",

      "about.hero.eyebrow": "Institutional",
      "about.hero.title": "What is CorpoPleno",
      "about.hero.lead": "CorpoPleno brings together knowledge, education, technology, and care in solutions designed to make learning and everyday life clearer, more organized, and more accessible.",
      "about.hero.photo_alt": "Ester smiling at her laptop, with Mimi (cat), Ping (dog) and Pipo (parrot) nearby",
      "about.essence.eyebrow": "Who we are",
      "about.essence.title": "Our essence",
      "about.essence.body": "CorpoPleno was created to turn knowledge into experiences that are simpler to understand, apply, and follow through on. We organize content, tools, and solutions with clarity, responsibility, and attention to each person's experience.",
      "about.pillars.eyebrow": "What guides us",
      "about.pillars.title": "CorpoPleno pillars",
      "about.pillars.item1.title": "Purposeful knowledge",
      "about.pillars.item1.body": "Content designed to help people learn, get organized, and make decisions with more clarity.",
      "about.pillars.item2.title": "Quality and responsibility",
      "about.pillars.item2.body": "We strive to present information that is clear, consistent, and backed by references appropriate to each topic.",
      "about.pillars.item3.title": "Technology that simplifies",
      "about.pillars.item3.body": "We use technology to make content and tools more accessible, intuitive, and easy to use.",
      "about.pillars.item4.title": "Continuous evolution",
      "about.pillars.item4.body": "CorpoPleno products, materials, and experiences are developed and improved continuously, respecting every step before release.",
      "about.content.eyebrow": "How we produce",
      "about.content.title": "Content developed with responsibility",
      "about.content.body": "CorpoPleno content is built on research, reliable sources, official documents, and bibliographic references when applicable to the topic. Our commitment is to turn information into organized, original, and useful materials, respecting authorship, intellectual property, and good content-production practices.",
      "about.education.title": "Education and learning",
      "about.education.body": "Courses and materials are developed to support learning in a practical, organized, and accessible way.",
      "about.technology.eyebrow": "Technology",
      "about.technology.title": "Technology for people",
      "about.technology.body": "Technology is part of CorpoPleno as a means to make experiences easier, organize knowledge, and bring people closer to tools that help them learn, care for themselves, and grow at their own pace.",
      "about.transparency.eyebrow": "Commitment",
      "about.transparency.title": "Transparency at every step",
      "about.transparency.body": "We present products and content according to their actual stage of availability. Information, results, and resources are only shared when they can be presented responsibly and verifiably.",

      "support.hero.eyebrow": "Support",
      "support.hero.title": "CorpoPleno Support",
      "support.hero.lead": "We're here to help.",
      "support.form.title": "Question about a product",
      "support.form.subtitle": "How can we help?",
      "support.form.description":
        "If you're already a customer, please identify yourself first in your message with the email and phone number used in your purchase, then describe your question or request. If you're not a customer yet and would like to learn about our products, you can ask us through the WhatsApp icon in the bottom right corner of the page.",
      "support.form.placeholder": "Write here...",
      "support.form.send": "SEND",
      "support.form.pending":
        "This direct sending channel is being securely set up. Once it's ready, your message will go straight to CorpoPleno support.",
      "support.form.pending_whatsapp": "In the meantime, you can also talk to us on WhatsApp.",

      "terms.hero.eyebrow": "Legal document",
      "terms.hero.title": "Terms of Use",
      "terms.updated": "Last updated: September 25, 2026.",
      "terms.section1.title": "1. Acceptance of terms",
      "terms.section1.body": "By accessing and using the CorpoPleno website, you agree to these Terms of Use. If you disagree with any point, we recommend not using the site until your questions are clarified through our support channels.",
      "terms.section2.title": "2. About our products and courses",
      "terms.section2.body": "This site presents products, courses, and materials organized by category. Items not yet available for purchase are clearly identified as such.",
      "terms.section3.title": "3. Permitted use",
      "terms.section3.body": "The content on this site is made available for personal, non-commercial use, unless expressly authorized by CorpoPleno. Copying, redistributing, or modifying the content without permission is prohibited.",
      "terms.section4.title": "4. Certificates",
      "terms.section4.body": "When applicable, information about certificates, course length, requirements, and conditions for each course will be presented on that course's specific page.",
      "terms.section5.title": "5. Payments",
      "terms.section5.body": "Payments may be processed by payment providers contracted by CorpoPleno, as indicated at the time of purchase. Payment data may be processed directly by the providers used in the transaction, in accordance with their own privacy and security policies.",
      "terms.refund.title": "6. Right of Withdrawal, Cancellation, and Refunds",
      "terms.refund.body1": "For electronic and distance transactions carried out in Brazil, Brazilian consumer protection law applies where relevant — in particular Article 49 of the Brazilian Consumer Protection Code (Law No. 8,078/1990) and Decree No. 7,962/2013 — under which the consumer may exercise the legal right of withdrawal within 7 (seven) days, counted as established by the legislation applicable to the transaction. When this right is properly exercised within the legal period, amounts paid will be refunded as provided by the applicable law.",
      "terms.refund.body2": "After the legal withdrawal period has ended, no refund will be provided for a simple change of mind or unjustified regret, except in cases where applicable law grants the consumer other rights — such as defects, service failures, a product or content different from what was offered, non-compliance with the offer, improper charges, non-delivery, or access issues caused by CorpoPleno, among other cases provided by applicable law.",
      "terms.refund.body3": "This section applies, as relevant, to CorpoPleno's digital products and services, including eBooks, digital books, workbooks, educational materials, courses, mini-apps, digital tools, subscriptions, and other digital products and services that may be offered in the future. Specific conditions for each product may be presented on its respective sales page, at checkout, or in an applicable contract or license, and rights provided by law will always prevail over any incompatible internal commercial rule.",
      "terms.refund.body4": "Exercising the legal right of withdrawal within the applicable period, canceling a subscription or recurring service, and requesting a refund after the withdrawal period has ended are distinct situations, each subject to its own conditions. For CorpoPleno subscriptions, when made available, cancellation will follow the specific conditions presented to the consumer before contracting.",
      "terms.refund.body5": "Additional rules on cancellation, withdrawal, and refunds may be detailed in a specific policy, once published, without prejudice to what is set out in this section and in applicable law.",
      "terms.section6.title": "7. Accounts and access",
      "terms.section6.body": "Access to certain areas of the site, such as the customer area, may require creating an account. You are responsible for keeping your access credentials confidential and for all activity carried out under your account.",
      "terms.section7.title": "8. Limitation of liability",
      "terms.section7.body": "We do our best to keep the information on this site accurate and up to date, but we do not guarantee it is entirely free of errors. In case of discrepancies, our support channels are available for clarification.",
      "terms.section8.title": "9. Changes to these terms",
      "terms.section8.body": "These Terms of Use may be updated as CorpoPleno's services evolve. We recommend checking them periodically.",
      "terms.section9.title": "10. Contact",
      "terms.section9.body_pre": "Questions about these terms can be sent through the channels listed on the",
      "terms.section9.body_post": "page.",

      "privacy.hero.eyebrow": "Legal document",
      "privacy.hero.title": "Privacy Policy",
      "privacy.updated": "Last updated: September 25, 2026.",
      "privacy.s1.title": "1. About this Policy",
      "privacy.s1.body": "This Privacy Policy describes how information related to people who use CorpoPleno's services may be handled, and what rights and channels are available to clarify questions about that handling. The processing of personal data related to CorpoPleno's services will observe applicable data protection legislation, including, for CorpoPleno's operations in Brazil, the General Personal Data Protection Law — LGPD (Law No. 13,709/2018), where applicable.",
      "privacy.s2.title": "2. What information you may provide",
      "privacy.s2.body": "You may provide us with information such as name, email, phone number, and other information sent voluntarily through our support channels. When account and sign-up features are actually available, information needed to create and manage your account may also be requested. Likewise, when purchasing products and courses is available, information needed to identify the purchase and grant the corresponding access may be handled.",
      "privacy.s3.title": "3. Purposes of processing",
      "privacy.s3.body": "The information provided may be used, as applicable to each feature that is actually available, to: provide support and respond to requests; create and manage user accounts; grant access to purchased products and courses; process requests related to CorpoPleno's services; communicate relevant information about the services used; comply with applicable legal and regulatory obligations; protect platform security; and record preferences needed for the browsing experience, such as the selected language.",
      "privacy.s4.title": "4. Account and sign-up",
      "privacy.s4.body": "When the account creation feature is available, the information provided in that process will be used to identify you, enable access to your customer area, and keep a record of the products and courses linked to your account. CorpoPleno adopts technical and organizational practices aimed at protecting this information.",
      "privacy.s5.title": "5. Purchases and product access",
      "privacy.s5.body": "When purchasing products and courses is available, certain information may be handled to identify the purchase, process it, grant access to the purchased content, and provide support related to that purchase. Payment information, when applicable, may be processed directly by the payment service providers used in the transaction, in accordance with those providers' own privacy and security policies.",
      "privacy.s5.body2_pre": "Requests for cancellation, exercising the right of withdrawal, refunds, disputes, or other purchase-related requests may require processing the personal data necessary to identify the data subject, locate the purchase, confirm the transaction, process the request, record the support interaction, and comply with applicable legal or regulatory obligations. Commercial rules on cancellation, withdrawal, and refunds are set out in the",
      "privacy.s5.body2_post": ", and, once published, in a specific policy on the subject.",
      "privacy.s6.title": "6. Support",
      "privacy.s6.body": "Information sent through CorpoPleno's official support channels — such as email and WhatsApp — is used exclusively to understand, record, and respond to the request submitted.",
      "privacy.s7.title": "7. Cookies, storage, and preferences",
      "privacy.s7.body": "CorpoPleno may use browser storage and preference technologies to remember settings such as the selected language, in order to improve the browsing experience. This information can be removed at any time directly in the settings of the browser used.",
      "privacy.s8.title": "8. Sharing with third parties",
      "privacy.s8.body": "CorpoPleno does not share personal information indiscriminately. When necessary to enable the services offered, certain information may be handled by operators and service providers engaged for specific purposes, such as payment processing, hosting, infrastructure, communication, or technology support — always limited to what is necessary for the corresponding service and subject to their own data protection obligations.",
      "privacy.s9.title": "9. Security",
      "privacy.s9.body": "CorpoPleno adopts technical and organizational measures appropriate to the context and nature of the information handled, aiming to protect data against unauthorized access, loss, alteration, disclosure, or misuse. No system, however, is entirely free of risk, and CorpoPleno works continuously to improve these protective measures.",
      "privacy.s10.title": "10. Data retention and deletion",
      "privacy.s10.body": "Personal information is kept for the period necessary to fulfill the purposes described in this Policy, subject to any applicable legal and regulatory obligations, the regular exercise of rights, and other legitimate grounds provided by law. Once those purposes are fulfilled, the information is deleted or anonymized, as appropriate.",
      "privacy.s11.title": "11. Your rights",
      "privacy.s11.body_pre": "Under applicable law, you may request confirmation of processing, access, correction, updating, deletion, or portability of your personal data, as well as obtain information about any sharing carried out and, where applicable, withdraw previously given consent. These requests can be made through the official channels on the",
      "privacy.s11.body_post": "page, and will be answered within a reasonable time, depending on the nature of each request.",
      "privacy.s12.title": "12. Consent and preferences",
      "privacy.s12.body": "When a given processing activity depends on your consent, it may be withdrawn at any time, in accordance with applicable law, without affecting the lawfulness of processing carried out before the withdrawal. Not all activities described in this Policy depend on consent, as some may rely on other applicable legal grounds.",
      "privacy.s13.title": "13. Children's and teenagers' data",
      "privacy.s13.body": "When a service or content involves children or teenagers, the processing of personal data will observe applicable legal requirements and, where necessary, consent measures or the involvement of a parent or legal guardian. This Policy will be updated before any feature directed at that audience is made available.",
      "privacy.s14.title": "14. International transfers and services",
      "privacy.s14.body": "Should certain services involve providers or infrastructure located outside the country, CorpoPleno will seek to adopt safeguards compatible with the data protection legislation applicable to that type of processing.",
      "privacy.s15.title": "15. Updates to this Policy",
      "privacy.s15.body": "This Privacy Policy may be updated to reflect changes in the services offered, applicable legislation, or practices adopted by CorpoPleno. We recommend checking this page periodically.",
      "privacy.s16.title": "16. Channels to exercise your rights and ask questions",
      "privacy.s16.body": "Questions about this Policy or requests related to your personal data can be sent to corpoplenoresultadoreal@gmail.com or through CorpoPleno's official WhatsApp.",
      "privacy.section1.title": "1. What data you may provide",
      "privacy.section1.body": "You may provide us with data such as name, email, phone number, and other information required when using the sign-up, support, or purchase forms available on the site.",
      "privacy.section2.title": "2. Purpose of data use",
      "privacy.section2.body": "The data provided is used exclusively to enable the requested services, such as creating and managing your account, responding to support requests, and granting access to purchased products and courses.",
      "privacy.section3.title": "3. Account and sign-up",
      "privacy.section3.body": "When you create a CorpoPleno account, the information provided is used to identify you, give you access to your customer area, and keep a record of the products and courses linked to your account.",
      "privacy.section4.title": "4. Support",
      "privacy.section4.body": "Information sent through support channels is used only to understand and respond to your request.",
      "privacy.section5.title": "5. Purchases and product access",
      "privacy.section5.body": "The data needed to process a purchase and grant access to the purchased product or course will be handled solely for that purpose.",
      "privacy.section6.title": "6. Security",
      "privacy.section6.body": "CorpoPleno adopts reasonable technical and organizational measures to protect the personal data it handles, aiming to prevent unauthorized access, loss, or misuse of information.",
      "privacy.section7.title": "7. Cookies and preferences",
      "privacy.section7.body": "CorpoPleno may store certain user preferences, such as the selected language, to improve your browsing experience. You can clear these preferences at any time in your browser settings.",
      "privacy.section8.title": "8. Data sharing",
      "privacy.section8.body": "Personal data may be shared with third parties only when necessary to enable the services offered, such as payment and hosting providers, always subject to their own privacy and security policies.",
      "privacy.section9.title": "9. Your rights",
      "privacy.section9.body_pre": "You may request confirmation, access, correction, or deletion of your personal data, as well as withdraw previously given consent, by contacting us through the channels on the",
      "privacy.section9.body_post": "page.",
      "privacy.section10.title": "10. Updates to this policy",
      "privacy.section10.body": "This Privacy Policy may be updated as CorpoPleno's services evolve. We recommend checking it periodically.",

      "legal.pending_review":
        "Document subject to legal review and updates before final operation.",
    },

    "ko-KR": {
      "catalog.empty_state": "새로운 소식을 준비하고 있어요.",
      skip_link: "본문으로 건너뛰기",
      lang_label: "언어 선택",

      "nav.home": "홈",
      "nav.products": "제품",
      "nav.courses": "강좌",
      "nav.about": "소개",
      "nav.support": "고객지원",
      "nav.account": "마이페이지",
      "nav.login": "로그인",
      "login.hero.eyebrow": "계정 접속",
      "login.hero.title": "로그인",
      "login.hero.lead": "제품과 강좌를 보려면 CorpoPleno 계정으로 로그인하세요.",
      "login.form.email_label": "이메일",
      "login.form.password_label": "비밀번호",
      "login.form.submit": "로그인",
      "login.form.forgot": "비밀번호를 잊으셨나요",
      "login.form.no_account": "아직 계정이 없으신가요 —",
      "login.form.create_account_link": "계정 만들기",
      "auth.form.pending": "안전한 계정 접속을 준비하고 있어요. 곧 실제로 로그인하실 수 있어요.",
      "signup.hero.eyebrow": "새 계정",
      "signup.hero.title": "계정 만들기",
      "signup.hero.lead": "CorpoPleno 계정을 만들려면 정보를 입력해 주세요.",
      "signup.form.name_label": "이름",
      "signup.form.email_label": "이메일",
      "signup.form.phone_label": "전화번호",
      "signup.form.password_label": "비밀번호",
      "signup.form.confirm_password_label": "비밀번호 확인",
      "signup.form.terms_prefix": "다음에 동의합니다:",
      "signup.form.terms_middle": "및",
      "signup.form.submit": "계정 만들기",
      "signup.form.have_account": "이미 계정이 있으신가요 —",
      "signup.form.login_link": "로그인",
      "account.hero.title": "마이페이지",
      "account.redirect.message": "마이페이지에 접속하려면 로그인이 필요해요.",
      "account.redirect.cta": "로그인",
      "nav.terms": "이용약관",
      "nav.privacy": "개인정보처리방침",
      "nav.aria_label": "주 메뉴",
      "nav_toggle.open_label": "메뉴 열기",

      "brand.slogan": "지능적으로, 진짜 결과로",

      "common.in_preparation": "준비 중",
      "common.available": "이용 가능",
      "common.bonus_tag": "보너스",
      "common.checkout_button": "혜택 보기",
      "common.checkout_pending": "결제 설정 중",
      "common.learn_more": "더 알아보기",
      "common.price_unavailable": "이 시장에서는 가격을 이용할 수 없습니다.",
      "common.partial_notice":
        "이 페이지는 현재 브라질 포르투갈어로만 전체 내용을 제공합니다. 전체 번역은 준비 중입니다.",
      "whatsapp.float_label": "코르포플레노와 왓츠앱으로 상담하기",
      "whatsapp.initial_message":
        "안녕하세요! 코르포플레노 웹사이트를 통해 왔으며, 상담을 받고 싶습니다.",
      "account.pending_toast":
        "고객 전용 공간은 준비 중입니다. 실제 로그인은 향후 안전한 백엔드와 연결될 예정이며, 이 버전에는 인증 기능이 없습니다.",

      "footer.about.title": "CorpoPleno",
      "footer.about.body":
        "교육, 기술, 돌봄을 하나로 모아 간단하고 접근성 높은, 책임감 있는 코르포플레노 경험을 제공합니다.",
      "footer.about.cnpj": "브라질 사업자등록번호(CNPJ): 68.987.084/0001-32",
      "footer.about.location": "브라질 상파울루",
      "footer.links.title": "메뉴",
      "footer.legal.title": "법적 정보",
      "footer.contact.title": "연락처",
      "footer.contact.email_label": "이메일",
      "footer.contact.whatsapp_label": "왓츠앱",
      "footer.contact.whatsapp_link_label": "왓츠앱으로 문의하기",
      "footer.contact.pending": "채널 설정 중",

      "legal.company_id.title": "기업 식별 정보",
      "legal.company_id.brand_label": "브랜드",
      "legal.company_id.cnpj_label": "CNPJ(브라질 사업자등록번호)",
      "legal.company_id.location_label": "공개 소재지",
      "legal.company_id.site_label": "웹사이트",
      "legal.company_id.review_note":
        "법적 상호명 및 등록 주소 전체와 같은 추가 법률 정보는 정식 운영 전에 법률/사업 검토를 통해 추후 확정될 예정입니다.",
      "footer.language.title": "언어",
      "footer.copyright": "© 2026 CorpoPleno. 모든 권리 보유.",

      "home.hero.eyebrow": "CorpoPleno",
      "home.hero.title": "더 온전한 삶을 위한 명확한 기반",
      "home.hero.slogan": "지능적으로, 진짜 결과로",
      "home.hero.lead":
        "체계적인 방법론, 기술, 콘텐츠 검토를 거친 제품, 강좌, 자료를 한곳에 모았습니다. 당신의 속도에 맞춰 명확하게 나아가세요.",
      "home.hero.cta_primary": "제품 둘러보기",
      "home.hero.cta_secondary": "CorpoPleno 알아보기",
      "home.hero.chip3": "기술",
      "home.hero.chip4": "신뢰",

      "characters.eyebrow": "우리 친구들",
      "characters.title": "CorpoPleno 캐릭터",
      "characters.ester.name": "Ester",
      "characters.ester.desc": "세심함과 유쾌함으로 CorpoPleno 여정을 안내합니다.",
      "characters.ester.hero_alt": "밝고 활기찬 공간에서 노트북 앞에서 미소 짓는 에스테르와 옆에 있는 미미(고양이), 핑(강아지)과 피포(앵무새)",
      "characters.mimi.name": "Mimi",
      "characters.mimi.desc": "호기심 많고 관찰력이 뛰어나, 작은 것도 놓치지 않아요.",
      "characters.ping.name": "Ping",
      "characters.ping.desc": "충직한 친구, 매일 활기찬 에너지를 전해줘요.",
      "characters.pipo.name": "Pipo",
      "characters.pipo.desc": "밝고 수다스러워 대화에 경쾌함을 더해줘요.",

      "home.intro.eyebrow": "CorpoPleno 알아보기",
      "home.intro.title": "CorpoPleno란",
      "home.intro.body":
        "CorpoPleno는 목적, 고유한 방법론, 지속적인 품질 개선을 바탕으로 지식과 도구를 정리합니다 — 교육, 기술, 돌봄을 하나로 연결합니다.",
      "home.intro.point1.title": "명확한 목적",
      "home.intro.point1.desc":
        "신뢰할 수 있는 정보로 건강, 학습, 일상을 정리하도록 돕습니다.",
      "home.intro.point2.title": "고유한 방법론",
      "home.intro.point2.desc": "단계별로 구성되고 게시 전에 검토되는 콘텐츠입니다.",
      "home.intro.point3.title": "사람을 위한 기술",
      "home.intro.point3.desc": "쉬운 것을 복잡하게 만들지 않는 간단하고 직관적인 도구입니다.",
      "home.intro.point4.title": "지속적인 정리와 검토",
      "home.intro.point4.desc": "모든 콘텐츠는 전달되기 전에 검토 과정을 거칩니다.",
      "home.intro.cta": "CorpoPleno에 대해 더 읽기",

      "home.explore.eyebrow": "탐색",
      "home.explore.title": "CorpoPleno 둘러보기",
      "home.explore.lead": "시작할 곳을 선택하세요.",
      "home.explore.produtos.title": "제품",
      "home.explore.produtos.desc": "카테고리별로 정리된 자료, 셀프케어, 솔루션.",
      "home.explore.produtos.cta": "CorpoPleno 제품 보기 →",
      "home.explore.cursos.title": "강좌",
      "home.explore.cursos.desc": "어학부터 기술 강좌까지, 체계적인 교육 과정.",
      "home.explore.cursos.cta": "CorpoPleno 강좌 보기 →",
      "home.explore.miniapps.title": "미니 앱",
      "home.explore.miniapps.desc": "일상을 위한 인터랙티브 도구.",
      "home.explore.miniapps.cta": "미니 앱 둘러보기 →",
      "home.explore.atendimento.title": "고객지원",
      "home.explore.atendimento.desc": "도움이 필요하신가요? 문의에 맞는 채널을 찾아보세요.",
      "home.explore.atendimento.cta": "고객지원 문의 →",


      "home.support.eyebrow": "도와드립니다",
      "home.support.title": "CorpoPleno 고객지원",
      "home.support.desc": "도움이 필요하신가요? 문의에 맞는 채널을 찾아보세요.",
      "home.support.cta": "고객지원 문의",

      "home.faq.eyebrow": "자주 묻는 질문",
      "home.faq.title": "자주 묻는 질문",
      "home.faq.q1": "구매 후 제품은 어떻게 받나요?",
      "home.faq.a1":
        "구매가 확인되면 이메일로 접속 안내를 받습니다. 오늘은 게시된 제품이 없으며, 카탈로그가 공개되면 활성화됩니다.",
      "home.faq.q2": "고객지원은 어떻게 이용하나요?",
      "home.faq.a2":
        "고객지원 페이지에서 문의 내용을 남겨주세요 — 이후는 CorpoPleno가 처리합니다.",
      "home.faq.q3": "취소나 환불은 어떻게 하나요?",
      "home.faq.a3":
        "고객지원 페이지에서 요청을 시작하세요. 확인 전에 추가 검증이 필요할 수 있습니다.",
      "home.faq.q4": "내 계정에는 어떻게 접근하나요?",
      "home.faq.a4":
        "사이트 상단의 \"마이페이지\" 버튼을 이용하세요. 실제 로그인은 곧 연결될 예정입니다.",

      "home.cta.title": "CorpoPleno의 세계를 만나보세요",
      "home.cta.body": "여정의 여러 순간을 함께할 수 있도록 만들어진 제품, 강좌, 경험을 둘러보세요.",
      "home.cta.button": "CorpoPleno 둘러보기",


      "products.hero.eyebrow": "CorpoPleno 카탈로그",
      "products.hero.title": "제품",
      "products.hero.lead":
        "CorpoPleno 제품을 위해 정리된 카테고리입니다. 아직 출시되지 않은 항목은 \"준비 중\"으로 표시되며, 공식 결제 시스템이 연결되기 전까지는 구매할 수 없습니다.",
      "products.notice":
        "아직 결제 링크가 설정되지 않았습니다. 아래 구매 버튼은 의도적으로 비활성화되어 있습니다.",
      "products.category_empty":
        "이 카테고리에는 아직 공개 전시가 승인된 제품이 없습니다.",
      "products.filter.all": "전체 카테고리",
      "products.filter.ebooks": "전자책",
      "products.filter.livros": "도서",
      "products.filter.miniapps": "미니 앱",
      "products.filter.autocuidado": "셀프케어",
      "products.filter.natural": "CorpoPleno 내추럴",
      "products.filter.capilares": "헤어케어 자료",
      "products.filter.nutricao": "영양",

      "courses.hero.eyebrow": "CorpoPleno 교육",
      "courses.hero.title": "강좌",
      "courses.hero.lead":
        "CorpoPleno 강좌를 위한 영역입니다. 각 강좌의 이수 시간, 내용, 수료 관련 정보는 등록 전 해당 강좌의 상세 페이지에서 안내됩니다.",
      "courses.notice": "아직 게시된 강좌가 없습니다.",
      "courses.filter.all": "전체 카테고리",
      "courses.filter.idiomas": "어학",
      "courses.filter.empresarial": "비즈니스",
      "courses.filter.tecnicos": "기술",
      "courses.filter.curtos": "단기 강좌",
      "courses.filter.libras": "브라질 수어 (보너스)",
      "courses.category_empty": "이 카테고리에는 아직 공개 승인된 강좌가 없습니다.",
      "courses.category.idiomas.body":
        "어학 강좌는 현재 계획 단계이며, 주요 과정은 약 12개월의 이수 기간으로 예정되어 있습니다. 아직 공개적으로 승인된 어학 강좌는 없으며, 명칭·일정·가격은 최종 승인 후 안내됩니다.",
      "courses.libras.title": "브라질 수어(Libras) — 보너스 콘텐츠",
      "courses.libras.body":
        "Libras는 독립된 강좌로 판매되지 않습니다. 이는 보너스 콘텐츠로, 자격이 있는 CorpoPleno 강좌를 구매한 분에게 제공되며, 강좌가 게시된 이후 실제 구매 기록에 따라 잠금 해제됩니다.",

      "about.hero.eyebrow": "기관 소개",
      "about.hero.title": "CorpoPleno는 무엇인가요",
      "about.hero.lead": "CorpoPleno는 지식, 교육, 기술, 그리고 돌봄을 하나로 모아, 배움과 일상을 더 명확하고 체계적이며 이용하기 쉽게 만드는 솔루션을 제공합니다.",
      "about.hero.photo_alt": "노트북 앞에서 미소 짓는 에스테르와 옆에 있는 미미(고양이), 핑(강아지)과 피포(앵무새)",
      "about.essence.eyebrow": "우리는 누구인가",
      "about.essence.title": "우리의 본질",
      "about.essence.body": "CorpoPleno는 지식을 이해하고, 적용하고, 꾸준히 따라갈 수 있는 더 단순한 경험으로 바꾸기 위해 탄생했습니다. 저희는 명확함과 책임감, 그리고 한 사람 한 사람의 경험에 대한 세심한 배려로 콘텐츠와 도구, 솔루션을 구성합니다.",
      "about.pillars.eyebrow": "우리를 이끄는 가치",
      "about.pillars.title": "CorpoPleno의 원칙",
      "about.pillars.item1.title": "목적이 있는 지식",
      "about.pillars.item1.body": "사람들이 배우고, 정리하고, 더 명확하게 결정을 내릴 수 있도록 돕기 위해 기획된 콘텐츠입니다.",
      "about.pillars.item2.title": "품질과 책임감",
      "about.pillars.item2.body": "주제에 맞는 근거를 바탕으로 명확하고 일관된 정보를 제공하기 위해 노력합니다.",
      "about.pillars.item3.title": "단순함을 더하는 기술",
      "about.pillars.item3.body": "콘텐츠와 도구를 더 접근하기 쉽고 직관적이며 사용하기 편하게 만들기 위해 기술을 활용합니다.",
      "about.pillars.item4.title": "끊임없는 발전",
      "about.pillars.item4.body": "CorpoPleno의 제품, 자료, 경험은 공개되기 전 각 단계를 존중하며 지속적으로 개발되고 개선됩니다.",
      "about.content.eyebrow": "제작 방식",
      "about.content.title": "책임감 있게 만든 콘텐츠",
      "about.content.body": "CorpoPleno의 콘텐츠는 조사, 신뢰할 수 있는 출처, 공식 문서, 그리고 주제에 맞는 참고 문헌을 바탕으로 구성됩니다. 저희의 다짐은 저작권과 지식재산권, 좋은 콘텐츠 제작 관행을 존중하며 정보를 체계적이고 독창적이며 유용한 자료로 만드는 것입니다.",
      "about.education.title": "교육과 배움",
      "about.education.body": "강좌와 자료는 실용적이고 체계적이며 이용하기 쉬운 방식으로 배움을 지원하기 위해 개발됩니다.",
      "about.technology.eyebrow": "기술",
      "about.technology.title": "사람을 위한 기술",
      "about.technology.body": "기술은 경험을 더 쉽게 만들고 지식을 정리하며, 사람들이 자신의 속도로 배우고 돌보고 성장하는 데 도움이 되는 도구에 더 가까이 다가갈 수 있게 해주는 수단으로서 CorpoPleno의 일부입니다.",
      "about.transparency.eyebrow": "약속",
      "about.transparency.title": "모든 단계에서의 투명성",
      "about.transparency.body": "저희는 제품과 콘텐츠를 실제 준비 단계에 맞게 소개합니다. 정보, 결과, 자료는 책임감 있고 검증 가능한 방식으로 제시할 수 있을 때에만 공개됩니다.",

      "support.hero.eyebrow": "고객지원",
      "support.hero.title": "CorpoPleno 고객지원",
      "support.hero.lead": "저희가 도와드리겠습니다.",
      "support.form.title": "제품 관련 문의",
      "support.form.subtitle": "무엇을 도와드릴까요?",
      "support.form.description":
        "이미 저희 고객이시라면, 메시지에 먼저 구매 시 사용하신 이메일과 전화번호를 남겨주시고, 이어서 문의 내용을 설명해 주세요. 아직 고객이 아니시고 제품에 대해 알고 싶으시다면, 페이지 오른쪽 하단의 WhatsApp 아이콘으로 문의하실 수 있습니다.",
      "support.form.placeholder": "여기에 작성하세요...",
      "support.form.send": "보내기",
      "support.form.pending":
        "이 직접 전송 채널은 안전하게 준비 중입니다. 준비가 완료되면 메시지가 CorpoPleno 고객지원으로 바로 전달됩니다.",
      "support.form.pending_whatsapp": "그동안 WhatsApp으로도 문의하실 수 있습니다.",

      "terms.hero.eyebrow": "법적 문서",
      "terms.hero.title": "이용약관",
      "terms.updated": "마지막 업데이트: 2026년 9월 25일",
      "terms.section1.title": "1. 약관 동의",
      "terms.section1.body": "CorpoPleno 웹사이트에 접속하여 이용하시면 본 이용약관에 동의하시는 것으로 간주됩니다. 특정 항목에 동의하지 않으시는 경우, 고객지원 채널을 통해 궁금한 점을 해결하실 때까지 사이트 이용을 삼가시길 권장합니다.",
      "terms.section2.title": "2. 제품 및 강좌 소개",
      "terms.section2.body": "본 사이트는 카테고리별로 정리된 제품, 강좌 및 자료를 소개합니다. 아직 구매할 수 없는 항목은 명확하게 표시됩니다.",
      "terms.section3.title": "3. 허용된 이용 범위",
      "terms.section3.body": "본 사이트의 콘텐츠는 CorpoPleno의 명시적 허가가 없는 한 개인적이고 비상업적인 용도로만 제공됩니다. 허가 없이 콘텐츠를 복사, 재배포 또는 수정하는 것은 금지됩니다.",
      "terms.section4.title": "4. 수료증",
      "terms.section4.body": "해당되는 경우, 수료증, 이수 시간, 요건 및 조건에 관한 정보는 각 강좌의 상세 페이지에 안내됩니다.",
      "terms.section5.title": "5. 결제",
      "terms.section5.body": "결제는 구매 시 안내되는 바에 따라 CorpoPleno가 계약한 결제 대행업체를 통해 처리될 수 있습니다. 결제 정보는 거래에 사용된 대행업체가 자체 개인정보 보호 및 보안 정책에 따라 직접 처리할 수 있습니다.",
      "terms.refund.title": "6. 철회권, 해지 및 환불",
      "terms.refund.body1": "브라질에서 이루어지는 전자 및 원거리 거래의 경우, 해당되는 범위 내에서 브라질 소비자보호법이 적용됩니다 — 특히 브라질 소비자보호법(법률 제8,078/1990호) 제49조 및 제7,962/2013호 법령에 따라, 소비자는 해당 거래에 적용되는 법령이 정하는 방식으로 산정된 7일의 기간 내에 법적 철회권을 행사할 수 있습니다. 이 권리가 법정 기간 내에 정당하게 행사된 경우, 지급된 금액은 관련 법령에 따라 환불됩니다.",
      "terms.refund.body2": "법정 철회 기간이 종료된 후에는 단순한 마음의 변화나 정당한 사유 없는 철회를 이유로 환불이 제공되지 않습니다. 다만 하자, 서비스 제공의 결함, 제안된 것과 다른 제품이나 콘텐츠, 제안 불이행, 부당 청구, 미배송, CorpoPleno로 인한 접근 불가 등 관련 법령이 소비자에게 다른 권리를 보장하는 경우는 예외로 합니다.",
      "terms.refund.body3": "본 조항은 해당되는 범위 내에서 전자책, 디지털 도서, 워크북, 교육 자료, 강좌, 미니 앱, 디지털 도구, 구독 서비스 및 향후 제공될 수 있는 기타 디지털 제품과 서비스를 포함한 CorpoPleno의 디지털 제품 및 서비스에 적용됩니다. 각 제품의 구체적인 조건은 해당 판매 페이지, 결제 화면 또는 적용 가능한 계약/라이선스에 안내될 수 있으며, 법령이 정한 권리는 이와 상충하는 내부 상업적 규정보다 항상 우선합니다.",
      "terms.refund.body4": "적용 기간 내 법적 철회권 행사, 구독 또는 반복 서비스의 해지, 그리고 철회 기간 종료 후 환불 요청은 각각 서로 다른 상황이며 별도의 조건이 적용됩니다. CorpoPleno 구독 서비스가 제공될 경우, 해지는 계약 전 소비자에게 안내된 구체적인 조건에 따릅니다.",
      "terms.refund.body5": "해지, 철회 및 환불에 관한 추가 규정은 향후 공개될 별도의 정책에서 상세히 안내될 수 있으며, 본 조항 및 관련 법령의 내용에 영향을 미치지 않습니다.",
      "terms.section6.title": "7. 계정 및 접속",
      "terms.section6.body": "마이페이지 등 사이트의 특정 영역에 접속하려면 계정 생성이 필요할 수 있습니다. 회원님은 본인의 접속 정보를 안전하게 관리하고, 본인 계정에서 이루어지는 모든 활동에 책임을 집니다.",
      "terms.section7.title": "8. 책임의 한계",
      "terms.section7.body": "저희는 본 사이트의 정보를 정확하고 최신 상태로 유지하기 위해 최선을 다하지만, 오류가 전혀 없음을 보장하지는 않습니다. 차이가 발견될 경우 고객지원 채널을 통해 문의하실 수 있습니다.",
      "terms.section8.title": "9. 약관 변경",
      "terms.section8.body": "본 이용약관은 CorpoPleno 서비스가 발전함에 따라 업데이트될 수 있습니다. 주기적으로 확인하시길 권장합니다.",
      "terms.section9.title": "10. 문의",
      "terms.section9.body_pre": "본 약관에 대한 문의는",
      "terms.section9.body_post": "페이지에 안내된 채널로 보내주세요.",

      "privacy.hero.eyebrow": "법적 문서",
      "privacy.hero.title": "개인정보처리방침",
      "privacy.updated": "마지막 업데이트: 2026년 9월 25일",
      "privacy.s1.title": "1. 본 정책에 대하여",
      "privacy.s1.body": "본 개인정보 처리방침은 CorpoPleno 서비스를 이용하는 분들과 관련된 정보가 어떻게 처리될 수 있는지, 그리고 이러한 처리에 대해 문의할 수 있는 권리와 채널이 무엇인지 설명합니다. CorpoPleno 서비스와 관련된 개인정보 처리는 관련 법령을 준수하며, 브라질 내 운영의 경우 일반개인정보보호법(LGPD, 법률 제13,709/2018호)을 포함하여 해당되는 범위 내에서 준수합니다.",
      "privacy.s2.title": "2. 제공할 수 있는 정보",
      "privacy.s2.body": "고객지원 채널을 통해 자발적으로 제공하시는 이름, 이메일, 전화번호 등의 정보를 제공하실 수 있습니다. 가입 및 계정 기능이 실제로 제공될 경우, 계정 생성 및 관리에 필요한 정보를 요청드릴 수도 있습니다. 마찬가지로 제품과 강좌 구매가 가능해지면, 구매를 식별하고 해당 접근 권한을 부여하는 데 필요한 정보가 처리될 수 있습니다.",
      "privacy.s3.title": "3. 처리 목적",
      "privacy.s3.body": "제공된 정보는 실제로 제공되는 각 기능에 따라 다음과 같은 목적으로 사용될 수 있습니다: 고객지원 제공 및 문의 응대, 사용자 계정 생성 및 관리, 구매하신 제품과 강좌에 대한 접근 제공, CorpoPleno 서비스 관련 요청 처리, 이용하신 서비스에 관한 중요 정보 전달, 관련 법령 및 규제 준수, 플랫폼 보안 보호, 선택하신 언어 등 탐색 경험에 필요한 환경설정 저장.",
      "privacy.s4.title": "4. 가입 및 계정",
      "privacy.s4.body": "계정 생성 기능이 제공될 경우, 이 과정에서 입력하신 정보는 회원님을 식별하고, 마이페이지 접근을 가능하게 하며, 계정에 연결된 제품과 강좌 내역을 관리하는 데 사용됩니다. CorpoPleno는 이러한 정보를 보호하기 위한 기술적·관리적 관행을 채택하고 있습니다.",
      "privacy.s5.title": "5. 구매 및 제품 접근",
      "privacy.s5.body": "제품과 강좌 구매가 가능해지면, 구매를 식별하고 처리하며 구매하신 콘텐츠에 대한 접근을 제공하고 관련 지원을 제공하기 위해 특정 정보가 처리될 수 있습니다. 결제 정보는 해당되는 경우, 거래에 사용된 결제 서비스 제공업체가 자체 개인정보 보호 및 보안 정책에 따라 직접 처리할 수 있습니다.",
      "privacy.s5.body2_pre": "해지 요청, 철회권 행사, 환불, 이의 제기 또는 구매와 관련된 기타 요청은 정보주체 식별, 구매 내역 조회, 계약 확인, 요청 처리, 상담 기록, 그리고 관련 법적·규제적 의무 준수를 위해 필요한 개인정보 처리를 수반할 수 있습니다. 해지, 철회 및 환불에 관한 상업적 규정은",
      "privacy.s5.body2_post": "에 명시되어 있으며, 향후 공개될 경우 관련 전문 정책에도 명시됩니다.",
      "privacy.s6.title": "6. 고객지원",
      "privacy.s6.body": "이메일, 왓츠앱 등 CorpoPleno의 공식 고객지원 채널을 통해 전송된 정보는 문의 내용을 이해하고, 기록하고, 응답하기 위한 목적으로만 사용됩니다.",
      "privacy.s7.title": "7. 쿠키, 저장 및 환경설정",
      "privacy.s7.body": "CorpoPleno는 탐색 경험을 개선하기 위해 선택하신 언어 등의 설정을 기억하는 브라우저 저장 및 환경설정 기술을 사용할 수 있습니다. 이러한 정보는 언제든지 사용 중인 브라우저의 설정에서 직접 삭제하실 수 있습니다.",
      "privacy.s8.title": "8. 제3자와의 공유",
      "privacy.s8.body": "CorpoPleno는 개인정보를 무분별하게 공유하지 않습니다. 제공되는 서비스를 위해 필요한 경우, 결제 처리, 호스팅, 인프라, 커뮤니케이션 또는 기술 지원 등 특정 목적을 위해 계약된 운영자 및 서비스 제공업체가 일부 정보를 처리할 수 있으며, 이는 항상 해당 서비스 제공에 필요한 범위로 제한되고 각 업체의 개인정보 보호 의무를 따릅니다.",
      "privacy.s9.title": "9. 보안",
      "privacy.s9.body": "CorpoPleno는 처리하는 정보의 맥락과 성격에 적합한 기술적·관리적 조치를 채택하여, 무단 접근, 분실, 변경, 유출 또는 오용으로부터 데이터를 보호하고자 노력합니다. 다만 어떠한 시스템도 위험에서 완전히 자유로울 수는 없으며, CorpoPleno는 이러한 보호 조치를 지속적으로 개선하기 위해 노력하고 있습니다.",
      "privacy.s10.title": "10. 데이터 보관 및 삭제",
      "privacy.s10.body": "개인정보는 본 정책에서 설명한 목적을 이행하는 데 필요한 기간 동안 보관되며, 적용 가능한 법적·규제적 의무, 권리의 정당한 행사, 그리고 법률이 정한 기타 정당한 사유를 고려합니다. 해당 목적이 종료되면 정보는 적절히 삭제되거나 익명화됩니다.",
      "privacy.s11.title": "11. 정보주체의 권리",
      "privacy.s11.body_pre": "관련 법령에 따라, 회원님은 본인의 개인정보에 대한 처리 여부 확인, 열람, 정정, 갱신, 삭제 또는 이동을 요청하실 수 있으며, 공유 내역에 대한 정보를 요청하거나 해당되는 경우 이전에 제공한 동의를 철회하실 수 있습니다. 이러한 요청은",
      "privacy.s11.body_post": "페이지의 공식 채널을 통해 하실 수 있으며, 요청의 성격에 따라 합리적인 기간 내에 답변드립니다.",
      "privacy.s12.title": "12. 동의 및 환경설정",
      "privacy.s12.body": "특정 처리 활동이 회원님의 동의에 의존하는 경우, 관련 법령에 따라 언제든지 동의를 철회하실 수 있으며, 철회 이전에 이루어진 처리의 적법성에는 영향을 미치지 않습니다. 본 정책에서 설명하는 모든 활동이 동의에 의존하는 것은 아니며, 일부는 다른 적용 가능한 법적 근거에 따라 이루어질 수 있습니다.",
      "privacy.s13.title": "13. 아동 및 청소년의 정보",
      "privacy.s13.body": "서비스나 콘텐츠가 아동 또는 청소년을 대상으로 하는 경우, 개인정보 처리는 관련 법적 요건을 준수하며, 필요한 경우 동의 절차나 법정대리인의 참여 조치를 따릅니다. 해당 대상을 위한 기능이 제공되기 전에 본 정책을 미리 업데이트하겠습니다.",
      "privacy.s14.title": "14. 국제 이전 및 서비스",
      "privacy.s14.body": "특정 서비스가 국외에 위치한 제공업체나 인프라를 포함하는 경우, CorpoPleno는 해당 유형의 처리에 적용되는 개인정보 보호 법령에 부합하는 보호 조치를 채택하고자 노력할 것입니다.",
      "privacy.s15.title": "15. 본 정책의 업데이트",
      "privacy.s15.body": "본 개인정보 처리방침은 제공되는 서비스, 관련 법령 또는 CorpoPleno가 채택하는 관행의 변화를 반영하여 업데이트될 수 있습니다. 주기적으로 확인하시길 권장합니다.",
      "privacy.s16.title": "16. 권리 행사 및 문의 채널",
      "privacy.s16.body": "본 정책에 대한 문의나 개인정보와 관련된 요청은 corpoplenoresultadoreal@gmail.com 이메일 또는 CorpoPleno 공식 왓츠앱으로 보내주시기 바랍니다.",
      "privacy.section1.title": "1. 제공할 수 있는 정보",
      "privacy.section1.body": "사이트에서 제공되는 가입, 고객지원 또는 구매 양식을 이용할 때 이름, 이메일, 전화번호 등 필요한 정보를 제공하실 수 있습니다.",
      "privacy.section2.title": "2. 정보 이용 목적",
      "privacy.section2.body": "제공된 정보는 계정 생성 및 관리, 고객지원 응대, 구매하신 제품과 강좌에 대한 접근 제공 등 요청하신 서비스를 제공하기 위한 목적으로만 사용됩니다.",
      "privacy.section3.title": "3. 가입 및 계정",
      "privacy.section3.body": "CorpoPleno 계정을 만들면, 입력하신 정보는 회원님을 식별하고, 마이페이지에 접근할 수 있도록 하며, 계정에 연결된 제품과 강좌 내역을 관리하는 데 사용됩니다.",
      "privacy.section4.title": "4. 고객지원",
      "privacy.section4.body": "고객지원 채널을 통해 보내주신 정보는 문의 내용을 이해하고 답변하기 위한 목적으로만 사용됩니다.",
      "privacy.section5.title": "5. 구매 및 제품 접근",
      "privacy.section5.body": "구매를 처리하고 구매하신 제품이나 강좌에 대한 접근을 제공하는 데 필요한 정보는 그 목적으로만 처리됩니다.",
      "privacy.section6.title": "6. 보안",
      "privacy.section6.body": "CorpoPleno는 처리하는 개인정보를 보호하기 위해 합리적인 기술적·관리적 조치를 취하며, 무단 접근이나 정보의 분실·오용을 예방하고자 노력합니다.",
      "privacy.section7.title": "7. 쿠키 및 환경설정",
      "privacy.section7.body": "CorpoPleno는 탐색 경험을 개선하기 위해 선택하신 언어 등 일부 사용자 환경설정을 저장할 수 있습니다. 이러한 설정은 언제든지 브라우저 설정에서 삭제하실 수 있습니다.",
      "privacy.section8.title": "8. 정보 공유",
      "privacy.section8.body": "개인정보는 결제 대행업체나 호스팅 제공업체 등 제공되는 서비스를 위해 꼭 필요한 경우에만 제3자와 공유되며, 각 업체는 자체 개인정보 보호 및 보안 정책을 따릅니다.",
      "privacy.section9.title": "9. 정보주체의 권리",
      "privacy.section9.body_pre": "회원님은 본인의 개인정보에 대한 확인, 열람, 정정, 삭제를 요청하실 수 있으며, 이전에 제공하신 동의를 철회하실 수도 있습니다. 이를 원하시면",
      "privacy.section9.body_post": "페이지의 채널로 문의해 주세요.",
      "privacy.section10.title": "10. 정책 업데이트",
      "privacy.section10.body": "본 개인정보 처리방침은 CorpoPleno의 서비스가 발전함에 따라 업데이트될 수 있습니다. 주기적으로 확인하시길 권장합니다.",

      "legal.pending_review": "본 문서는 정식 운영 전 법률 검토 및 업데이트가 필요합니다.",
    },

    "es-CL": {
      "catalog.empty_state": "Estamos preparando novedades para ti.",
      skip_link: "Saltar al contenido principal",
      lang_label: "Seleccionar idioma",

      "nav.home": "Inicio",
      "nav.products": "Productos",
      "nav.courses": "Cursos",
      "nav.about": "Nosotros",
      "nav.support": "Atención",
      "nav.account": "Mi cuenta",
      "nav.login": "Iniciar sesión",
      "login.hero.eyebrow": "Acceso a tu cuenta",
      "login.hero.title": "Iniciar sesión",
      "login.hero.lead": "Inicia sesión en tu cuenta CorpoPleno para ver tus productos y cursos.",
      "login.form.email_label": "Correo electrónico",
      "login.form.password_label": "Contraseña",
      "login.form.submit": "Iniciar sesión",
      "login.form.forgot": "Olvidé mi contraseña",
      "login.form.no_account": "Todavía no tengo cuenta —",
      "login.form.create_account_link": "Crear cuenta",
      "auth.form.pending": "El acceso seguro a tu cuenta está siendo preparado. Muy pronto podrás iniciar sesión de verdad.",
      "signup.hero.eyebrow": "Cuenta nueva",
      "signup.hero.title": "Crea tu cuenta",
      "signup.hero.lead": "Completa tus datos para crear tu cuenta CorpoPleno.",
      "signup.form.name_label": "Nombre",
      "signup.form.email_label": "Correo electrónico",
      "signup.form.phone_label": "Teléfono",
      "signup.form.password_label": "Contraseña",
      "signup.form.confirm_password_label": "Confirmar contraseña",
      "signup.form.terms_prefix": "Leí y acepto los",
      "signup.form.terms_middle": "y la",
      "signup.form.submit": "Crear cuenta",
      "signup.form.have_account": "Ya tengo cuenta —",
      "signup.form.login_link": "Iniciar sesión",
      "account.hero.title": "Mi cuenta",
      "account.redirect.message": "Para acceder a tu cuenta, necesitas iniciar sesión.",
      "account.redirect.cta": "Iniciar sesión",
      "nav.terms": "Términos",
      "nav.privacy": "Privacidad",
      "nav.aria_label": "Navegación principal",
      "nav_toggle.open_label": "Abrir menú",

      "brand.slogan": "Inteligente, resultado real",

      "common.in_preparation": "En preparación",
      "common.available": "Disponible",
      "common.bonus_tag": "Bono",
      "common.checkout_button": "Ver oferta",
      "common.checkout_pending": "Pago en configuración",
      "common.learn_more": "Saber más",
      "common.price_unavailable": "Precio no disponible en este mercado.",
      "common.partial_notice":
        "Esta página todavía está disponible por completo solo en portugués de Brasil. La traducción completa está en preparación.",
      "whatsapp.float_label": "Hablar con CorpoPleno por WhatsApp",
      "whatsapp.initial_message":
        "¡Hola! Vengo del sitio de CorpoPleno y quisiera recibir atención.",
      "account.pending_toast":
        "Área del cliente en preparación. El inicio de sesión real se conectará en el futuro a un backend seguro — no existe autenticación en esta versión.",

      "footer.about.title": "CorpoPleno",
      "footer.about.body":
        "Educación, tecnología y cuidado reunidos para una experiencia CorpoPleno simple, accesible y responsable.",
      "footer.about.cnpj": "Registro empresarial brasileño (CNPJ): 68.987.084/0001-32",
      "footer.about.location": "São Paulo, Brasil",
      "footer.links.title": "Navegación",
      "footer.legal.title": "Legal",
      "footer.contact.title": "Contacto",
      "footer.contact.email_label": "Correo electrónico",
      "footer.contact.whatsapp_label": "WhatsApp",
      "footer.contact.whatsapp_link_label": "Hablar por WhatsApp",
      "footer.contact.pending": "Canal en configuración",

      "legal.company_id.title": "Identificación de la empresa",
      "legal.company_id.brand_label": "Marca",
      "legal.company_id.cnpj_label": "CNPJ (registro empresarial brasileño)",
      "legal.company_id.location_label": "Ubicación pública",
      "legal.company_id.site_label": "Sitio web",
      "legal.company_id.review_note":
        "Información legal adicional (como la razón social y la dirección registrada completa) todavía será confirmada mediante revisión legal/empresarial antes de la operación definitiva.",
      "footer.language.title": "Idioma",
      "footer.copyright": "© 2026 CorpoPleno. Todos los derechos reservados.",

      "home.hero.eyebrow": "CorpoPleno",
      "home.hero.title": "Una base clara para una vida más plena",
      "home.hero.slogan": "Inteligente, resultado real",
      "home.hero.lead":
        "Reunimos productos, cursos y materiales organizados con metodología, tecnología y revisión de contenido, para que avances con claridad, a tu propio ritmo.",
      "home.hero.cta_primary": "Conocer productos",
      "home.hero.cta_secondary": "Conocer CorpoPleno",
      "home.hero.chip3": "Tecnología",
      "home.hero.chip4": "Confianza",

      "characters.eyebrow": "Nuestro equipo",
      "characters.title": "Personajes CorpoPleno",
      "characters.ester.name": "Ester",
      "characters.ester.desc": "Guía el recorrido CorpoPleno con atención y buen humor.",
      "characters.ester.hero_alt": "Ester sonriendo frente a su portátil, con Mimi (gata), Ping (perro) y Pipo (loro) cerca, en un ambiente luminoso y alegre",
      "characters.mimi.name": "Mimi",
      "characters.mimi.desc": "Curiosa y observadora, siempre atenta a los detalles.",
      "characters.ping.name": "Ping",
      "characters.ping.desc": "Compañero leal, con energía para el día a día.",
      "characters.pipo.name": "Pipo",
      "characters.pipo.desc": "Alegre y conversador, le da liviandad a cada charla.",

      "home.intro.eyebrow": "Conoce CorpoPleno",
      "home.intro.title": "Qué es CorpoPleno",
      "home.intro.body":
        "CorpoPleno organiza conocimiento y herramientas con propósito, metodología propia y un compromiso continuo con la calidad, uniendo educación, tecnología y cuidado.",
      "home.intro.point1.title": "Propósito claro",
      "home.intro.point1.desc":
        "Ayudar a las personas a organizar su salud, aprendizaje y rutina con información confiable.",
      "home.intro.point2.title": "Metodología propia",
      "home.intro.point2.desc":
        "Contenidos estructurados en etapas, revisados antes de su publicación.",
      "home.intro.point3.title": "Tecnología al servicio de las personas",
      "home.intro.point3.desc":
        "Herramientas simples y directas, sin complicar lo que puede ser fácil.",
      "home.intro.point4.title": "Organización y revisión continua",
      "home.intro.point4.desc":
        "Cada material pasa por revisión antes de llegar a ti.",
      "home.intro.cta": "Leer más sobre CorpoPleno",

      "home.explore.eyebrow": "Explora",
      "home.explore.title": "Explora CorpoPleno",
      "home.explore.lead": "Elige por dónde empezar.",
      "home.explore.produtos.title": "Productos",
      "home.explore.produtos.desc": "Materiales, autocuidado y soluciones organizadas por categoría.",
      "home.explore.produtos.cta": "Conoce los productos CorpoPleno →",
      "home.explore.cursos.title": "Cursos",
      "home.explore.cursos.desc": "Formación estructurada, desde idiomas hasta cursos técnicos.",
      "home.explore.cursos.cta": "Conoce los cursos CorpoPleno →",
      "home.explore.miniapps.title": "Mini Apps",
      "home.explore.miniapps.desc": "Herramientas interactivas para tu día a día.",
      "home.explore.miniapps.cta": "Explorar Mini Apps →",
      "home.explore.atendimento.title": "Atención",
      "home.explore.atendimento.desc": "¿Necesitas ayuda? Encuentra el canal ideal para tu solicitud.",
      "home.explore.atendimento.cta": "Hablar con atención al cliente →",


      "home.support.eyebrow": "Aquí para ayudar",
      "home.support.title": "Atención CorpoPleno",
      "home.support.desc": "¿Necesitas ayuda? Encuentra el canal ideal para tu solicitud.",
      "home.support.cta": "Hablar con atención al cliente",

      "home.faq.eyebrow": "Preguntas",
      "home.faq.title": "Preguntas frecuentes",
      "home.faq.q1": "¿Cómo recibo mis productos después de la compra?",
      "home.faq.a1":
        "En cuanto se confirme la compra, recibirás las instrucciones de acceso por correo. Hoy ningún producto está publicado — esto se activará cuando el catálogo sea liberado.",
      "home.faq.q2": "¿Cómo funciona la atención al cliente?",
      "home.faq.a2":
        "Cuéntanos tu duda en la página de Atención — CorpoPleno se encarga desde ahí.",
      "home.faq.q3": "¿Cómo funciona la cancelación o el reembolso?",
      "home.faq.a3":
        "Abre tu solicitud en la página de Atención; puede ser necesaria una verificación adicional antes de la confirmación.",
      "home.faq.q4": "¿Cómo accedo a mi cuenta?",
      "home.faq.a4":
        "Usa el botón \"Mi cuenta\" en la parte superior del sitio. El inicio de sesión real se conectará pronto.",

      "home.cta.title": "Conoce el universo CorpoPleno",
      "home.cta.body": "Explora productos, cursos y experiencias desarrolladas para acompañar distintos momentos de tu camino.",
      "home.cta.button": "Explorar CorpoPleno",


      "products.hero.eyebrow": "Catálogo CorpoPleno",
      "products.hero.title": "Productos",
      "products.hero.lead":
        "Categorías organizadas para recibir los productos CorpoPleno. Los ítems aún no lanzados aparecen como \"En preparación\": nada aquí está disponible para compra hasta que el checkout oficial esté conectado.",
      "products.notice":
        "Aún no se ha configurado ningún enlace de checkout. Los botones de compra que aparecen a continuación están desactivados intencionalmente.",
      "products.category_empty":
        "Todavía no hay ningún producto aprobado para exhibición pública en esta categoría.",
      "products.filter.all": "Todas las categorías",
      "products.filter.ebooks": "eBooks",
      "products.filter.livros": "Libros",
      "products.filter.miniapps": "Mini apps",
      "products.filter.autocuidado": "Autocuidado",
      "products.filter.natural": "CorpoPleno Natural",
      "products.filter.capilares": "Materiales capilares",
      "products.filter.nutricao": "Nutrición",

      "courses.hero.eyebrow": "Formación CorpoPleno",
      "courses.hero.title": "Cursos",
      "courses.hero.lead":
        "Área preparada para los cursos CorpoPleno. La información sobre carga horaria, contenido y certificación de cada curso se presentará en la página específica antes de la matrícula.",
      "courses.notice":
        "Todavía no hay cursos publicados.",
      "courses.filter.all": "Todas las categorías",
      "courses.filter.idiomas": "Idiomas",
      "courses.filter.empresarial": "Empresarial",
      "courses.filter.tecnicos": "Técnicos",
      "courses.filter.curtos": "Cursos cortos",
      "courses.filter.libras": "Lengua de señas brasileña (contenido adicional)",
      "courses.category_empty": "Ningún curso aprobado para exhibición pública en esta categoría todavía.",
      "courses.category.idiomas.body":
        "Los cursos de idiomas están en planificación, incluyendo los cursos principales con una carga horaria estimada de 12 meses. Ningún curso de idioma ha sido aprobado para lanzamiento público todavía — nombres, fechas y valores se anunciarán después de la aprobación final.",
      "courses.libras.title": "Lengua de señas brasileña (Libras) — contenido adicional",
      "courses.libras.body":
        "Libras no se vende como un curso independiente. Es un contenido adicional, que se desbloquea para quienes compren un curso CorpoPleno elegible — el desbloqueo dependerá del registro real de la compra una vez que los cursos estén publicados.",

      "about.hero.eyebrow": "Institucional",
      "about.hero.title": "Qué es CorpoPleno",
      "about.hero.lead": "CorpoPleno reúne conocimiento, educación, tecnología y cuidado en soluciones creadas para hacer que el aprendizaje y el día a día sean más claros, organizados y accesibles.",
      "about.hero.photo_alt": "Ester sonriendo frente a su portátil, con Mimi (gata), Ping (perro) y Pipo (loro) cerca",
      "about.essence.eyebrow": "Quiénes somos",
      "about.essence.title": "Nuestra esencia",
      "about.essence.body": "CorpoPleno nació para transformar el conocimiento en experiencias más simples de comprender, aplicar y seguir. Organizamos contenidos, herramientas y soluciones con claridad, responsabilidad y atención a la experiencia de cada persona.",
      "about.pillars.eyebrow": "Lo que nos guía",
      "about.pillars.title": "Pilares CorpoPleno",
      "about.pillars.item1.title": "Conocimiento con propósito",
      "about.pillars.item1.body": "Contenidos pensados para ayudar a las personas a aprender, organizarse y tomar decisiones con más claridad.",
      "about.pillars.item2.title": "Calidad y responsabilidad",
      "about.pillars.item2.body": "Buscamos presentar información clara, consistente y respaldada por referencias adecuadas al tema.",
      "about.pillars.item3.title": "Tecnología que simplifica",
      "about.pillars.item3.body": "Usamos tecnología para hacer que los contenidos y las herramientas sean más accesibles, intuitivos y fáciles de usar.",
      "about.pillars.item4.title": "Evolución continua",
      "about.pillars.item4.body": "Los productos, materiales y experiencias de CorpoPleno se desarrollan y mejoran continuamente, respetando cada etapa antes de su disponibilidad.",
      "about.content.eyebrow": "Cómo producimos",
      "about.content.title": "Contenido desarrollado con responsabilidad",
      "about.content.body": "Los contenidos de CorpoPleno se estructuran a partir de investigación, fuentes confiables, documentos oficiales y referencias bibliográficas cuando corresponde al tema. El compromiso es transformar información en materiales organizados, originales y útiles, respetando la autoría, la propiedad intelectual y las buenas prácticas de producción de contenido.",
      "about.education.title": "Educación y aprendizaje",
      "about.education.body": "Los cursos y materiales se desarrollan para apoyar el aprendizaje de forma práctica, organizada y accesible.",
      "about.technology.eyebrow": "Tecnología",
      "about.technology.title": "Tecnología a favor de las personas",
      "about.technology.body": "La tecnología es parte de CorpoPleno como un medio para facilitar experiencias, organizar el conocimiento y acercar a las personas a herramientas útiles para aprender, cuidarse y evolucionar a su propio ritmo.",
      "about.transparency.eyebrow": "Compromiso",
      "about.transparency.title": "Transparencia en cada etapa",
      "about.transparency.body": "Presentamos productos y contenidos de acuerdo con su etapa real de disponibilidad. La información, los resultados y los recursos solo se dan a conocer cuando pueden presentarse de forma responsable y verificable.",

      "support.hero.eyebrow": "Atención",
      "support.hero.title": "Atención CorpoPleno",
      "support.hero.lead": "Estamos aquí para ayudarte.",
      "support.form.title": "Duda sobre el producto",
      "support.form.subtitle": "¿Cómo podemos ayudarte?",
      "support.form.description":
        "Si ya eres nuestro cliente, te pedimos que te identifiques primero en tu mensaje indicando el correo y el teléfono utilizados en la compra y, después, describas tu duda o solicitud. Si todavía no eres cliente y te gustaría conocer nuestros productos, puedes resolver tus dudas por el ícono de WhatsApp en la esquina inferior derecha de la página.",
      "support.form.placeholder": "Escribe aquí...",
      "support.form.send": "ENVIAR",
      "support.form.pending":
        "Este canal de envío directo se está preparando con seguridad. En cuanto esté listo, tu mensaje irá directamente a la atención CorpoPleno.",
      "support.form.pending_whatsapp": "Mientras tanto, también puedes hablar con nosotros por WhatsApp.",

      "terms.hero.eyebrow": "Documento legal",
      "terms.hero.title": "Términos de Uso",
      "terms.updated": "Última actualización: 25 de septiembre de 2026.",
      "terms.section1.title": "1. Aceptación de los términos",
      "terms.section1.body": "Al acceder y utilizar el sitio CorpoPleno, aceptas estos Términos de Uso. Si no estás de acuerdo con algún punto, te recomendamos no utilizar el sitio hasta que tus dudas sean aclaradas por los canales de atención.",
      "terms.section2.title": "2. Sobre los productos y cursos",
      "terms.section2.body": "Este sitio presenta productos, cursos y materiales organizados por categoría. Los ítems que aún no están disponibles para adquirir se identifican claramente como tal.",
      "terms.section3.title": "3. Uso permitido",
      "terms.section3.body": "El contenido de este sitio está disponible para uso personal y no comercial, salvo autorización expresa de CorpoPleno. Está prohibido copiar, redistribuir o modificar el contenido sin permiso.",
      "terms.section4.title": "4. Certificados",
      "terms.section4.body": "Cuando corresponda, la información sobre certificado, duración, requisitos y condiciones de cada curso se presentará en la página específica del curso.",
      "terms.section5.title": "5. Pagos",
      "terms.section5.body": "Los pagos podrán ser procesados por proveedores de pago contratados por CorpoPleno, según se informe en el momento de la compra. Los datos de pago podrán ser procesados directamente por los proveedores utilizados en la transacción, conforme a sus propias políticas de privacidad y seguridad.",
      "terms.refund.title": "6. Derecho de retracto, cancelación y reembolso",
      "terms.refund.body1": "En las contrataciones realizadas por medios electrónicos y llevadas a cabo en Brasil, se aplica la legislación brasileña cuando corresponda —en particular el artículo 49 del Código de Defensa del Consumidor (Ley N.º 8.078/1990) y el Decreto N.º 7.962/2013—, conforme a la cual el consumidor puede ejercer el derecho legal de retracto dentro del plazo de 7 (siete) días, contado según lo establecido por la legislación aplicable a la contratación. Cuando este derecho se ejerza regularmente dentro del plazo legal, los valores pagados serán reembolsados conforme a lo previsto por la legislación aplicable.",
      "terms.refund.body2": "Una vez finalizado el plazo legal de retracto, no habrá reembolso por simple cambio de voluntad o arrepentimiento sin justificación, salvo en los casos en que la legislación aplicable otorgue al consumidor otros derechos —como vicio, defecto, falla en la prestación del servicio, producto o contenido distinto del ofrecido, incumplimiento de la oferta, cobro indebido, no entrega o imposibilidad de acceso causada por CorpoPleno, entre otras hipótesis previstas por la legislación aplicable.",
      "terms.refund.body3": "Esta sección se aplica, en lo que corresponda, a los productos y servicios digitales de CorpoPleno, incluyendo eBooks, libros digitales, cuadernillos, materiales educativos, cursos, mini-apps, herramientas digitales, suscripciones y demás productos y servicios digitales que puedan ofrecerse en el futuro. Las condiciones específicas de cada producto podrán presentarse en su respectiva página de venta, en el checkout o en el contrato/licencia aplicable, y los derechos previstos por la ley prevalecerán siempre sobre cualquier regla comercial interna incompatible con ellos.",
      "terms.refund.body4": "El ejercicio del derecho legal de retracto dentro del plazo aplicable, la cancelación de una suscripción o servicio recurrente y la solicitud de reembolso tras el término del plazo de retracto son situaciones distintas, sujetas a condiciones propias. Para las suscripciones de CorpoPleno, cuando estén disponibles, la posibilidad de cancelación seguirá las condiciones específicas presentadas al consumidor antes de la contratación.",
      "terms.refund.body5": "Podrán detallarse reglas adicionales sobre cancelación, retracto y reembolso en una política específica, una vez publicada, sin perjuicio de lo dispuesto en esta sección y en la legislación aplicable.",
      "terms.section6.title": "7. Cuentas y acceso",
      "terms.section6.body": "El acceso a determinadas áreas del sitio, como el área de cliente, puede requerir la creación de una cuenta. Eres responsable de mantener la confidencialidad de tus datos de acceso y de todas las actividades realizadas en tu cuenta.",
      "terms.section7.title": "8. Limitación de responsabilidad",
      "terms.section7.body": "Hacemos lo posible por mantener la información de este sitio precisa y actualizada, pero no garantizamos la ausencia total de errores. En caso de discrepancias, los canales de atención están disponibles para aclaraciones.",
      "terms.section8.title": "9. Cambios a estos términos",
      "terms.section8.body": "Estos Términos de Uso podrán actualizarse a medida que evolucionen los servicios de CorpoPleno. Recomendamos revisarlos periódicamente.",
      "terms.section9.title": "10. Contacto",
      "terms.section9.body_pre": "Las dudas sobre estos términos pueden enviarse por los canales indicados en la página de",
      "terms.section9.body_post": ".",

      "privacy.hero.eyebrow": "Documento legal",
      "privacy.hero.title": "Política de Privacidad",
      "privacy.updated": "Última actualización: 25 de septiembre de 2026.",
      "privacy.s1.title": "1. Sobre esta Política",
      "privacy.s1.body": "Esta Política de Privacidad describe cómo puede tratarse la información relacionada con las personas que utilizan los servicios de CorpoPleno, y cuáles son los derechos y canales disponibles para aclarar dudas sobre ese tratamiento. El tratamiento de datos personales relacionado con los servicios de CorpoPleno observará la legislación aplicable, incluyendo, en la operación en Brasil, la Ley General de Protección de Datos Personales — LGPD (Ley N.º 13.709/2018), cuando corresponda.",
      "privacy.s2.title": "2. Qué información puedes proporcionar",
      "privacy.s2.body": "Puedes proporcionarnos información como nombre, correo electrónico, teléfono y otra información enviada voluntariamente en nuestros canales de atención. Cuando las funciones de registro y cuenta estén efectivamente disponibles, también podrá solicitarse la información necesaria para crear y administrar tu cuenta. Del mismo modo, cuando la adquisición de productos y cursos esté disponible, podrá tratarse la información necesaria para identificar la compra y habilitar el acceso correspondiente.",
      "privacy.s3.title": "3. Finalidades del tratamiento",
      "privacy.s3.body": "La información proporcionada puede utilizarse, según corresponda a cada función efectivamente disponible, para: prestar atención y responder solicitudes; crear y administrar cuentas de usuario; permitir el acceso a productos y cursos adquiridos; procesar solicitudes relacionadas con los servicios de CorpoPleno; comunicar información relevante sobre los servicios utilizados; cumplir obligaciones legales y regulatorias aplicables; proteger la seguridad de la plataforma; y registrar preferencias necesarias para la experiencia de navegación, como el idioma seleccionado.",
      "privacy.s4.title": "4. Registro y cuenta",
      "privacy.s4.body": "Cuando la función de creación de cuenta esté disponible, la información proporcionada en ese proceso se utilizará para identificarte, habilitar el acceso a tu área de cliente y mantener el historial de productos y cursos asociados a tu cuenta. CorpoPleno adopta prácticas técnicas y organizativas orientadas a proteger esta información.",
      "privacy.s5.title": "5. Compras y acceso a los productos",
      "privacy.s5.body": "Cuando la adquisición de productos y cursos esté disponible, cierta información podrá tratarse para identificar la compra, procesarla, habilitar el acceso al contenido adquirido y prestar soporte relacionado con esa adquisición. La información de pago, cuando corresponda, podrá ser tratada directamente por los proveedores de servicios de pago utilizados en la transacción, conforme a las propias políticas de privacidad y seguridad de dichos proveedores.",
      "privacy.s5.body2_pre": "Las solicitudes de cancelación, ejercicio del derecho de retracto, reembolso, reclamos u otras solicitudes relacionadas con compras podrán requerir el tratamiento de los datos personales necesarios para identificar al titular, localizar la compra, confirmar la contratación, procesar la solicitud, registrar la atención y cumplir con las obligaciones legales o regulatorias aplicables. Las reglas comerciales sobre cancelación, retracto y reembolso constan en los",
      "privacy.s5.body2_post": ", y, cuando se publique, en una política específica sobre la materia.",
      "privacy.s6.title": "6. Atención al cliente",
      "privacy.s6.body": "La información enviada a través de los canales oficiales de atención de CorpoPleno — como correo electrónico y WhatsApp — se utiliza exclusivamente para comprender, registrar y responder la solicitud presentada.",
      "privacy.s7.title": "7. Cookies, almacenamiento y preferencias",
      "privacy.s7.body": "CorpoPleno podrá utilizar tecnologías de almacenamiento y preferencias del navegador para recordar configuraciones como el idioma seleccionado, con el fin de mejorar la experiencia de navegación. Esta información puede eliminarse en cualquier momento directamente desde la configuración del navegador utilizado.",
      "privacy.s8.title": "8. Compartición con terceros",
      "privacy.s8.body": "CorpoPleno no comparte información personal de forma indiscriminada. Cuando sea necesario para habilitar los servicios ofrecidos, cierta información podrá ser tratada por operadores y proveedores de servicios contratados para fines específicos, como procesamiento de pagos, alojamiento, infraestructura, comunicación o soporte tecnológico, siempre limitada a lo necesario para la prestación del servicio correspondiente y sujeta a sus propias obligaciones de protección de datos.",
      "privacy.s9.title": "9. Seguridad",
      "privacy.s9.body": "CorpoPleno adopta medidas técnicas y organizativas adecuadas al contexto y a la naturaleza de la información tratada, buscando proteger los datos contra accesos no autorizados, pérdida, alteración, divulgación o uso indebido. Ningún sistema, sin embargo, está exento de riesgos, y CorpoPleno trabaja continuamente para mejorar estas medidas de protección.",
      "privacy.s10.title": "10. Conservación y eliminación de datos",
      "privacy.s10.body": "La información personal se conserva durante el período necesario para cumplir las finalidades descritas en esta Política, considerando eventuales obligaciones legales y regulatorias aplicables, el ejercicio regular de derechos y otras hipótesis legítimas previstas por la ley. Una vez cumplidas esas finalidades, la información se elimina o anonimiza, según corresponda.",
      "privacy.s11.title": "11. Derechos del titular",
      "privacy.s11.body_pre": "Conforme a la legislación aplicable, puedes solicitar la confirmación de la existencia de tratamiento, el acceso, la corrección, la actualización, la eliminación o la portabilidad de tus datos personales, así como obtener información sobre la compartición realizada y, cuando corresponda, retirar consentimientos previamente otorgados. Estas solicitudes pueden realizarse a través de los canales oficiales de",
      "privacy.s11.body_post": ", y serán respondidas dentro de un plazo razonable, según la naturaleza de cada solicitud.",
      "privacy.s12.title": "12. Consentimiento y preferencias",
      "privacy.s12.body": "Cuando una determinada actividad de tratamiento dependa de tu consentimiento, este podrá retirarse en cualquier momento, conforme a la legislación aplicable, sin afectar la licitud del tratamiento realizado antes de la retirada. No todas las actividades descritas en esta Política dependen del consentimiento, ya que algunas pueden fundarse en otras bases legales aplicables.",
      "privacy.s13.title": "13. Datos de niños, niñas y adolescentes",
      "privacy.s13.body": "Cuando un servicio o contenido involucre a niños, niñas o adolescentes, el tratamiento de datos personales observará los requisitos legales aplicables y, cuando sea necesario, las medidas de consentimiento o la participación del representante legal. Esta Política se actualizará antes de la disponibilización de cualquier función dirigida a ese público.",
      "privacy.s14.title": "14. Transferencias y servicios internacionales",
      "privacy.s14.body": "Si determinados servicios involucran proveedores o infraestructura ubicados fuera del país, CorpoPleno buscará adoptar salvaguardas compatibles con la legislación de protección de datos aplicable a ese tipo de tratamiento.",
      "privacy.s15.title": "15. Actualizaciones de esta Política",
      "privacy.s15.body": "Esta Política de Privacidad podrá actualizarse para reflejar cambios en los servicios ofrecidos, en la legislación aplicable o en las prácticas adoptadas por CorpoPleno. Recomendamos revisar esta página periódicamente.",
      "privacy.s16.title": "16. Canales para ejercer derechos y resolver dudas",
      "privacy.s16.body": "Las dudas sobre esta Política o las solicitudes relacionadas con tus datos personales pueden enviarse al correo corpoplenoresultadoreal@gmail.com o por el WhatsApp oficial de CorpoPleno.",
      "privacy.section1.title": "1. Qué datos puedes proporcionar",
      "privacy.section1.body": "Puedes proporcionarnos datos como nombre, correo electrónico, teléfono y otra información necesaria al usar los formularios de registro, atención o compra disponibles en el sitio.",
      "privacy.section2.title": "2. Finalidad del uso de los datos",
      "privacy.section2.body": "Los datos proporcionados se usan exclusivamente para permitir los servicios solicitados, como crear y gestionar tu cuenta, responder a la atención al cliente y habilitar el acceso a los productos y cursos adquiridos.",
      "privacy.section3.title": "3. Registro y cuenta",
      "privacy.section3.body": "Al crear una cuenta CorpoPleno, los datos indicados se usan para identificarte, darte acceso a tu área de cliente y mantener el historial de los productos y cursos vinculados a tu cuenta.",
      "privacy.section4.title": "4. Atención al cliente",
      "privacy.section4.body": "La información enviada por los canales de atención se usa únicamente para comprender y responder tu solicitud.",
      "privacy.section5.title": "5. Compras y acceso a los productos",
      "privacy.section5.body": "Los datos necesarios para procesar una compra y habilitar el acceso al producto o curso adquirido se tratarán solo para esa finalidad.",
      "privacy.section6.title": "6. Seguridad",
      "privacy.section6.body": "CorpoPleno adopta medidas técnicas y organizativas razonables para proteger los datos personales tratados, buscando prevenir accesos no autorizados, pérdida o uso indebido de la información.",
      "privacy.section7.title": "7. Cookies y preferencias",
      "privacy.section7.body": "CorpoPleno podrá almacenar ciertas preferencias del usuario, como el idioma seleccionado, para mejorar la experiencia de navegación. Puedes borrar estas preferencias en cualquier momento desde la configuración de tu navegador.",
      "privacy.section8.title": "8. Compartición de datos",
      "privacy.section8.body": "Los datos personales podrán compartirse con terceros solo cuando sea necesario para habilitar los servicios ofrecidos, como proveedores de pago y de alojamiento, siempre sujetos a sus propias políticas de privacidad y seguridad.",
      "privacy.section9.title": "9. Derechos del titular",
      "privacy.section9.body_pre": "Puedes solicitar la confirmación, el acceso, la corrección o la eliminación de tus datos personales, además de retirar consentimientos entregados previamente, contactándonos por los canales de la página de",
      "privacy.section9.body_post": ".",
      "privacy.section10.title": "10. Actualización de esta política",
      "privacy.section10.body": "Esta Política de Privacidad podrá actualizarse a medida que evolucionen los servicios de CorpoPleno. Recomendamos revisarla periódicamente.",

      "legal.pending_review":
        "Documento sujeto a revisión legal y actualización antes de la operación definitiva.",
    },
  };

  function getStoredLang() {
    try {
      var stored = global.localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) !== -1) {
        return stored;
      }
    } catch (e) {
      /* localStorage indisponível (ex.: navegação privada) — segue sem persistir */
    }
    return null;
  }

  function detectBrowserLang() {
    var nav = global.navigator || {};
    var candidates = nav.languages && nav.languages.length ? nav.languages : [nav.language || ""];
    for (var i = 0; i < candidates.length; i++) {
      var c = (candidates[i] || "").toLowerCase();
      if (c.indexOf("pt-pt") === 0) return "pt-PT";
      if (c.indexOf("pt") === 0) return "pt-BR";
      if (c.indexOf("en") === 0) return "en-US";
      if (c.indexOf("ko") === 0) return "ko-KR";
      if (c.indexOf("es") === 0) return "es-CL";
    }
    return null;
  }

  function currentLang() {
    return getStoredLang() || detectBrowserLang() || DEFAULT_LANG;
  }

  function t(key, lang) {
    var table = dict[lang] || dict[DEFAULT_LANG];
    if (Object.prototype.hasOwnProperty.call(table, key)) {
      return table[key];
    }
    return dict[DEFAULT_LANG][key] || key;
  }

  function applyToDom(lang) {
    document.documentElement.setAttribute("lang", lang);

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      nodes[i].textContent = t(key, lang);
    }

    var placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    for (var j = 0; j < placeholders.length; j++) {
      var pKey = placeholders[j].getAttribute("data-i18n-placeholder");
      placeholders[j].setAttribute("placeholder", t(pKey, lang));
    }

    var ariaLabels = document.querySelectorAll("[data-i18n-aria-label]");
    for (var k = 0; k < ariaLabels.length; k++) {
      var aKey = ariaLabels[k].getAttribute("data-i18n-aria-label");
      ariaLabels[k].setAttribute("aria-label", t(aKey, lang));
    }

    /* IMPLEMENTAÇÃO CP-WEB-001 (2026-09-25) — mesmo padrão de
       data-i18n-placeholder/data-i18n-aria-label, para texto alternativo
       de imagens que carregam significado (ex.: a foto da Ester no Hero),
       nunca texto embutido na própria imagem. */
    var altTexts = document.querySelectorAll("[data-i18n-alt]");
    for (var m = 0; m < altTexts.length; m++) {
      var altKey = altTexts[m].getAttribute("data-i18n-alt");
      altTexts[m].setAttribute("alt", t(altKey, lang));
    }

    var notice = document.getElementById("cp-partial-translation-notice");
    if (notice) {
      if (lang !== "pt-BR" && document.body.getAttribute("data-partial-i18n") === "true") {
        notice.textContent = t("common.partial_notice", lang);
        notice.hidden = false;
      } else {
        notice.hidden = true;
      }
    }

    var select = document.getElementById("cp-lang-select");
    if (select && select.value !== lang) {
      select.value = lang;
    }

    /* Avisa outros módulos (ex.: assets/js/markets.js) de que o idioma/
       mercado mudou, para que possam atualizar formatação de moeda e
       valores demonstrativos sem recarregar a página. */
    try {
      global.dispatchEvent(
        new CustomEvent("corpopleno:lang-changed", { detail: { lang: lang } })
      );
    } catch (e) {
      /* CustomEvent indisponível (navegador muito antigo) — segue sem o evento */
    }
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) {
      lang = DEFAULT_LANG;
    }
    try {
      global.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* segue sem persistir preferência */
    }
    applyToDom(lang);
  }

  function init() {
    applyToDom(currentLang());
    var select = document.getElementById("cp-lang-select");
    if (select) {
      select.addEventListener("change", function () {
        setLang(select.value);
      });
    }
  }

  global.CP_I18N = {
    SUPPORTED: SUPPORTED,
    DEFAULT_LANG: DEFAULT_LANG,
    t: t,
    setLang: setLang,
    currentLang: currentLang,
    init: init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
