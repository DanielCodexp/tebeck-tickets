export interface Product{
    _id? : string;
    Nombre?: string;
    ClaveProdServ: string;
    ClaveUnidad: string;
    Unidad: string;
    Descripcion: string;
    ValorUnitario: number;
    ObjetoImp?: string;
}