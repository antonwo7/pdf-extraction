import { Body, Controller, Get, Post } from '@nestjs/common'
import { ShareService } from 'src/common/services/share.service'
import { OpeAIService } from 'src/common/services/openai.service'

@Controller('process')
export class ProcessController {
	constructor(
		private readonly shareService: ShareService,
		private readonly opeAIService: OpeAIService,
	) {}

	@Get('token')
	async token() {
		const result = await this.shareService.getAccessToken()
		return result
	}

	@Get('files')
	async files() {
		const result = await this.shareService.getFiles()
		return result
	}

	@Get('test')
	async test() {
		const result = await this.opeAIService.analizeText('denuncia', `
			INFORME DE DENUNCIA (RESUMEN)

Denunciante: Sergio Ortiz Romero | DNI 47000111X | Domicilio: C/ Feria 9, 41003
Sevilla
Fecha de la denuncia: 05/11/2025

Dispositivo: tablet propia (Android).

Contacto de estafadores: llamada telefónica (28/10/2025). Script: se identifican
como “Seguridad Banco Centro”, indican “riesgo inminente” y solicitan
instalación de un perfil MDM para “proteger” el equipo.

Software instalado: Perfil MDM (descarga vía enlace). Control remoto: Sí, acceso
y visualización de pantalla.

Operativa fraudulenta:

* 28/10/2025 | Transferencia | 1.300,00 € | Destino: ES19 2100 0418 4502 7777
0001 | “Pago proveedor”

* 29/10/2025 | Bizum | 350,00 € | Destino: ES83 2038 5778 9830 7777
0002 | “Bizum urgente”

Total: 1.650,00 €

Cuentas destino: ES1921000418450277770001; ES8320385778983077770002.

Medidas adoptadas: bloqueo de banca, cambio de contraseñas, denuncia ante
entidad.

Solicitud: investigación e identificación de autores, y reversión de importes si
procede.

Firma del denunciante: Lugar y fecha: Sevilla,
05/11/2025
			`)
		return result
	}
}
