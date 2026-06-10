// CODIGO ANTERIOR CON MOCK API

// const API_URL = 'https://6a1f5b65b79eec0d6cf0ade8.mockapi.io/ResultadosReales'

// export const resultadosRealesAPI = {
//   obtenerResultados: async () => {
//     const response = await fetch(API_URL)
//     if (!response.ok) throw new Error('Error al obtener resultados')
//     return await response.json()
//   },

//   guardarResultado: async (resultado) => {
//     const response = await fetch(API_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(resultado)
//     })
//     if (!response.ok) throw new Error('Error al guardar resultado')
//     return await response.json()
//   },

//   limpiarTodos: async () => {
//     const resultados = await resultadosRealesAPI.obtenerResultados()
//     for (const resultado of resultados) {
//       await fetch(`${API_URL}/${resultado.id}`, { method: 'DELETE' })
//     }
//   }
// }

// CODIGO NUEVO CON MOCKACHINO

const API_URL = 'https://www.mockachino.com/5a5f72ee-1053-44/resultadosReales'

export const resultadosRealesAPI = {
  obtenerResultados: async () => {
    const response = await fetch(API_URL)
    if (!response.ok) throw new Error('Error al obtener resultados')
    const data = await response.json()
    return data.resultados
  }
}

