export default function AboutMePage() {
  return (
    // Contenedor principal con patrón de puntos SVG (fondo neobrutalista)
    <div className="relative min-h-screen w-full bg-white p-6 md:p-10 font-mono selection:bg-black selection:text-white overflow-hidden">
      {/* FONDO SVG: Patrón de puntos y cuadrícula sutil */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="black" />
            </pattern>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="black"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* ELEMENTOS SVG DECORATIVOS FLOTANTES (Formas geométricas brutales) */}
      <div className="absolute top-10 right-10 md:top-20 md:right-20 w-16 h-16 md:w-24 md:h-24 border-4 border-black rotate-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" />
      <div className="absolute bottom-20 left-5 md:bottom-32 md:left-16 w-20 h-20 md:w-32 md:h-32 border-4 border-black rotate-45 shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)]" />

      <svg
        className="absolute bottom-10 right-10 w-24 h-24 md:w-40 md:h-40 opacity-80"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="black"
          strokeWidth="6"
          strokeDasharray="10, 10"
        />
        <line x1="10" y1="10" x2="90" y2="90" stroke="black" strokeWidth="6" />
        <line x1="90" y1="10" x2="10" y2="90" stroke="black" strokeWidth="6" />
      </svg>

      <div className="absolute top-1/2 left-0 w-8 h-8 border-4 border-black -translate-y-1/2 -translate-x-1/2 rotate-12" />
      <div className="absolute top-1/3 right-0 w-12 h-12 border-4 border-black -translate-y-1/2 translate-x-1/2 rotate-[30deg] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]" />

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* CABECERA CON TIPOGRAMA NEORUDO */}
        <div className="mb-12 md:mb-16 border-b-4 border-black pb-4 flex flex-wrap justify-between items-end">
          <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight">
            <span className="inline-block border-4 border-black px-4 py-1 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              ACERCA
            </span>
            <br />
            <span className="inline-block border-4 border-black px-4 py-1 mt-2 bg-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              DE MÍ
            </span>
          </h1>
          <div className="flex gap-2 mt-4 md:mt-0">
            <span className="w-6 h-6 border-2 border-black bg-black"></span>
            <span className="w-6 h-6 border-2 border-black"></span>
            <span className="w-6 h-6 border-2 border-black bg-black"></span>
          </div>
        </div>

        {/* CUERPO DE TEXTO - ESTILO BRUTALISTA CON SOMBRAS Y BORDES */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Columna Izquierda: Datos personales */}
          <div className="space-y-6">
            <div className="border-4 border-black p-6 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-3xl md:text-4xl font-black uppercase mb-4 flex items-center gap-3">
                <span className="inline-block w-4 h-4 bg-black rotate-45"></span>
                Kevin Orlando
              </p>
              <p className="text-xl md:text-2xl font-bold border-l-8 border-black pl-4">
                Rivera Lasso
              </p>
            </div>

            <div className="border-4 border-black p-6 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] -rotate-1">
              <ul className="space-y-4 text-lg font-medium">
                <li className="flex items-center gap-4 border-b-2 border-black pb-2">
                  <span className="text-4xl font-black">21</span>
                  <span className="uppercase tracking-wider">AÑOS</span>
                  <span className="ml-auto text-2xl">♈</span>
                </li>
                <li className="flex items-center gap-4 border-b-2 border-black pb-2">
                  <span className="text-xl font-bold">24 MAR</span>
                  <span className="uppercase tracking-wider">2005</span>
                </li>
                <li className="flex items-center gap-4 border-b-2 border-black pb-2">
                  <span className="font-mono">ARIES</span>
                  <span className="ml-auto font-black">VEGANO</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="font-mono">TACITURNO</span>
                  <span className="ml-auto text-sm border-2 border-black px-2 py-1">
                    🐾 ANIMALES
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Columna Derecha: Estudios y opiniones */}
          <div className="space-y-6">
            <div className="border-4 border-black p-6 bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rotate-1">
              <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2 inline-block">
                📚 ING. SISTEMAS
              </h2>
              <p className="text-xl font-bold">Universidad de Nariño</p>
              <p className="text-lg font-mono mt-1">Sede Pasto</p>

              <div className="mt-6 flex gap-2">
                <span className="border-2 border-black px-3 py-1 text-sm font-black bg-black text-white">
                  UDENAR
                </span>
                <span className="border-2 border-black px-3 py-1 text-sm font-black">
                  PASTO
                </span>
              </div>
            </div>

            <div className="border-4 border-black p-6 bg-black text-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-2xl font-black uppercase mb-4">
                🤖 IA NOS REEMPLAZARÁ
              </p>
              <p className="text-lg leading-relaxed">
                Frustración existencial ante la singularidad. Mientras tanto,
                sigo jugando
                <span className="inline-block border-2 border-white px-2 py-0.5 mx-1 font-black">
                  LoL
                </span>
                y acariciando perros callejeros.
              </p>
            </div>

            <div className="flex gap-4 mt-4">
              <div className="border-4 border-black w-16 h-16 flex items-center justify-center bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="black"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="border-4 border-black flex-1 p-4 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-mono text-sm">
                  "El código es poesía oscura."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER / EXTRAS */}
        <div className="mt-12 flex flex-wrap gap-4 items-center border-t-4 border-black pt-6">
          <span className="text-sm font-mono border-2 border-black px-3 py-1 bg-white">
            #NEORUDO
          </span>
          <span className="text-sm font-mono border-2 border-black px-3 py-1 bg-black text-white">
            #AWARDSSTYLE
          </span>
          <span className="text-sm font-mono border-2 border-black px-3 py-1 bg-white rotate-1">
            #BLACKANDWHITE
          </span>

          {/* Forma SVG en línea */}
          <svg className="ml-auto w-12 h-12" viewBox="0 0 50 50">
            <rect
              x="5"
              y="5"
              width="40"
              height="40"
              fill="none"
              stroke="black"
              strokeWidth="4"
            />
            <rect x="15" y="15" width="20" height="20" fill="black" />
          </svg>
        </div>
      </div>
    </div>
  );
}
