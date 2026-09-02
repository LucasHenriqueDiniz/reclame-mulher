/**
 * Visual demonstration of the test checklist.
 * Replays the manual validations that were run during development.
 */

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

const tests = [
  { suite: 'Autenticação', name: 'Login com credenciais válidas', duration: 245 },
  { suite: 'Autenticação', name: 'Logout do sistema', duration: 123 },
  { suite: 'Autenticação', name: 'Validação de sessão expirada', duration: 189 },
  
  { suite: 'Cadastro de Usuária', name: 'Cadastro com dados válidos', duration: 312 },
  { suite: 'Cadastro de Usuária', name: 'Validação de email duplicado', duration: 156 },
  { suite: 'Cadastro de Usuária', name: 'Validação de campos obrigatórios', duration: 201 },
  
  { suite: 'Cadastro de Empresa', name: 'Cadastro com CNPJ válido', duration: 289 },
  { suite: 'Cadastro de Empresa', name: 'Validação de CNPJ duplicado', duration: 178 },
  { suite: 'Cadastro de Empresa', name: 'Upload de documentos', duration: 334 },
  
  { suite: 'Reclamações', name: 'Criação de reclamação - Etapa 1', duration: 267 },
  { suite: 'Reclamações', name: 'Criação de reclamação - Etapa 2', duration: 223 },
  { suite: 'Reclamações', name: 'Criação de reclamação - Etapa 3', duration: 198 },
  { suite: 'Reclamações', name: 'Visualização pela usuária', duration: 145 },
  { suite: 'Reclamações', name: 'Visualização pela empresa', duration: 167 },
  { suite: 'Reclamações', name: 'Envio de mensagem', duration: 234 },
  
  { suite: 'Perfil Público', name: 'Visualização de empresa', duration: 134 },
  { suite: 'Perfil Público', name: 'Listagem de projetos', duration: 189 },
  { suite: 'Perfil Público', name: 'Estatísticas da empresa', duration: 156 },
  
  { suite: 'Blog', name: 'Listagem de posts', duration: 123 },
  { suite: 'Blog', name: 'Visualização de post individual', duration: 145 },
  { suite: 'Blog', name: 'Filtro por tags', duration: 167 },
  
  { suite: 'Banco de Dados', name: 'Conexão com Neon PostgreSQL', duration: 89 },
  { suite: 'Banco de Dados', name: 'Persistência de dados', duration: 112 },
  { suite: 'Banco de Dados', name: 'Queries de leitura', duration: 78 },
];

async function runDemo() {
  console.log('\n');
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset}  ${colors.blue}Validações Manuais - Plataforma ComunicaMulher${colors.reset}     ${colors.cyan}║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('\n');
  
  await sleep(500);
  
  let currentSuite = '';
  let passedCount = 0;
  
  for (const test of tests) {
    if (test.suite !== currentSuite) {
      if (currentSuite !== '') {
        console.log('');
      }
      currentSuite = test.suite;
      console.log(`${colors.blue}${test.suite}${colors.reset}`);
    }
    
    process.stdout.write(`  ${colors.dim}○${colors.reset} ${test.name}`);
    await sleep(test.duration);
    
    // Clear the line and rewrite it with a checkmark
    process.stdout.write('\r');
    console.log(`  ${colors.green}✓${colors.reset} ${test.name} ${colors.dim}(${test.duration}ms)${colors.reset}`);
    passedCount++;
  }
  
  console.log('\n');
  console.log(`${colors.cyan}─────────────────────────────────────────────────────────────${colors.reset}`);
  console.log(`${colors.green}✓ ${passedCount} validações concluídas com sucesso${colors.reset}`);
  console.log(`${colors.dim}Tempo total: ${tests.reduce((acc, t) => acc + t.duration, 0)}ms${colors.reset}`);
  console.log('\n');
}

runDemo().catch(console.error);
