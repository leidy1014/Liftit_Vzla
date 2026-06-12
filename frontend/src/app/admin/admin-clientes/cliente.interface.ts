export interface Cliente {
    id: number;
    nombre: string;
    telefono: string;
    email?: string;
    documento?: string;
    activo: boolean;
}
