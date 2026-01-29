const menuData = {
    pizzas: [
        { name: "Mario's Pizza", ingredients: "Tomate, extra mozzarella y jamón york", portion: "2,80 €", family: "20,00 €" },
        { name: "Harlem", ingredients: "Tomate, mozzarella, bacon, carne y morcilla de arroz", portion: "3,00 €", family: "22,00 €" },
        { name: "Chiva's Pizza", ingredients: "Tomate, mozzarella, champiñón, chorizo ibérico y salchichas", portion: "3,00 €", family: "22,00 €" },
        { name: "Carbonara", ingredients: "Nata, mozzarella, pimienta, pollo braseado y bacon", portion: "3,00 €", family: "22,00 €" },
        { name: "Queens", ingredients: "Tomate, mozzarella, calabacín, pimiento y champiñón", portion: "3,00 €", family: "22,00 €" },
        { name: "Brooklyn", ingredients: "Tomate, mozzarella, champiñón, jamón york y bacon", portion: "3,00 €", family: "22,00 €" },
        { name: "Central Park", ingredients: "Tomate, mozzarella y combinado especial de 4 quesos", portion: "3,00 €", family: "22,00 €" },
        { name: "Miami", ingredients: "Tomate, mozzarella, piña y jamón york", portion: "3,00 €", family: "22,00 €" },
        { name: "Sicilian", ingredients: "Tomate frito, salsa barbacoa, peperoni, extra mozzarella y carne", portion: "3,00 €", family: "22,00 €" },
        { name: "Manhattan", ingredients: "Tomate, mozzarella, atún, aceitunas, anchoas y tomate natural", portion: "3,00 €", family: "22,00 €" },
        { name: "Ranchera", ingredients: "Tomate frito, bacon, salsa barbacoa, pollo braseado y cebolla caramelizada", portion: "3,00 €", family: "22,00 €" },
        { name: "Kebab", ingredients: "Tomate, mozzarella, bacon, pollo kebab y salsa yogur", portion: "3,00 €", family: "22,00 €" },
        { name: "Tejana", ingredients: "Barbacoa, salsa cheddar, mozzarella, carne de vacuno y cebolla caramelizada", portion: "3,00 €", family: "22,00 €" }
    ],
    custom: [
        { name: "Pizza Base", ingredients: "Tomate, mozzarella y orégano", price: "18,00 €" },
        { name: "Pizza Base + 1 Ingrediente", ingredients: "Elige tu favorito", price: "19,50 €" },
        { name: "Pizza Base + 2 Ingredientes", ingredients: "Combina dos sabores", price: "21,00 €" },
        { name: "Pizza Base + 3 Ingredientes", ingredients: "Para los más exigentes", price: "22,50 €" },
        { name: "Ingrediente Adicional", ingredients: "Extra", price: "1,50 €" }
    ],
    aperitivos: [
        { name: "Aros de Cebolla", ingredients: "Crujientes y dorados" },
        { name: "Fingers de Queso", ingredients: "Rellenos de queso fundido" },
        { name: "Patatas De Luxe", ingredients: "Gajos de patata especiados" },
        { name: "Nuggets de Pollo", ingredients: "Carne de pollo empanada" },
        { name: "Alitas de Pollo", ingredients: "Sabor original o picante" },
        { name: "Pollos Crujiente", ingredients: "Chicken tender style" },
        { name: "Delicias de Cheddar", ingredients: "Bocaditos de queso" },
        { name: "Flautas", ingredients: "Pechuga y Queso" }
    ]
};

