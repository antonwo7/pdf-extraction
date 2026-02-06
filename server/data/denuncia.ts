export default {
  fields: {
    dispositivoPropio: {
      description: `Indica si las operaciones fraudulentas se han realizado desde un dispositivo propiedad del denunciante (móvil, portátil, ordenador de casa, etc.) o desde otro dispositivo (por ejemplo, un ordenador de la oficina del banco, locutorio, etc.).  
📍 Busca frases como "desde mi móvil", "desde mi ordenador personal", "desde el ordenador del banco", "desde un dispositivo ajeno", etc.  
📍 Si el texto indica que usa su propio móvil, portátil u ordenador, responde "Sí, desde dispositivo propio".  
📍 Si el texto indica claramente que se usó un dispositivo de terceros (banco, gestoría, locutorio, otra persona), responde "No, desde dispositivo ajeno".  
📍 Si no queda claro en el texto, deja una cadena vacía.  
📌 Responde con una frase corta, por ejemplo: "Sí, desde dispositivo propio" o "No, desde dispositivo ajeno".`,
      title: 'Disp. propio'
    },

    tipoDispositivo: {
      description: `Especifica el tipo principal de dispositivo desde el que se hicieron las operaciones fraudulentas.  
📍 Identifica si se trata de un "Móvil", "Portátil", "Ordenador de sobremesa", "Tablet" u otro tipo de dispositivo claramente descrito en la denuncia.  
📍 Busca expresiones como "teléfono móvil", "smartphone", "ordenador portátil", "laptop", "PC", "tablet", etc.  
📍 Si hay varios dispositivos mencionados, indica el dispositivo desde el que se realizaron las operaciones (no el que solo se usa para llamadas o recepción de SMS).  
📍 Si no se especifica el tipo de dispositivo, deja una cadena vacía.  
📌 Responde solo con el tipo de dispositivo, por ejemplo: "Móvil", "Portátil" o "Ordenador de sobremesa".`,
      title: 'Tipo dispositivo'
    },

    llamadaMalos: {
      description: `Indica si existe o no una llamada telefónica de los estafadores ("los malos") relacionada con los hechos descritos en la denuncia.  
📍 Busca si el denunciante menciona que recibió una llamada sospechosa, de supuestos empleados del banco, de un falso servicio técnico, de la policía, de la Agencia Tributaria, etc.  
📍 Si se menciona claramente una llamada de los estafadores, responde "Sí".  
📍 Si la denuncia indica que todo fue por SMS, correo, WhatsApp o web sin llamada, responde "No".  
📍 Si no queda claro, deja una cadena vacía.  
📌 Responde únicamente "Sí" o "No".`,
      title: 'Llamada estafadores'
    },

    contenidoLlamada: {
      description: `Resume brevemente qué le dicen los estafadores al denunciante durante la llamada.  
📍 Extrae el contenido esencial de la llamada: quién dicen que son (banco, policía, soporte técnico, etc.), cuál es el motivo aparente (bloqueo de cuenta, cargos sospechosos, devolución de un pago, premio, incidencia con Bizum, etc.) y qué le piden al denunciante (claves, código SMS, instalar programa, acceder a la app del banco, etc.).  
📍 No hace falta copiar literalmente todo el texto; haz un resumen claro en 2–4 frases como máximo.  
📍 Si no hay llamada o no se describe su contenido, deja una cadena vacía.  
📌 Responde con un resumen breve en lenguaje natural, por ejemplo: "Se hacen pasar por el banco, le informan de cargos supuestamente fraudulentos y le piden que facilite códigos SMS para cancelar las operaciones".`,
      title: 'Contenido llamada'
    },

    instalacionSoftware: {
      description: `Indica si en el dispositivo del denunciante se ha instalado algún software o aplicación a petición de los estafadores (por ejemplo, programas de control remoto, aplicaciones bancarias falsas, etc.).  
📍 Busca referencias a aplicaciones como AnyDesk, TeamViewer, UltraViewer u otros programas de escritorio remoto, así como apps sospechosas instaladas en el móvil.  
📍 Si la denuncia indica claramente que el denunciante instaló un programa o aplicación a petición de los "técnicos", "soporte" o "empleados del banco", describe brevemente qué se instaló.  
📍 Si se indica expresamente que no se instaló nada o no hay mención a instalación de software, responde "No" o deja cadena vacía según corresponda.  
📌 Responde con una frase corta, por ejemplo: "Sí, instaló AnyDesk", "Sí, instaló aplicación de acceso remoto" o "No consta instalación de software".`,
      title: 'Instalación software'
    },

    controlRemoto: {
      description: `Indica si los estafadores llegaron a tener control remoto del dispositivo del denunciante.  
📍 Busca expresiones como "tomaron el control del ordenador", "podían manejar el ratón", "veían la pantalla", "control remoto", "se conectaron a mi móvil/ordenador", etc.  
📍 Si se indica explícitamente que los estafadores pudieron manejar el dispositivo o ver la pantalla en tiempo real, responde "Sí" (puedes añadir brevemente el medio, por ejemplo "Sí, a través de AnyDesk").  
📍 Si el texto indica que no hubo control remoto o solo se menciona instalación sin llegar a conectarse, responde "No".  
📍 Si no se menciona nada, deja una cadena vacía.  
📌 Responde de forma muy breve, por ejemplo: "Sí, control remoto con AnyDesk" o "No".`,
      title: 'Control remoto'
    },

    datosOperativaFraudulenta: {
      description: `Describe de forma resumida la operativa fraudulenta: qué tipo de operaciones se realizaron, cómo y en qué contexto.  
📍 Incluye solo la parte relacionada con las operaciones fraudulentas: transferencias, Bizum, pagos con tarjeta, compras online, retirada de efectivo, etc.  
📍 Señala, si se menciona, desde qué cuenta se hicieron las operaciones, hacia qué tipo de destino (otras cuentas, tarjetas, monederos digitales), y si se realizaron de forma continuada en un corto periodo de tiempo.  
📍 No es necesario detallar cada importe aquí si ya hay un campo específico para ello; céntrate en la descripción del patrón de fraude.  
📍 Si el documento no describe la operativa, deja una cadena vacía.  
📌 Responde con un párrafo corto (2–5 frases) describiendo la secuencia principal de las operaciones fraudulentas.`,
      title: 'Operativa fraudulenta'
    },

    importeOperaciones: {
      description: `Indica el importe total de las operaciones fraudulentas denunciadas.  
📍 Suma todos los cargos, transferencias, Bizum u otras operaciones que el denunciante considera fraudulentas.  
📍 Si en la denuncia se indica claramente un importe total de lo defraudado, utiliza ese total.  
📍 Escribe solo el número, sin símbolo de euro ni texto adicional.  
📍 Usa coma o punto como separador decimal según aparezca en el documento (por ejemplo "1250,50" o "1250.50").  
📍 Si hay varios importes pero no consta un total claro y no se puede deducir con seguridad, deja una cadena vacía.  
📌 Responde únicamente con el importe total en formato numérico, por ejemplo: "1250,50".`,
      title: 'Importe operaciones'
    },

    fechasOperaciones: {
      description: `Indica las fechas en las que se realizaron las operaciones fraudulentas.  
📍 Extrae todas las fechas asociadas a cargos, transferencias, Bizum o pagos no autorizados descritos en la denuncia.  
📍 Devuelve las fechas en formato DD/MM/AAAA.  
📍 Si hay varias operaciones en distintas fechas, incluye todas las fechas separadas por comas en orden cronológico (por ejemplo: "01/10/2025, 03/10/2025, 05/10/2025").  
📍 Si solo se especifica un día en el que se concentran todas las operaciones, indica únicamente esa fecha.  
📍 Si no se indican fechas de las operaciones, deja una cadena vacía.  
📌 Responde con una o varias fechas en formato DD/MM/AAAA, separadas por comas si son varias.`,
      title: 'Fechas operaciones'
    },

    fechaDenuncia: {
      description: `Indica la fecha en la que se presenta la denuncia ante la policía, Guardia Civil u otro cuerpo competente.  
📍 Normalmente aparece al principio o al final de la denuncia, junto al lugar ("En Alicante, a 15 de octubre de 2025") o en un encabezado oficial.  
📍 Convierte la fecha al formato DD/MM/AAAA, aunque en el texto aparezca escrita en palabras ("quince de octubre de dos mil veinticinco").  
📍 Si no se encuentra la fecha de la denuncia, deja una cadena vacía.  
📌 Responde únicamente con la fecha de denuncia en formato DD/MM/AAAA, por ejemplo: "15/10/2025".`,
      title: 'Fecha denuncia'
    },

    denuncianteNombreDni: {
      description: `Extrae el nombre completo y el DNI del denunciante (la persona que comparece y firma la denuncia).  
📍 Busca la parte del texto donde se identifica al denunciante, por ejemplo: "D./Dña. Juan Pérez García, con DNI 12345678A...".  
📍 Devuelve el nombre y el DNI en una sola cadena, en el orden "Nombre Apellidos - DNI".  
📍 No añadas texto adicional como "D./Dña." ni frases de contexto.  
📍 Si no se indica el DNI pero sí el nombre, devuelve solo el nombre; si falta todo, deja cadena vacía.  
📌 Ejemplo de respuesta: "Juan Pérez García - 12345678A".`,
      title: 'Denunciante (Nombre/DNI)'
    },

    estafadoNombreDniCif: {
      description: `Indica el nombre y DNI/CIF de la persona o entidad realmente perjudicada económicamente por el fraude, cuando sea distinta del denunciante.  
📍 Puede tratarse, por ejemplo, de un familiar, una empresa o un tercero cuyo dinero se ha visto afectado, y en nombre de quien denuncia otra persona.  
📍 Devuelve el dato en el formato "Nombre completo - DNI" si es persona física, o "Nombre entidad - CIF" si es empresa.  
📍 Si el denunciante y el estafado son la misma persona y no aparece un tercero claramente identificado como perjudicado, deja este campo vacío.  
📍 Si se menciona un tercero perjudicado sin DNI/CIF, devuelve al menos el nombre.  
📌 Ejemplos de respuesta: "María López Sánchez - 23456789B" o "Empresa XYZ S.L. - B12345678".`,
      title: 'Estafado (Nombre y DNI/CIF)'
    },

    cuentasDestinoOperaciones: {
      description: `Indica las cuentas de destino (normalmente IBAN) a las que se han enviado las operaciones fraudulentas.  
📍 Busca números de cuenta o IBAN que aparezcan como cuentas receptoras de transferencias, Bizum u otros movimientos denunciados.  
📍 Devuelve todos los IBAN de destino separados por comas, sin texto adicional.  
📍 Mantén el formato de IBAN tal y como aparezca en el documento (con o sin espacios), pero es preferible sin espacios si se puede reconstruir claramente.  
📍 Si no se mencionan cuentas de destino, deja una cadena vacía.  
📌 Ejemplo de respuesta: "ES7621000418401234567891, ES1720859876123456789012".`,
      title: 'Cuentas destino'
    }
  },

  textBegin: `Extrae y devuelve los datos de esta denuncia por estafa o fraude bancario exclusivamente en formato JSON.  
⚠️ Devuelve solo el JSON — sin ninguna explicación, sin texto adicional, sin encabezados, títulos ni comentarios.

Usa exactamente la estructura de campos indicada para este tipo de documento ("denuncias").

Para cada campo, debes devolver un objeto con esta estructura exacta:
{
  "nombreDelCampo": {
    "value": "<valor normalizado en forma de texto>",
    "sourceText": "<fragmento exacto del documento donde aparece el dato, o cadena vacía>",
    "source_sentence": "<frase u oración del documento que contiene el fragmento anterior, o cadena vacía>"
  }
}
  
Si algún dato no está presente en el documento, deja una cadena vacía en ese campo:`,

  fullTextBegin: `Aquí tienes el texto completo de una denuncia presentada ante la policía/Guardia Civil por una posible estafa o fraude bancario (operaciones no autorizadas, Bizum, transferencias, pagos con tarjeta, etc.).  
Extrae y devuelve exclusivamente los datos solicitados en formato JSON, sin explicaciones ni texto adicional.  
Usa la estructura exacta de campos definida para el tipo de documento "denuncias".  
Si algún dato no se encuentra, deja el valor como cadena vacía:`,

  textEnd: `

Devuelve únicamente el objeto JSON completo con todos los campos y valores extraídos.  
No añadas ningún comentario, explicación ni texto fuera del JSON.`
};
