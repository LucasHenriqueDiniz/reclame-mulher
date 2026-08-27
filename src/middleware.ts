import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { corpoDeErro, STATUS_HTTP } from "@/lib/http/contrato";

/**
 * Portão grosso de autenticação.
 *
 * Este arquivo precisa ficar em `src/middleware.ts`. O projeto usa diretório
 * `src/`, e nesse caso o Next só reconhece o middleware ali — na raiz do
 * repositório ele é compilado mas nunca executado.
 *
 * O papel aqui é só "tem sessão ou não tem". Regra fina — papel, posse do
 * recurso, quem pode ler o quê — continua sendo responsabilidade de cada
 * página e de cada route handler, que já fazem isso com contexto que o
 * middleware não tem.
 *
 * A lista abaixo é a única exceção ao portão, então ela falha fechado: rota
 * nova nasce protegida, e só vira pública se alguém a colocar aqui de
 * propósito.
 */

/** Páginas abertas a quem não tem sessão. */
const PUBLIC_PAGES = [
  "/",
  "/login",
  "/register",
  "/auth/",
  "/onboarding",
  "/blog",
  "/search",
  "/companies",
  "/empresas",
  "/company/",
  "/privacy",
  "/terms",
  "/ajuda",
];

/**
 * APIs abertas por design. As demais rotas de API passam pelo portão, mas
 * cada handler ainda faz a própria checagem de papel e de posse — o
 * middleware aqui é rede de segurança, não a autorização em si.
 */
const PUBLIC_APIS = [
  "/api/auth/",
  "/api/me",
  "/api/blog/",
  "/api/companies",
  "/api/complaints", // GET lista só reclamações públicas; POST exige sessão no handler
  "/api/search",
  "/api/uploadthing",
];

function matches(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    // "/" é a home, e só ela — sem este caso, o startsWith abaixo casaria com
    // qualquer caminho e deixaria o site inteiro público.
    if (route === "/") return pathname === "/";
    // Rota terminada em "/" é prefixo ("/auth/" cobre "/auth/verify").
    if (route.endsWith("/")) return pathname.startsWith(route);
    // As demais casam exatamente, ou como segmento inteiro.
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute =
    matches(pathname, PUBLIC_PAGES) || matches(pathname, PUBLIC_APIS);

  const session = await getSessionFromRequest(request);

  if (!session && !isPublicRoute) {
    // Rota de API responde em JSON. Redirecionar para a tela de login faria o
    // cliente receber HTML no lugar de JSON e um 200 no lugar de um 401 — o
    // `response.json()` do front quebraria, e o tratamento de erro nunca
    // veria a falha de autenticação.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(corpoDeErro("UNAUTHENTICATED"), {
        status: STATUS_HTTP.UNAUTHENTICATED,
      });
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (session && (pathname === "/login" || pathname === "/register")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/app";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
