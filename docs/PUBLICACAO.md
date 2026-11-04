# Publicar a demonstração

O repositório é [Arthuroliveiraa/Arthuroliveiraa](https://github.com/Arthuroliveiraa/Arthuroliveiraa). A demonstração foi publicada no GitHub Pages em **04/11/2026**.

- [Abrir demonstração](https://arthuroliveiraa.github.io/Arthuroliveiraa/)
- [Execução bem-sucedida da primeira publicação](https://github.com/Arthuroliveiraa/Arthuroliveiraa/actions/runs/41906540970)

A página, o CSS, os dois scripts e o ícone retornaram HTTP 200 na conferência após a publicação. Os passos abaixo permitem repetir o processo ou adaptar a configuração em um fork.

## Preparação do repositório

Envie o código-fonte, incluindo [os workflows](../.github/workflows/), [a licença](../LICENSE), [a documentação](../README.md) e as capturas. A pasta `dist/` é gerada e está ignorada pelo Git.

O nome do repositório coincide com o usuário. Se esse for um repositório público de perfil do GitHub, o README da raiz também pode aparecer na página do perfil. O nome do projeto pode ser separado posteriormente em outro repositório; os caminhos dos assets são relativos para permitir hospedagem em subpastas.

## Ativar a demonstração

1. No repositório, acesse **Settings → Pages**.
2. Em **Build and deployment**, selecione **GitHub Actions** como fonte.
3. Na aba **Actions**, abra **Publicar demonstração** e execute **Run workflow** na branch com o projeto.
4. O workflow prepara somente os arquivos públicos, executa os testes e publica o artefato no Pages.
5. Confira a URL retornada pelo job de publicação. Abra-a em computador e celular, teste os filtros e prepare uma mensagem com um nome fictício.
6. Adicione a URL verificada à descrição do repositório e ao README e marque a publicação no roteiro como concluída.

A publicação é manual para que cada nova alteração não atualize a demo sem uma execução explícita. Os testes de verificação são executados em push e pull request. O job de publicação só recebe permissões de Pages e identidade de implantação; não usa tokens pessoais no código.

Referência oficial: [workflows personalizados para GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Descrição e tópicos sugeridos

Descrição:

> Site odontológico demonstrativo com HTML, CSS e JavaScript, design responsivo, acessibilidade e testes em navegador.

Tópicos: `portfolio`, `html`, `css`, `javascript`, `responsive-design`, `accessibility`, `github-pages`.

## Atualizar a versão pública

Após mudanças, confira os testes, envie o código e execute novamente **Publicar demonstração**. As capturas do README podem ser atualizadas com os comandos do [guia de execução](../README.md#verificar-o-projeto).

Mantenha `demoMode: true` em [config.js](../js/config.js) para o portfólio. Essa opção mantém os avisos e impede chamadas, WhatsApp e mapa mesmo que alguém preencha dados de contato.
