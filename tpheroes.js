//Clase heroe
class Heroe {
    constructor(nombre, tipo, nivel = 1, habilidades = [], imagen = "", descripcion = "") {
        this.id = Date.now() + Math.random();
        this.nombre = nombre;
        this.tipo = tipo;
        this.nivel = nivel;
        this.habilidades = habilidades;
        this.imagen = imagen;
        this.descripcion = descripcion;
    }

    subirNivel() { this.nivel++; }
    aprenderHabilidad(h) {
        if (!h || h.trim() === "") return;
        if (!this.habilidades.includes(h)) this.habilidades.push(h);
    }
}
//Gestor Heroes: Local Storage
class GestorHeroes {
    constructor(key) { this.key = key; }
    guardar(lista) { localStorage.setItem(this.key, JSON.stringify(lista)); }
    obtener() {
        const datos = JSON.parse(localStorage.getItem(this.key)) || [];
        return datos.map(h => {
            const heroe = new Heroe(h.nombre, h.tipo, h.nivel, h.habilidades, h.imagen, h.descripcion);
            heroe.id = h.id;
            return heroe;
        });
    }
}
//intancias iniciales
const gestorForm = new GestorHeroes("heroes");
let heroes = gestorForm.obtener();

const gestorAPI = new GestorHeroes("heroesAPI");
let heroesAPI = gestorAPI.obtener();

const form = document.querySelector("#formHeroe");
form.addEventListener("submit", e => {
    e.preventDefault();

    const nombre = document.querySelector("#nombre").value;
    const tipo = document.querySelector("#tipo").value;
    const nivel = Number(document.querySelector("#nivel").value);
    const hab = document.querySelector("#habilidad").value;
    const imagen = document.querySelector("#imagen").value;
    const descripcion = document.querySelector("#descripcion").value;

    if (!nombre || nivel <= 0) { alert("Datos inválidos"); return; }

    const h = new Heroe(nombre, tipo, nivel, hab ? [hab] : [], imagen, descripcion);
    heroes.push(h);
    gestorForm.guardar(heroes);
    renderHeroes();
    form.reset();
});
//render a heroes
function renderHeroes() {
    const cont = document.querySelector("#listaHeroes");
    cont.innerHTML = "";
    heroes.forEach(h => {
        const div = document.createElement("div");
        div.className = "heroe-card";
        const imgHtml = h.imagen ? `<img src="${h.imagen}" class="heroe-imagen" alt="${h.nombre}">` : '';
        const descHtml = h.descripcion ? `<div class="heroe-descripcion"><div class="heroe-descripcion-label">Descripción</div>${h.descripcion}</div>` : '';
        div.innerHTML = `
            ${imgHtml}

            <h3>${h.nombre} - ${h.tipo}</h3>

            <p>Nivel: <span class="nivel">${h.nivel}</span></p>
            <p>Habilidades: <span class="hab">${h.habilidades.join(", ") || "Ninguna"}</span></p>
            ${descHtml}

            <div style="margin-top:10px;">
                <button class="subir" data-id="${h.id}">Subir Nivel</button>
                <button class="eliminar" data-id="${h.id}">Eliminar</button>
                <button class="agregar" data-id="${h.id}">Agregar Habilidad</button>
            </div>

            <div class="input-hab" data-id="${h.id}" style="display:none; margin-top:10px;">
                <input type="text" class="nueva-habilidad">
                <button class="guardar" data-id="${h.id}">OK</button>
            </div>
        `;
        cont.appendChild(div);
    });
}
//Delegacion de eventos
document.querySelector("#listaHeroes").addEventListener("click", e => {
    const id = e.target.dataset.id;
    if (!id) return;
    const h = heroes.find(x => x.id == id);
    if (!h) return;

    const div = document.querySelector(`.input-hab[data-id="${id}"]`);

    if (e.target.classList.contains("subir")) { h.subirNivel(); gestorForm.guardar(heroes); renderHeroes(); }
    if (e.target.classList.contains("eliminar")) { heroes = heroes.filter(x => x.id != id); gestorForm.guardar(heroes); renderHeroes(); }
    if (e.target.classList.contains("agregar")) { div.style.display = "block"; }
    if (e.target.classList.contains("guardar")) {

        const val = div.querySelector(".nueva-habilidad").value.trim();
        h.aprenderHabilidad(val);
        div.querySelector(".nueva-habilidad").value = "";
        gestorForm.guardar(heroes);
        renderHeroes();
    }
});

