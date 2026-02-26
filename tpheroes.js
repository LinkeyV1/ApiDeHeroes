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

const gestorForm = new GestorHeroes("heroes");
let heroes = gestorForm.obtener();

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

function renderHeroes() {
    const cont = document.querySelector("#listaHeroes");
    cont.innerHTML = "";
    
    heroes.forEach(h => {
        const div = document.createElement("div");
        div.className = "heroe-card";
        
        if (h.tipo === "Rick & Morty") {
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.gap = "15px";
            div.style.border = "1px solid gray";
            div.style.padding = "10px";
            div.style.marginBottom = "10px";
        }

        const imgHtml = h.imagen ? `<img src="${h.imagen}" style="${h.tipo === 'Rick & Morty' ? 'width: 80px; height: 80px; border-radius: 5px;' : ''}" class="heroe-imagen" alt="${h.nombre}">` : '';
        const descHtml = h.descripcion ? `<div class="heroe-descripcion"><div class="heroe-descripcion-label">Descripción</div>${h.descripcion}</div>` : '';
        
        div.innerHTML = `
            ${imgHtml}
            <div>
                <h3>${h.nombre} - ${h.tipo}</h3>
                <p>Nivel: <span class="nivel">${h.nivel}</span></p>
                <p>Habilidades: <span class="hab">${h.habilidades.join(", ") || "Ninguna"}</span></p>
                ${h.tipo !== "Rick & Morty" ? descHtml : ""}
                <div style="margin-top:10px;">
                    <button class="subir" data-id="${h.id}">Subir Nivel</button>
                    <button class="eliminar" data-id="${h.id}">Eliminar</button>
                    <button class="agregar" data-id="${h.id}">Agregar Habilidad</button>
                </div>
                <div class="input-hab" data-id="${h.id}" style="display:none; margin-top:10px;">
                    <input type="text" class="nueva-habilidad">
                    <button class="guardar" data-id="${h.id}">OK</button>
                </div>
            </div>
        `;
        cont.appendChild(div);
    });
    cargarAPI();
}

document.querySelector("#listaHeroes").addEventListener("click", e => {
    const id = e.target.dataset.id;
    if (!id) return;
    const h = heroes.find(x => x.id == id);
    if (!h) return;

    const tarjeta = e.target.closest(".heroe-card");
    const divInput = tarjeta.querySelector(".input-hab");

    if (e.target.classList.contains("subir")) { h.subirNivel(); gestorForm.guardar(heroes); renderHeroes(); }
    if (e.target.classList.contains("eliminar")) { 
        heroes = heroes.filter(x => x.id != id); 
        gestorForm.guardar(heroes); 
        renderHeroes(); 
    }
    if (e.target.classList.contains("agregar")) { divInput.style.display = "block"; }
    
    if (e.target.classList.contains("guardar")) {
        const input = divInput.querySelector(".nueva-habilidad");
        const val = input.value.trim();
        if (val !== "") {
            h.aprenderHabilidad(val);
            gestorForm.guardar(heroes);
            renderHeroes();
        }
    }
});

async function cargarAPI() {
    const cont = document.querySelector("#apiPersonajes");
    if (cont.innerHTML === "") cont.innerHTML = "Cargando...";

    try {
        const resp = await fetch("https://rickandmortyapi.com/api/character?page=1");
        const data = await resp.json();
        
        const personajesFiltrados = data.results
            .filter(p => !heroes.some(h => h.nombre === p.name))
            .slice(0, 3);

        cont.innerHTML = "";

        personajesFiltrados.forEach(p => {
            const card = document.createElement("div");
            card.style.border = "1px solid gray";
            card.style.display = "flex";
            card.style.alignItems = "center";
            card.style.margin = "5px";
            card.style.padding = "5px";
            card.style.gap = "10px";

            const img = document.createElement("img");
            img.src = p.image;
            img.width = 60;

            const info = document.createElement("div");
            const nombre = document.createElement("h4");
            nombre.textContent = p.name;
            const btnImportar = document.createElement("button");
            btnImportar.textContent = "Importar";

            btnImportar.addEventListener("click", () => {
                const nuevoHeroe = new Heroe(p.name, "Rick & Morty", 1, [], p.image, "");
                heroes.push(nuevoHeroe);
                gestorForm.guardar(heroes);
                renderHeroes();
            });

            info.appendChild(nombre);
            info.appendChild(btnImportar);
            card.appendChild(img);
            card.appendChild(info);
            cont.appendChild(card);
        });
    } catch { 
        cont.innerHTML = "Error al cargar API"; 
    }
}

renderHeroes();
