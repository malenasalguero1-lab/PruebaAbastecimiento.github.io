/* ============================
   HELPERS Y FORMATO
============================ */
function _fmtPct(v) { if (v == null || isNaN(v)) return ""; const n = Math.round(v * 10) / 10; return n.toString().replace(".", ",") + "%"; }
function _fmtNum1(v) { if (v == null || isNaN(v)) return ""; const n = Math.round(v * 10) / 10; return n.toString().replace(".", ","); }

function toNumAny(v) {
    if (v == null) return NaN;
    if (typeof v === "number") return v;
    const s = String(v).trim();
    if (!s) return NaN;
    const norm = s.replace(/\./g, "").replace(/,/g, ".");
    const n = parseFloat(norm);
    return isNaN(n) ? NaN : n;
}

/* ============================
   CONFIGURACIÓN - SERVICIOS
============================ */
const csvUrl = "./SERVICIOS OBRA.csv"; 
const DELIM = ";";

// Nombres exactos de tus columnas en el CSV
const FECHA_COL = "FECHA ENTREGA ESPERADA";
const CLIENT_COL_NAME = "CLIENTE";
const PERIODO_COL_NAME = "Período de certificación";
const ESTADO_COL_NAME = "Estado Servicio";

// Colores para KPIs
const COLORS = {
    blue: "#3b82f6",
    green: "#10b981",
    amber: "#f59e0b",
    red: "#ef4444",
    text: "#0f172a"
};

/* ============================
   GLOBALES
============================ */
let data = [];
let headers = [];

/* ============================
   UTILIDADES CORE
============================ */
const clean = (v) => (v ?? "").toString().trim();
function setText(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt ?? ""; }
function fmtInt(n) { return Number(n || 0).toLocaleString("es-AR", { maximumFractionDigits: 0 }); }

function parseDateAny(s) {
    const t = clean(s);
    if (!t) return null;
    // Soporta d/m/yyyy
    let m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
    return null;
}

function getMonthKey(r) {
    const d = parseDateAny(r[FECHA_COL]);
    return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : null;
}

/* ============================
   LÓGICA DE FILTROS
============================ */
function getSelValues(id) {
    const sel = document.getElementById(id);
    if (!sel) return [];
    const vals = [...sel.selectedOptions].map(o => o.value).filter(v => v !== "__ALL__");
    return vals;
}

function selLabel(id) {
    const v = getSelValues(id);
    return v.length ? v.join("-") : "Todos";
}

function safeFilePart(s) { return clean(s).replace(/[^\w\-]+/g, "_").slice(0, 80) || "Todos"; }

function applyAll() {
    const selClientes = getSelValues("clienteSelect");
    const selPeriodos = getSelValues("clasif2Select");
    const selEstados = getSelValues("gcocSelect");
    const selMeses = getSelValues("mesSelect");

    // FILTRADO DE DATOS
    const filtered = data.filter(r => {
        const matchClie = !selClientes.length || selClientes.includes(r[CLIENT_COL_NAME]);
        const matchPeri = !selPeriodos.length || selPeriodos.includes(r[PERIODO_COL_NAME]);
        const matchEsta = !selEstados.length || selEstados.includes(r[ESTADO_COL_NAME]);
        const matchMes = !selMeses.length || selMeses.includes(getMonthKey(r));
        return matchClie && matchPeri && matchEsta && matchMes;
    });

    // ACTUALIZACIÓN DE KPIs (Conteos basados en Estado Servicio)
    const total = filtered.length;
    const enCurso = filtered.filter(r => r[ESTADO_COL_NAME] === "En curso").length;
    const finalizado = filtered.filter(r => r[ESTADO_COL_NAME] === "Finalizado").length;

    setText("kpiTotal", fmtInt(total));
    setText("kpiATqty", `En curso: ${fmtInt(enCurso)}`);
    setText("kpiFTqty", `Finalizados: ${fmtInt(finalizado)}`);
    
    // Porcentaje de avance simple para el KPI principal
    const pct = total ? (finalizado / total) : 0;
    setText("kpiATpct", (pct * 100).toFixed(1).replace(".", ",") + "%");
}

/* ============================
   DESCARGA CSV
============================ */
function downloadCSV(filename, rows, cols) {
    const header = cols.join(";");
    const lines = rows.map(r => cols.map(c => (r[c] ?? "").toString().replace(/;/g, ",")).join(";"));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
}

/* ============================
   INICIO Y CARGA
============================ */
window.addEventListener("DOMContentLoaded", () => {
    fetch(csvUrl).then(r => r.text()).then(text => {
        const lines = text.split("\n").filter(l => l.trim() !== "");
        const rows = lines.map(line => line.split(DELIM).map(clean));
        
        headers = rows[0];
        data = rows.slice(1).map(row => {
            let o = {};
            headers.forEach((h, i) => o[h] = row[i]);
            return o;
        });

        // Función para llenar los selectores
        const fill = (id, col) => {
            const values = [...new Set(data.map(r => r[col]).filter(Boolean))].sort();
            const sel = document.getElementById(id);
            sel.innerHTML = '<option value="__ALL__">Todos</option>';
            values.forEach(v => {
                const opt = document.createElement("option");
                opt.value = v; opt.textContent = v;
                sel.appendChild(opt);
            });
        };

        fill("clienteSelect", CLIENT_COL_NAME);
        fill("clasif2Select", PERIODO_COL_NAME);
        fill("gcocSelect", ESTADO_COL_NAME);
        
        // Selector de Meses
        const meses = [...new Set(data.map(getMonthKey).filter(Boolean))].sort();
        const mSel = document.getElementById("mesSelect");
        mSel.innerHTML = '<option value="__ALL__">Todos</option>';
        meses.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m; opt.textContent = m;
            mSel.appendChild(opt);
        });

        document.getElementById("loader")?.classList.add("hidden");

        // Listeners para interactividad
        ["clienteSelect", "clasif2Select", "gcocSelect"].forEach(id => {
            document.getElementById(id)?.addEventListener("change", applyAll);
        });

        // Lógica del Botón de Descarga
        document.getElementById("btnDownloadNO")?.addEventListener("click", () => {
            const selClientes = getSelValues("clienteSelect");
            const selPeriodos = getSelValues("clasif2Select");
            const selEstados = getSelValues("gcocSelect");

            const finalData = data.filter(r => {
                const matchClie = !selClientes.length || selClientes.includes(r[CLIENT_COL_NAME]);
                const matchPeri = !selPeriodos.length || selPeriodos.includes(r[PERIODO_COL_NAME]);
                const matchEsta = !selEstados.length || selEstados.includes(r[ESTADO_COL_NAME]);
                return matchClie && matchPeri && matchEsta;
            });

            if (!finalData.length) return alert("No hay datos para descargar con esos filtros.");

            const name = `SERVICIOS_${safeFilePart(selLabel("clienteSelect"))}.csv`;
            downloadCSV(name, finalData, headers);
        });

        applyAll();
    }).catch(err => console.error("Error cargando el archivo:", err));
});