//Cargar API
async function cargarAPI() {
    //contenedor
    const cont = document.querySelector("#apiPersonajes");
    cont.innerHTML = "Cargando...";
    //evo
    try {
        const resp = await fetch("https://rickandmortyapi.com/api/character?page=1");
        const data = await resp.json();
        const personajes = data.results.slice(0, 3);
        cont.innerHTML = "";

        personajes.forEach(p => {
            const card = document.createElement("div");
            card.style.border = "1px solid gray";
            card.style.display = "flex";
            card.style.alignItems = "center";
            card.style.margin = "5px";
            card.style.padding = "5px";
            card.style.gap = "10px";

            const img = document.createElement("img");
            img.src = p.image;
            img.width = 100;

            const info = document.createElement("div");
            info.style.display = "flex";
            info.style.flexDirection = "column";
            info.style.gap = "5px";

            const nombre = document.createElement("h4");
            nombre.textContent = p.name;
            const btnImportar = document.createElement("button");
            btnImportar.textContent = "Importar como Héroe";

            const divInfo = document.createElement("div");
            divInfo.style.display = "none";
            divInfo.innerHTML = `
                <p>Nivel: 1</p>
                <p>Habilidades: Ninguna</p>
                <button class="subir">Subir Nivel</button>
                <button class="agregar">Agregar Habilidad</button>
            `;

            const divInput = document.createElement("div");
            divInput.style.display = "none";
            divInput.innerHTML = `<input type="text" class="nueva-habilidad-api"><button class="guardar">Guardar</button>`;
            divInfo.appendChild(divInput);

            info.appendChild(nombre);
            info.appendChild(btnImportar);
            info.appendChild(divInfo);
            card.appendChild(img);
            card.appendChild(info);
            cont.appendChild(card);

            btnImportar.addEventListener("click", () => {

                const h = new Heroe(p.name, "Importado", 1, []);
                heroesAPI.push(h);
                gestorAPI.guardar(heroesAPI);
                divInfo.style.display = "block";
                btnImportar.style.display = "none";

                const nivelP = divInfo.querySelector("p:nth-child(1)");
                const habP = divInfo.querySelector("p:nth-child(2)");
                const botonSubir = divInfo.querySelector(".subir");
                const botonAgregar = divInfo.querySelector(".agregar");
                const botonGuardar = divInput.querySelector("button");
                const input = divInput.querySelector("input");

                botonSubir.addEventListener("click", () => { h.subirNivel(); gestorAPI.guardar(heroesAPI); nivelP.textContent = "Nivel: " + h.nivel; });
                botonAgregar.addEventListener("click", () => { divInput.style.display = "block"; });
                botonGuardar.addEventListener("click", () => {

                    h.aprenderHabilidad(input.value.trim());
                    input.value = "";
                    habP.textContent = "Habilidades: " + (h.habilidades.length > 0 ? h.habilidades.join(", ") : "Ninguna");
                    gestorAPI.guardar(heroesAPI);
                });
            });
        });

        heroesAPI.forEach(h => {

            const card = Array.from(cont.children).find(c => c.querySelector("h4").textContent == h.nombre);
            if (!card) return;
            const divInfo = card.querySelector("div:nth-child(2) > div:nth-child(3)");
            const btnImportar = card.querySelector("button");
            divInfo.style.display = "block";
            btnImportar.style.display = "none";

            const nivelP = divInfo.querySelector("p:nth-child(1)");
            const habP = divInfo.querySelector("p:nth-child(2)");
            const botonSubir = divInfo.querySelector(".subir");
            const botonAgregar = divInfo.querySelector(".agregar");
            const divInput = divInfo.querySelector("div");
            const input = divInput.querySelector("input");
            const botonGuardar = divInput.querySelector("button");

            nivelP.textContent = "Nivel: " + h.nivel;
            habP.textContent = "Habilidades: " + (h.habilidades.length > 0 ? h.habilidades.join(", ") : "Ninguna");
            botonSubir.addEventListener("click", () => { h.subirNivel(); nivelP.textContent = "Nivel: " + h.nivel; gestorAPI.guardar(heroesAPI); });

            botonAgregar.addEventListener("click", () => { divInput.style.display = "block"; });
            botonGuardar.addEventListener("click", () => {

                h.aprenderHabilidad(input.value.trim());
                input.value = "";
                habP.textContent = "Habilidades: " + (h.habilidades.length > 0 ? h.habilidades.join(", ") : "Ninguna");
                gestorAPI.guardar(heroesAPI);
            });
        });
    } catch { cont.innerHTML = "Error al cargar API"; }
}

renderHeroes();
cargarAPI();
