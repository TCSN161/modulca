# Blender + Claude pentru sesiunile 3.10 (Sâm 5 dec) și 3.11 (Dum 6 dec)

**Scris**: 26 nov (9.01) · **rescris 27 nov** (9.02). Legendă: ✅ verificat pe PC-ul lui Costin sau pe sursa oficială · 🔸 doar sursă terță · ❓ neverificat.

## 0. Pe scurt

- Eroarea de instalare apare la **ultimul pas**: uv nu poate șterge un folder gol (`pywin32-311.data`). Restul mediului e instalat și **serverul din el pornește și răspunde cu 26 de unelte** ✅ (testat din terminal, 27 nov).
- **Recomandare**: plan B pentru 3.10, serverul oficial legat direct de Claude Code (§3).
- Mai lipsește **add-on-ul din Blender**: pe portul 9876 nu asculta nimic la verificare ✅. Fără el, uneltele „live” nu merg.

## 1. Conectorul oficial (Blender Lab)

| Ce | Valoare | Sursă |
|---|---|---|
| Autor, versiune | Blender Lab, extensie 1.0.1, licență GPL-3.0 | ✅ `manifest.json` instalat · [claude.com/connectors/blender](https://claude.com/connectors/blender) |
| Blender minim | **5.1** | 🔸 [Voyager](https://voyager.so/blog/blender-mcp), [mon38](https://note.com/mon38/n/n206ffba3f728?hl=en) |
| Pe PC | **Blender 5.3** instalat ✅; compatibilitatea add-on-ului cu 5.3 ❓ | |
| Python pentru server | ≥ 3.10 | ✅ `pyproject.toml` |
| Legătura | server MCP (stdio) → socket `localhost:9876` → add-on în Blender; `BLENDER_MCP_HOST` / `BLENDER_MCP_PORT` | ✅ `blmcp/tools_helpers/connection.py` |

**Ce poate** (lista de unelte ✅, din handshake):
- `execute_blender_code`: rulează Python cu acces complet la `bpy`. **Modelarea, materialele, teșirea, coacerea luminii și exportul glTF se fac prin el**; nu există unelte separate pentru ele.
- Inspecție: rezumat de scenă și obiecte, detalii de obiect, fișiere lipsă, biblioteci legate.
- Vedere: capturi de ecran, randare viewport și thumbnail.
- Documentație locală: `search_api_docs`, `search_manual_docs`, `get_python_api_docs`.
- Variante `_for_cli`: deschid un `.blend` cu `blender --background` (fără add-on). Cer `BLENDER_PATH`, fiindcă `blender` nu e în PATH ✅.

**Limite și riscuri**:
- Rulează codul generat de model **fără protecții** (avertismentul Blender, citat de [Voyager](https://voyager.so/blog/blender-mcp) 🔸). Lucrați pe **copii**, salvați înainte, țineți „Always ask” pe execuție.
- Timeout ✅: 300 s pe socket, 120 s în modul CLI. Coacerile lungi pot depăși: coaceți în pași mici.
- Fără bibliotecă de asset-uri sau generare 3D (🔸 Voyager). Alternativa comunitară [mcp-for-blender](https://github.com/ahujasid/mcp-for-blender) le are, dar e terță, cu telemetrie; nu o recomand acum.

**Add-on-ul** (🔸 mon38; pagina oficială refuză accesul automat):
1. Blender → Edit → Preferences → System → Network → **Allow Online Access**.
2. Din [pagina oficială](https://www.blender.org/lab/mcp-server/) trage linkul „Drag & drop into Blender” în fereastra Blender: prima dată adaugă depozitul, a doua oară instalează add-on-ul „MCP”.
3. Preferences → Add-ons → MCP: „Server is running”, `localhost`, `9876`, Auto Start.

## 2. Eroarea de instalare pe Windows

**Ce arată jurnalele** ✅ (`%LOCALAPPDATA%\Claude\Logs\main.log`):
- 4 încercări pe 27 nov (20:34, 20:40, 20:41, 20:44), toate identice: `Failed to install: pywin32-311-cp314-cp314-win_amd64.whl` → `failed to remove directory ...\.venv\Lib\site-packages\pywin32-311.data ... (os error 32)`.
- uv 0.9.7 (livrat de Claude), Python 3.14.0, Claude Desktop 6.28899.6.0 (pachet MSIX/Store).
- 20:36–20:37: `uv.exe ENOENT` și manifest lipsă (alte erori, în jurul reinstalărilor).
- După ultima încercare: folderul `pywin32-311.data\scripts` e gol dar există; `import mcp, win32api, blmcp` merge.

**Cauze raportate** (niciun fix confirmat de un mentenant):

| Ipoteză | Dovadă | Verdict |
|---|---|---|
| Un proces copil al lui Claude ține folderul deschis (handle moștenit); aceeași comandă merge din terminal normal | [claude-code#68858](https://github.com/anthropics/claude-code/issues/68858) (închis de bot) | ipoteza cea mai potrivită, ❓ |
| Claude pornește serverul în timp ce uv încă instalează | [claude-code#38266](https://github.com/anthropics/claude-code/issues/38266), [unity-mcp#1248](https://github.com/CoplayDev/unity-mcp/issues/1248) | posibil, ❓ |
| Antivirus (Defender activ pe PC ✅) | Excluderile **nu au ajutat** în [#68858](https://github.com/anthropics/claude-code/issues/68858) și [claude-ai-mcp#1054](https://github.com/anthropics/claude-ai-mcp/issues/1054) | **nu slăbiți Defender** |
| Python 3.14 | #1054 vede `cp314`; forțarea 3.12 nu a ajutat | puțin probabil singură |
| Smart App Control blochează `blender-mcp.exe` (`os error 4551`) | 🔸 mon38 | altă eroare; la noi exe-ul a pornit ✅. Nu îl opriți |

**Fix raportat ca funcțional**: instalare o singură dată dintr-un terminal normal (`uv tool install`) și config cu calea absolută la `.exe` ([blender-mcp#196](https://github.com/ahujasid/blender-mcp/issues/196), unity-mcp#1248, #68858). Sunt rapoarte ale autorilor, despre servere înrudite.

## 3. Plan B (recomandat): Claude Code, fără extensia desktop

⚠️ **Nu șterge folderul extensiei înainte de pasul 1**: are sursa oficială a serverului (pasul 17 din planul W49 cere ștergerea).

**Pas 1** — PowerShell deschis din Start (nu din Claude). Comanda instalează din sursa de pe disc, cu uv-ul livrat de Claude. ❓ Comanda în sine nu a fost rulată de Radar; descarcă pachete Python.

```powershell
& "$env:APPDATA\Claude\uv-runtime\uv-0.9.7-win32-x64\uv.exe" tool install "$env:APPDATA\Claude\Claude Extensions\ant.dir.gh.blender.blender-mcp"
```

Rezultat așteptat: `%USERPROFILE%\.local\bin\blender-mcp.exe` (calea raportată în issue-uri, ❓ la noi). Alternativa din README-ul oficial livrat cu extensia: `pip install git+https://projects.blender.org/lab/blender_mcp.git` (❓; [Voyager](https://voyager.so/blog/blender-mcp) spune că pachetul e în subfolderul `mcp`).

**Pas 2** — `.mcp.json` în rădăcina proiectului (sesiunea 3.10 îl creează; Radar nu l-a scris). Format după [docs Claude Code](https://code.claude.com/docs/en/mcp); expandarea `${USERPROFILE}` e documentată, dar ❓ netestată la noi:

```json
{
  "mcpServers": {
    "blender": {
      "type": "stdio",
      "command": "${USERPROFILE}\\.local\\bin\\blender-mcp.exe",
      "args": [],
      "env": {
        "BLENDER_PATH": "C:\\Program Files\\Blender Foundation\\Blender 5.3\\blender.exe"
      }
    }
  }
}
```

La prima pornire Claude Code cere aprobarea serverului din proiect. Echivalentul oficial în terminal este `claude mcp add --transport stdio --scope local blender -- <cale>\blender-mcp.exe`, dar comanda `claude` nu e în PATH pe PC ✅.

**Varianta fără instalare** (merge cât există folderul extensiei): `command` = `${APPDATA}\\Claude\\Claude Extensions\\ant.dir.gh.blender.blender-mcp\\.venv\\Scripts\\blender-mcp.exe`. Acest exe e cel testat ✅.

**Pas 3** — Blender deschis cu add-on-ul pornit; în sesiune: `/mcp` arată 26 de unelte; test: „listează obiectele din scenă”.

Dacă extensia desktop pornește totuși după restart, țineți activ **un singur** server „blender” (extensia sau `.mcp.json`).

## 4. Hardware

- RTX 3060 Laptop ✅. Driver la verificare: **511.65** ✅ (cel nou nu era încă activ).
- Manualul Blender (ramura `main`) cere pentru OptiX driver **≥ 575** ([sursa](https://projects.blender.org/blender/blender-manual/raw/branch/main/manual/render/cycles/gpu_rendering.rst)); cifra specifică 5.3 ❓. „≥ 580” din planul W49 e mai strict; Studio 621.40 le acoperă pe ambele.
- După restart: `nvidia-smi`, apoi Preferences → System → Cycles Render Devices → OptiX.

## 5. Reguli pentru Chat 3 (3.10 / 3.11)

**Starea de azi** ✅ (citit din `public/models/*.glb`): 20 de modele, ~0,35 MB total, **60–810 triunghiuri**, **zero texturi**, toate **`KHR_materials_unlit`** (fără lumină și umbră). Codul **întinde fiecare model separat pe X/Y/Z** (`FurnitureRenderer.tsx:145-148`, `module3d.tsx:366-375`). Asta explică probabil „puțin detaliu” și mobila deformată; cauza neclarității ❓ (3.10: verifică DPR-ul canvasului).

Cifrele de mai jos sunt recomandări Radar (judecată), de validat în 3.11.

1. **PBR, nu unlit**: Principled BSDF → metallic-roughness (base color, roughness, normal). Verifică în GLB că extensia unlit a dispărut.
2. **Dimensiuni reale, scară uniformă**: metri, transformări aplicate, origine jos-centru, aceeași orientare. Scoate întinderea pe axe din cod.
3. **Teșiri**: 3–10 mm la mobilă, 1–2 segmente, weighted normals. Buget: 1–5k triunghiuri pe piesă, ≤ 100k pe modul.
4. **Texturi**: 1024 px pentru piese mari, 512 px pentru rest; materiale comune (lemn, textil, ceramică, metal) refolosite; ≤ 5 MB pe modul după compresie.
5. **Lumină coaptă**: AO copt pe al doilea set de UV; three.js cere al doilea set pentru `aoMap` și `lightMap` ([docs](https://threejs.org/docs/pages/MeshStandardMaterial.html)). Opțiunile exportorului glTF pentru AO ❓ (manualul a refuzat accesul). Lightmap separat doar dacă AO nu ajunge.
6. **Compresie la final**: `gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp` ([CLI](https://gltf-transform.dev/cli); exemplul oficial folosește `draco`). Loaderul trebuie să aibă decodorul ([GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)); ce face implicit `useGLTF` din drei ❓. KTX2 doar dacă memoria video devine problemă.
7. **Coliziuni verificate automat**: pe amprentele din layout (interior 2,4 × 2,4 m): fără suprapuneri, nimic prin pereți, culoar ≥ 60 cm, zona ușii liberă. Ca test Vitest; în Blender, control cu `mathutils.bvhtree` pe mesh-uri.
8. **Un modul, comparat**: dormitorul, înainte/după din aceeași cameră, cu mărime, triunghiuri și FPS pe telefon. Sursele `.blend` păstrate; nu suprascrie GLB-urile vechi.