function renderMenu() {
    const container = document.getElementById('menu-container');
    let html = '';

    // Helper for Star Pattern (Rounded standard stars)
    const starSvg = `<svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

    const starPattern = `
        <div class="relative w-full h-full">
            <div class="absolute text-white w-8 h-8 md:w-16 md:h-16 top-[-5px] left-[-5px] transform -rotate-12">${starSvg}</div>
            <div class="absolute text-white w-6 h-6 md:w-8 md:h-8 top-[40px] left-[25px] transform rotate-12">${starSvg}</div>
            <div class="absolute text-white w-5 h-5 md:w-8 md:h-8 top-[10px] left-[60px] transform -rotate-6">${starSvg}</div>
        </div>
    `;

    // ================= MAIN MENU CONTAINER =================
    html += '<div class="max-w-5xl mx-auto space-y-12">';

    // ================= SECCIÓN PIZZAS =================
    html += `
    <div class="shadow-2xl border-4 border-gray-900 bg-white">
        <div class="flex border-b-4 border-gray-900 h-20 md:h-24">
            <!-- Blue Corner with Diagonal Cut -->
            <div class="bg-usa-blue w-28 md:w-40 relative overflow-hidden" style="clip-path: polygon(0 0, 100% 0, 40% 100%, 0 100%);">
                ${starPattern}
            </div>
            <!-- Red Bar -->
            <div class="bg-usa-red flex-grow flex items-center justify-center">
                <h2 class="text-white text-3xl md:text-5xl font-display uppercase tracking-[0.2em] drop-shadow-md text-center">Nuestro Menú</h2>
            </div>
        </div>

        <!-- TABLE HEADER -->
        <div class="grid grid-cols-[1fr_auto_auto] border-b-2 border-gray-900 bg-gray-200">
            <div class="p-2 md:p-3"></div>
            <div class="bg-gray-800 text-white font-bold p-2 w-20 md:w-32 text-center border-l-2 border-white flex flex-col justify-center">
                <span class="uppercase text-xs md:text-sm tracking-wide">Porción</span>
            </div>
            <div class="bg-gray-800 text-white font-bold p-2 w-24 md:w-40 text-center border-l-2 border-white flex flex-col justify-center">
                <span class="uppercase text-xs md:text-sm tracking-wide">Familiar</span>
                <span class="text-[9px] md:text-[10px] font-normal opacity-80 leading-none mt-1">6-8 Personas</span>
            </div>
        </div>

        <!-- PIZZA ROWS -->
        <div class="bg-white">
    `;

    menuData.pizzas.forEach((item, index) => {
        const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-red-50/80';
        html += `
        <div class="${bgClass} grid grid-cols-[1fr_auto_auto] border-b border-gray-300 last:border-0 group hover:bg-yellow-50 transition-colors duration-150">
            <div class="p-2 md:p-3 flex flex-col justify-center pl-4 md:pl-6">
                <h3 class="font-display font-bold text-gray-900 text-lg md:text-2xl uppercase tracking-wide leading-none mb-1">${item.name}</h3>
                <p class="text-usa-red text-xs md:text-sm font-body font-bold leading-tight opacity-90">${item.ingredients}</p>
            </div>
            <div class="w-20 md:w-32 border-l border-gray-300 flex items-center justify-center relative">
                 <div class="font-display font-bold text-lg md:text-2xl text-white bg-usa-red px-2 py-1 rounded shadow-sm">
                    ${item.portion}
                 </div>
            </div>
            <div class="w-24 md:w-40 border-l border-gray-300 flex items-center justify-center bg-gray-50/50">
                 <div class="font-display font-bold text-lg md:text-2xl text-white bg-usa-red px-3 py-1 rounded shadow-sm">
                    ${item.family}
                 </div>
            </div>
        </div>
        `;
    });

    html += `</div></div>`;

    // ================= SECCIÓN CUSTOM PIZZA =================
    html += `
    <div class="shadow-2xl border-4 border-gray-900 bg-white mt-12">
        <div class="flex border-b-4 border-gray-900 h-20 md:h-24">
            <div class="bg-usa-blue w-28 md:w-40 relative overflow-hidden" style="clip-path: polygon(0 0, 100% 0, 40% 100%, 0 100%);">
                ${starPattern}
            </div>
            <div class="bg-usa-red flex-grow flex items-center justify-center">
                <h2 class="text-white text-2xl md:text-4xl font-display uppercase tracking-widest text-center">Pizza a tu gusto</h2>
            </div>
        </div>

        <div class="bg-white">
            <div class="p-4 md:p-6 bg-gray-100 border-b border-gray-300 text-center">
                 <p class="font-bold text-gray-800 uppercase text-xs md:text-sm tracking-wide">
                    Te preparamos la pizza que quieras tomando la Pizza Base (Tomate y Mozzarella) y añadiendo los ingredientes que prefieras:
                 </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2">
                 <!-- Ingredients -->
                 <div class="p-6 md:p-8">
                     <div class="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-1 text-xs md:text-sm text-gray-900 font-bold uppercase">
                        <span>Anchoas</span><span>Ceb. Caramelizada</span>
                        <span>Nata</span><span>Jamón York</span>
                        <span>Pimiento</span><span>Salsa Barbacoa</span>
                        <span>Atún</span><span>Carne</span>
                        <span>Extra Mozzarella</span><span>Morcilla</span>
                        <span>Pollo</span><span>Salsa Cheddar</span>
                        <span>Bacon</span><span>Champiñón</span>
                        <span>Olivas</span><span>Piña</span>
                        <span>Pollo Kebab</span><span>Salchichas</span>
                        <span>Calabacín</span><span>Chorizo Ibérico</span>
                        <span>Extra Tomate</span><span>Peperoni</span>
                    </div>
                </div>

                <!-- Prices -->
                <div class="bg-red-50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-300">
    `;

    menuData.custom.forEach(item => {
        html += `
        <div class="flex justify-between items-center border-b border-white/50 pb-2 mb-2 last:border-0 last:mb-0 last:pb-0">
            <span class="font-bold text-gray-900 uppercase text-sm md:text-lg">${item.name}</span>
            <div class="bg-usa-red text-white font-display font-bold px-3 py-1 rounded text-lg">${item.price}</div>
        </div>`;
    });

    html += `</div></div></div></div>`;

    // ================= SECCIÓN APERITIVOS =================
    html += `
    <div class="shadow-2xl border-4 border-gray-900 bg-white mt-12 mb-24">
        <div class="flex border-b-4 border-gray-900 h-16 md:h-20 overflow-hidden bg-usa-red">
            <div class="bg-usa-blue w-24 md:w-32 relative flex-shrink-0" style="clip-path: polygon(0 0, 100% 0, 40% 100%, 0 100%);">
                ${starPattern}
            </div>
            <div class="flex-grow flex items-center justify-center -ml-12">
                <h2 class="text-white text-3xl md:text-4xl font-display uppercase tracking-[0.2em] text-center w-full">Aperitivos</h2>
            </div>
        </div>
        <div class="p-8 bg-white">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
    `;

    menuData.aperitivos.forEach(item => {
        html += `
        <div class="group border-b border-gray-100 last:border-0 pb-2">
            <h3 class="font-display font-bold text-gray-900 uppercase text-lg md:text-xl leading-none mb-1 group-hover:text-usa-red transition">${item.name}</h3>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider">${item.ingredients}</p>
        </div>`;
    });

    html += `</div></div></div>`;

    html += '</div>';
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', renderMenu);
