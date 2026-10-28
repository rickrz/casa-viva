// Servidor estático local, sem dependências.
// Uso: node server.mjs [porta]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.join(import.meta.dirname, "dist");
const PORTA = Number(process.argv[2] || process.env.PORT || 4174);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

const servidor = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  let caminho = decodeURIComponent(url.pathname);

  if (caminho.endsWith("/")) caminho += "index.html";
  const arquivo = path.join(RAIZ, caminho);

  if (!arquivo.startsWith(RAIZ)) {
    res.writeHead(403).end("Acesso negado");
    return;
  }

  fs.stat(arquivo, (erro, stat) => {
    let alvo = arquivo;
    if (erro || !stat.isFile()) {
      if (!path.extname(caminho)) {
        const comIndex = path.join(RAIZ, caminho, "index.html");
        if (fs.existsSync(comIndex)) {
          alvo = comIndex;
        } else {
          alvo = path.join(RAIZ, "404.html");
          res.statusCode = 404;
        }
      } else {
        alvo = path.join(RAIZ, "404.html");
        res.statusCode = 404;
      }
    }
    fs.readFile(alvo, (falha, dados) => {
      if (falha) {
        res.writeHead(500).end("Erro interno");
        return;
      }
      const ext = path.extname(alvo).toLowerCase();
      res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
      // html, css e js sempre revalidam para o preview refletir o build;
      // imagens e fontes podem ficar em cache curto.
      const estatico = [".png", ".jpg", ".jpeg", ".webp", ".woff2", ".ico", ".svg"];
      res.setHeader("Cache-Control", estatico.indexOf(ext) > -1 ? "public, max-age=3600" : "no-cache");
      res.end(dados);
    });
  });
});

servidor.listen(PORTA, "127.0.0.1", () => {
  console.log(`\nCasa Viva rodando em http://127.0.0.1:${PORTA}/\n`);
});
