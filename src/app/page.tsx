import ClientOnly from "@/components/ClientOnly";
import Link from "next/link";

export default function Home() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-950 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
        {/* Hero Section */}
        <section className="pt-20 pb-12 md:pt-24 md:pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-950 mb-4 md:mb-6">
              Bem-vindo ao{" "}
              <span className="text-yellow-600">Judô Sandokan</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-primary-800 mb-6 md:mb-8 max-w-3xl mx-auto px-2">
              Descubra a arte marcial que transforma corpo, mente e espírito
              através da tradição, disciplina e respeito
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 md:mb-12 px-4">
              <Link
                href="/login"
                className="bg-primary-950 hover:bg-primary-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
              >
                🥋 Entrar no Sistema
              </Link>
              <Link
                href="/cadastro"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-sm sm:text-base"
              >
                ⭐ Cadastrar-se como Aluno
              </Link>
            </div>
          </div>
        </section>

        {/* História do Judô */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-950 mb-4 md:mb-6">
                🥋 A História do Judô
              </h2>
              <p className="text-lg sm:text-xl text-primary-700 max-w-3xl mx-auto px-2">
                Uma jornada através dos séculos que moldou uma das mais
                respeitadas artes marciais do mundo
              </p>
            </div>

            {/* Origem */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 md:mb-20">
              <div className="px-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-primary-950 mb-4 md:mb-6">
                  🏯 As Origens no Japão Feudal
                </h3>
                <p className="text-base sm:text-lg text-primary-700 mb-4 md:mb-6">
                  O judô nasceu das antigas tradições de combate dos samurais
                  japoneses. Durante séculos, as técnicas de jujutsu foram
                  desenvolvidas e refinadas nos campos de batalha do Japão
                  feudal, onde guerreiros precisavam lutar desarmados quando
                  perdiam suas espadas.
                </p>
                <p className="text-base sm:text-lg text-primary-700">
                  Essas técnicas ancestrais se baseavam no princípio de usar a
                  força do oponente contra ele mesmo, permitindo que guerreiros
                  menores pudessem derrotar adversários maiores através da
                  técnica e estratégia.
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl p-6 md:p-8 border border-red-200 mx-2 lg:mx-0">
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl md:text-8xl mb-3 md:mb-4">
                    🏯
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-red-800 mb-3 md:mb-4">
                    Período Feudal
                  </h4>
                  <p className="text-red-700 text-base sm:text-lg">
                    Séculos XII-XIX
                  </p>
                  <div className="mt-4 md:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="text-center">
                      <span className="text-2xl sm:text-3xl block">⚔️</span>
                      <span className="text-xs sm:text-sm text-red-600">
                        Samurais
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl sm:text-3xl block">🥷</span>
                      <span className="text-xs sm:text-sm text-red-600">
                        Jujutsu
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl sm:text-3xl block">🎌</span>
                      <span className="text-xs sm:text-sm text-red-600">
                        Tradição
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Jigoro Kano */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 md:mb-20">
              <div className="lg:order-2 px-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-primary-950 mb-4 md:mb-6">
                  👨‍🏫 Jigoro Kano - O Fundador
                </h3>
                <p className="text-base sm:text-lg text-primary-700 mb-4 md:mb-6">
                  Em 1882, <strong>Jigoro Kano</strong> fundou o judô moderno
                  combinando as melhores técnicas de várias escolas de jujutsu.
                  Kano transformou uma arte marcial brutal em um sistema
                  educacional que desenvolve o corpo, a mente e o caráter.
                </p>
                <p className="text-base sm:text-lg text-primary-700 mb-4 md:mb-6">
                  Ele estabeleceu os princípios fundamentais:{" "}
                  <strong>&ldquo;Seiryoku Zenyo&rdquo;</strong> (máxima
                  eficiência com mínimo esforço) e{" "}
                  <strong>&ldquo;Jita Kyoei&rdquo;</strong> (prosperidade e
                  benefício mútuos).
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <p className="text-yellow-800 font-medium text-center italic text-sm sm:text-base">
                    &ldquo;O judô é o caminho para o uso mais eficiente da força
                    física e mental&rdquo;
                  </p>
                  <p className="text-yellow-600 text-center text-xs sm:text-sm mt-2">
                    - Jigoro Kano
                  </p>
                </div>
              </div>
              <div className="lg:order-1 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 md:p-8 border border-blue-200 mx-2 lg:mx-0">
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl md:text-8xl mb-3 md:mb-4">
                    👨‍🏫
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-blue-800 mb-3 md:mb-4">
                    Jigoro Kano
                  </h4>
                  <p className="text-blue-700 text-base sm:text-lg mb-4 md:mb-6">
                    1860 - 1938
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="bg-white rounded-lg p-2 sm:p-3">
                      <span className="text-xl sm:text-2xl block">📚</span>
                      <span className="text-xs text-blue-600">Educador</span>
                    </div>
                    <div className="bg-white rounded-lg p-2 sm:p-3">
                      <span className="text-xl sm:text-2xl block">🥋</span>
                      <span className="text-xs text-blue-600">Fundador</span>
                    </div>
                    <div className="bg-white rounded-lg p-2 sm:p-3">
                      <span className="text-xl sm:text-2xl block">🏛️</span>
                      <span className="text-xs text-blue-600">Kodokan</span>
                    </div>
                    <div className="bg-white rounded-lg p-2 sm:p-3">
                      <span className="text-xl sm:text-2xl block">🌍</span>
                      <span className="text-xs text-blue-600">Mundial</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evolução Mundial */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 md:mb-20">
              <div className="px-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-primary-950 mb-4 md:mb-6">
                  🌍 Expansão Mundial
                </h3>
                <p className="text-base sm:text-lg text-primary-700 mb-4 md:mb-6">
                  O judô rapidamente se espalhou pelo mundo, chegando ao Brasil
                  no início do século XX através dos imigrantes japoneses. A
                  arte marcial encontrou solo fértil em nosso país, onde se
                  desenvolveu de forma única.
                </p>
                <p className="text-base sm:text-lg text-primary-700 mb-4 md:mb-6">
                  Em 1964, o judô tornou-se esporte olímpico nos Jogos de
                  Tóquio, consolidando sua posição como uma das artes marciais
                  mais praticadas do mundo.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-center">
                    <span className="text-2xl sm:text-3xl block mb-2">🥇</span>
                    <span className="text-green-800 font-bold text-sm sm:text-base">
                      1964
                    </span>
                    <p className="text-green-600 text-xs sm:text-sm">
                      Esporte Olímpico
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center">
                    <span className="text-2xl sm:text-3xl block mb-2">🌎</span>
                    <span className="text-blue-800 font-bold text-sm sm:text-base">
                      200+
                    </span>
                    <p className="text-blue-600 text-xs sm:text-sm">Países</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6 md:p-8 border border-green-200 mx-2 lg:mx-0">
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl md:text-8xl mb-3 md:mb-4">
                    🌍
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-green-800 mb-3 md:mb-4">
                    Judô Mundial
                  </h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-white rounded-lg p-2 sm:p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xl sm:text-2xl">🇧🇷</span>
                        <span className="text-green-700 font-medium text-sm sm:text-base">
                          Brasil - 1908
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-2 sm:p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xl sm:text-2xl">🇺🇸</span>
                        <span className="text-green-700 font-medium text-sm sm:text-base">
                          EUA - 1920
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-2 sm:p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xl sm:text-2xl">🇫🇷</span>
                        <span className="text-green-700 font-medium text-sm sm:text-base">
                          França - 1930
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Princípios do Judô */}
            <div className="bg-gradient-to-r from-primary-900 to-primary-800 rounded-2xl p-6 md:p-8 lg:p-12 text-white mx-2 lg:mx-0">
              <div className="text-center mb-8 md:mb-12">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
                  ⚖️ Os Princípios do Judô
                </h3>
                <p className="text-lg sm:text-xl text-primary-100 max-w-3xl mx-auto px-2">
                  Mais que uma arte marcial, o judô é uma filosofia de vida
                  baseada em valores universais
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <span className="text-2xl sm:text-3xl">🤝</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3">
                    Respeito Mútuo
                  </h4>
                  <p className="text-primary-200 text-sm sm:text-base">
                    Valorizar e honrar todos os parceiros de treino, mestres e
                    adversários
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <span className="text-2xl sm:text-3xl">⚡</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3">
                    Máxima Eficiência
                  </h4>
                  <p className="text-primary-200 text-sm sm:text-base">
                    Usar a força do oponente e aplicar a técnica com mínimo
                    esforço
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <span className="text-2xl sm:text-3xl">🧘</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3">
                    Autocontrole
                  </h4>
                  <p className="text-primary-200 text-sm sm:text-base">
                    Dominar as emoções e manter o equilíbrio em todas as
                    situações
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <span className="text-2xl sm:text-3xl">🌱</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold mb-2 md:mb-3">
                    Melhoria Contínua
                  </h4>
                  <p className="text-primary-200 text-sm sm:text-base">
                    Buscar constantemente o aperfeiçoamento pessoal e coletivo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ClientOnly>
  );
}
